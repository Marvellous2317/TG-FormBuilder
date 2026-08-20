import { Op } from "sequelize";
import {
  Checklist,
  ChecklistEntry,
  ChecklistAssignment,
  ChecklistApprover,
  SubmittedChecklist,
  SubmittedChecklistEntry,
  SubmittedChecklistApproval,
  User,
  Role,
  Company,
  Department,
  Catalog,
  VersionChecklist,
  VersionChecklistEntry,
  UserCompany,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";

import { sendAssignmentEmail, sendApproverAssignmentEmail } from "../../../views/index.js";
import { AzureImageDownloader, uploadChecklistImageValue } from "../../../utils/azureService.js";

const isOptionalSubmittedEntry = (entry) => entry?.image || entry?.section_formular || entry?.type === "image" || entry?.type === "section_formular";

// The application-level duplicate check is a read followed by a write, so two
// concurrent requests can both pass it. The unique index is the real guarantee —
// translate its error into the same 400 the pre-check would have returned.
function asDuplicateChecklistError(error) {
  if (error?.name !== "SequelizeUniqueConstraintError") return null;

  const fields = Object.keys(error.fields || {});
  if (fields.includes("documentNumber")) {
    return new ApplicationError("Document number already exists for this company", 400);
  }
  if (fields.includes("title")) {
    return new ApplicationError("Checklist with the same title already exists for this company", 400);
  }
  return new ApplicationError("Checklist already exists", 400);
}

function deriveAssignmentStatus(submissions = []) {
  if (!submissions || submissions.length === 0) return "pending";
  const latest = submissions[0];
  if (latest.status === "approved") return "approved";
  if (latest.status === "rejected") return "rejected";
  return "submitted"; 
}

async function hydrateSubmittedEntryImages(submission) {
  if (!submission?.entries?.length) return submission;

  await Promise.all(submission.entries.map(async (entry) => {
    if (!entry.image) return;

    const imageUrl = entry.image;
    const image = await AzureImageDownloader(imageUrl);
    entry.setDataValue("imageUrl", imageUrl);
    entry.setDataValue("image", image);
  }));

  return submission;
}

export class AdminRepository {

  // A user may only be attached to a checklist in a company they belong to.
  // Membership lives in UserCompany; user.companyId is their active workspace.
  static async _assertCompanyMembership(user, companyId, transaction) {
    if (!companyId) return;
    if (user.companyId === companyId) return;

    const membership = await UserCompany.findOne({
      where: { userId: user.userId, companyId },
      transaction,
    });
    if (!membership) {
      throw new ApplicationError(
        `User ${user.userId} does not belong to the company this checklist belongs to`,
        403
      );
    }
  }

  static async _setChecklistApprovers(checklistId, companyId, approvers, transaction) {
    if (approvers === undefined) return [];

    const existingApproverIds = (await ChecklistApprover.findAll({
      where: { checklistId },
      attributes: ['approverId'],
      transaction,
    })).map(a => a.approverId);

    await ChecklistApprover.destroy({ where: { checklistId }, transaction });
    if (!Array.isArray(approvers) || approvers.length === 0) return [];

    const seen = new Set();
    const rows = [];
    const createdApprovers = [];
    for (const [index, item] of approvers.entries()) {
      const approverId = typeof item === "string" ? item : item.approverId;
      if (!approverId || seen.has(approverId)) continue;
      seen.add(approverId);

      const approver = await User.findByPk(approverId, {
        include: [{ model: Role, as: "role" }],
        transaction,
      });
      if (!approver) throw new ApplicationError(`Approver ${approverId} not found`, 404);
      if (approver.role?.roleName === "operator") {
        throw new ApplicationError(`User ${approverId} does not have the approval role`, 400);
      }
      await this._assertCompanyMembership(approver, companyId, transaction);

      const step = typeof item === "object" && item.step !== undefined ? Number(item.step) : index;
      rows.push({ checklistId, approverId, step, companyId: companyId || approver.companyId || null });
      
      if (!existingApproverIds.includes(approverId)) {
        createdApprovers.push({ approver, step });
      }
    }

    if (rows.length > 0) {
      await ChecklistApprover.bulkCreate(rows, { transaction });

      await this._syncPendingSubmissionApprovals(checklistId, rows, transaction);
    }

    return createdApprovers;
  }

  static async _syncPendingSubmissionApprovals(checklistId, newApproverConfigs, transaction) {
    const pendingSubmissions = await SubmittedChecklist.findAll({
      where: { status: "pending" },
      include: [{
        model: ChecklistAssignment,
        as: "assignment",
        where: { checklistId },
        attributes: ["assignmentId"],
      }],
      attributes: ["submittedChecklistId"],
      transaction,
    });

    if (pendingSubmissions.length === 0) return;

    const submissionIds = pendingSubmissions.map(s => s.submittedChecklistId);
    await SubmittedChecklistApproval.destroy({
      where: {
        submittedChecklistId: { [Op.in]: submissionIds },
        status: "pending",
      },
      transaction,
    });
    const newApprovalRecords = [];
    for (const submissionId of submissionIds) {
      for (const config of newApproverConfigs) {
        const existingDecision = await SubmittedChecklistApproval.findOne({
          where: {
            submittedChecklistId: submissionId,
            approverId: config.approverId,
            status: { [Op.ne]: "pending" },
          },
          transaction,
        });
        
        if (!existingDecision) {
          newApprovalRecords.push({
            submittedChecklistId: submissionId,
            approverId: config.approverId,
            step: config.step,
            status: "pending",
          });
        }
      }
    }

    if (newApprovalRecords.length > 0) {
      await SubmittedChecklistApproval.bulkCreate(newApprovalRecords, { 
        transaction,
        ignoreDuplicates: true,
      });
    }
  }

    static async _setChecklistOperators(checklistId, companyId, operators, assignedBy, transaction) {
    if (operators === undefined) return [];
    const desired = [];
    const seen = new Set();
    const operatorMap = new Map();
    if (Array.isArray(operators)) {
      for (const operatorId of operators) {
        if (!operatorId || seen.has(operatorId)) continue;
        seen.add(operatorId);

        const operator = await User.findByPk(operatorId, {
          include: [{ model: Role, as: "role" }],
          transaction,
        });
        if (!operator) throw new ApplicationError(`Operator ${operatorId} not found`, 404);
        if (operator.role?.roleName !== "operator") {
          throw new ApplicationError(`User ${operatorId} is not an operator`, 400);
        }
        await this._assertCompanyMembership(operator, companyId, transaction);
        desired.push(operatorId);
        operatorMap.set(operatorId, operator);
      }
    }

    const existingAssignments = await ChecklistAssignment.findAll({
      where: { checklistId },
      transaction,
    });
    const existingByOperator = new Map(existingAssignments.map((a) => [a.assignedTo, a]));
    for (const assignment of existingAssignments) {
      if (desired.includes(assignment.assignedTo)) continue;
      if (!assignment.active) continue;

      const pendingSubmissions = await SubmittedChecklist.count({
        where: { assignmentId: assignment.assignmentId, status: "pending" },
        transaction,
      });
      if (pendingSubmissions > 0) {
        throw new ApplicationError(
          `Cannot unassign operator with ${pendingSubmissions} pending submission(s). Please resolve pending submissions first.`,
          400
        );
      }
      await assignment.update({ active: false }, { transaction });
    }

    const created = [];
    for (const operatorId of desired) {
      const operator = operatorMap.get(operatorId);
      const existing = existingByOperator.get(operatorId);

      if (existing) {
        if (!existing.active) {
          const assignment = await existing.update(
            { active: true, assignedBy, companyId: companyId || operator.companyId || null },
            { transaction },
          );
          created.push({ assignment, operator });
        }
        continue;
      }

      const assignment = await ChecklistAssignment.create({
        checklistId,
        assignedTo: operatorId,
        assignedBy,
        companyId: companyId || operator.companyId || null,
      }, { transaction });
      created.push({ assignment, operator });
    }

    return created;
  }


  static async _snapshotChecklistVersion(checklistId, versionedBy, transaction) {
    const checklist = await Checklist.findByPk(checklistId, {
      include: [{ model: ChecklistEntry, as: "entries" }],
      transaction,
    });
    if (!checklist) return null;

    const lastVersion = await VersionChecklist.max("version", {
      where: { checklistId },
      transaction,
    });
    const version = (Number.isFinite(lastVersion) ? lastVersion : 0) + 1;

    const versionRow = await VersionChecklist.create(
      {
        checklistId: checklist.checklistId,
        version,
        title: checklist.title,
        documentNumber: checklist.documentNumber,
        companyId: checklist.companyId,
        departmentId: checklist.departmentId,
        frequency: checklist.frequency,
        frequencyInterval: checklist.frequencyInterval,
        approvalMode: checklist.approvalMode,
        createdBy: checklist.createdBy,
        updatedBy: checklist.updatedBy,
        versionedBy: versionedBy || null,
      },
      { transaction }
    );

    const entries = checklist.entries || [];
    if (entries.length > 0) {
      const entryRows = entries.map((e) => ({
        versionChecklistId: versionRow.versionChecklistId,
        checklistId: checklist.checklistId,
        version,
        entryId: e.entryId,
        name: e.name,
        type: e.type,
        section: e.section,
        image: e.image,
        section_formular: e.section_formular,
        config: e.config,
        order: e.order,
        required: e.required,
        options: e.options,
        formulaExpression: e.formulaExpression,
        metadata: e.metadata,
      }));
      await VersionChecklistEntry.bulkCreate(entryRows, { transaction });
    }

    return versionRow;
  }

  static async getChecklistVersions({ checklistId, version, departmentId, companyId, page = 1, limit = 20 }) {
    try {
      const where = {};
      if (companyId) where.companyId = companyId;
      if (checklistId) where.checklistId = checklistId;
      if (version !== undefined && version !== null && version !== "") where.version = Number(version);
      if (departmentId) where.departmentId = departmentId;

      const offset = (page - 1) * limit;
      const { rows: versions, count: total } = await VersionChecklist.findAndCountAll({
        where,
        include: [
          { model: Department, as: "department", attributes: ["departmentId", "departmentName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          { model: User, as: "versioner", attributes: ["userId", "firstName", "lastName"] },
          {
            model: VersionChecklistEntry,
            as: "entries",
            separate: true,
            order: [["order", "ASC"]],
          },
        ],
        order: [["checklistId", "ASC"], ["version", "DESC"]],
        limit,
        offset,
        distinct: true,
      });

      return {
        versions,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error(error);
      throw new ApplicationError("Failed to fetch checklist versions", 500);
    }
  }

  static async getChecklistVersionById(versionChecklistId, checklistId) {
    try {
      const version = await VersionChecklist.findByPk(versionChecklistId, {
        include: [
          { model: Department, as: "department", attributes: ["departmentId", "departmentName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          { model: User, as: "versioner", attributes: ["userId", "firstName", "lastName"] },
          {
            model: VersionChecklistEntry,
            as: "entries",
            separate: true,
            order: [["order", "ASC"]],
          },
        ],
        where: { checklistId },
      });

      if (!version) throw new ApplicationError("Checklist version not found", 404);
      return { version };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch checklist version", 500);
    }
  }

  static async createChecklist({ title, documentNumber, issuedNumber, entityDisplayName, companyId, departmentId, frequency, frequencyInterval, approvalMode, approvalRequired, approvers, operators, createdBy }) {
    const transaction = await sequelize.transaction();


    try {
      const existing = await Checklist.findOne({
        where: {
          companyId : companyId,
          [Op.or]: [
            { documentNumber },
            { title }
          ]
        },
        transaction,
      });
      
      if (existing) {
        if (existing.documentNumber === documentNumber) {
          throw new ApplicationError("Document number already exists", 400);
        }
        if (existing.title === title) {
          throw new ApplicationError("Checklist with the same title already exists", 400);
        }
      }

      if (departmentId) {
        const department = await Department.findByPk(departmentId, { transaction });
        if (!department) throw new ApplicationError("Department not found", 404);
      }

    
      if (frequency === "hourly" && (!frequencyInterval || frequencyInterval < 1)) {
        throw new ApplicationError("Frequency interval is required for hourly frequency and must be at least 1", 400);
      }
      const requiresApproval = approvalRequired === undefined ? true : approvalRequired;
      const checklist = await Checklist.create(
        {
          title,
          documentNumber,
          issuedNumber: issuedNumber || null,
          entityDisplayName: entityDisplayName || null,
          companyId,
          departmentId,
          frequency: frequency || null,
          frequencyInterval: frequency === "hourly" ? frequencyInterval : null,
          approvalMode: approvalMode || "sequential",
          approvalRequired: requiresApproval,
          createdBy
        },
        { transaction }
      );

      const createdApprovers = requiresApproval
        ? await this._setChecklistApprovers(checklist.checklistId, companyId, approvers, transaction)
        : [];
      const createdAssignments = await this._setChecklistOperators(checklist.checklistId, companyId, operators, createdBy, transaction);

      await transaction.commit();

   
      for (const { operator } of createdAssignments) {
        try {
          await sendAssignmentEmail({
            email: operator.email,
            firstName: operator.firstName,
            checklistTitle: checklist.title,
            documentNumber: checklist.documentNumber,
          });
        } catch (emailError) {
          console.error("Failed to send assignment email:", emailError);
        }
      }


      for (const { approver } of createdApprovers) {
        try {
          await sendApproverAssignmentEmail({
            email: approver.email,
            firstName: approver.firstName,
            checklistTitle: checklist.title,
            documentNumber: checklist.documentNumber,
          });
        } catch (emailError) {
          console.error("Failed to send approver assignment email:", emailError);
        }
      }

      return { checklist, message: "Checklist created successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      const duplicate = asDuplicateChecklistError(error);
      if (duplicate) throw duplicate;
      throw new ApplicationError(error.message || "Failed to create checklist", 500);
    }
  }


  static async searchChecklistByDocumentNumber({ documentNumber, companyIds, isSuperAdmin }) {
    try {
      const where = { documentNumber };
      if (!isSuperAdmin) where.companyId = { [Op.in]: companyIds };

      const checklists = await Checklist.findAll({
        where,
        include: [
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          { model: Department, as: "department", attributes: ["departmentId", "departmentName"] },
          { model: User, as: "creator", attributes: ["userId", "firstName", "lastName"] },
          {
            model: ChecklistEntry,
            as: "entries",
            separate: true,
            order: [["order", "ASC"]],
          },
        ],
        order: [["createdAt", "ASC"]],
      });


      if (checklists.length === 0) {
        throw new ApplicationError("Checklist not found for this document number", 404);
      }

            return { checklists, total: checklists.length, checklist: checklists[0] };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to search checklist", 500);
    }
  }

    static async duplicateChecklist({
    sourceChecklistId, title, documentNumber, issuedNumber, entityDisplayName,
    companyId, departmentId, frequency, frequencyInterval, approvalMode, approvalRequired,
    approvers, operators, entries, createdBy, isSuperAdmin,
  }) {
    const transaction = await sequelize.transaction();

    try {
      let source = null;
      if (sourceChecklistId) {
        source = await Checklist.findByPk(sourceChecklistId, {
          include: [{ model: ChecklistEntry, as: "entries" }],
          transaction,
        });
        if (!source) throw new ApplicationError("Source checklist not found", 404);
        if (!isSuperAdmin && source.companyId !== companyId) {
          throw new ApplicationError("Source checklist belongs to another company", 403);
        }
      }

      const pick = (value, sourceValue) => (value === undefined ? sourceValue : value);

      const resolved = {
        issuedNumber: pick(issuedNumber, source?.issuedNumber) ?? null,
        entityDisplayName: pick(entityDisplayName, source?.entityDisplayName) ?? null,
        departmentId: pick(departmentId, source?.departmentId) ?? null,
        frequency: pick(frequency, source?.frequency) ?? null,
        frequencyInterval: pick(frequencyInterval, source?.frequencyInterval) ?? null,
        approvalMode: pick(approvalMode, source?.approvalMode) || "sequential",
        approvalRequired: pick(approvalRequired, source?.approvalRequired) ?? true,
      };

      const existing = await Checklist.findOne({
        where: {
          companyId,
          [Op.or]: [{ documentNumber }, { title }],
        },
        transaction,
      });

      if (existing) {
        if (existing.documentNumber === documentNumber) {
          throw new ApplicationError("Document number already exists for this company", 400);
        }
        throw new ApplicationError("Checklist with the same title already exists for this company", 400);
      }

      if (resolved.departmentId) {
        const department = await Department.findByPk(resolved.departmentId, { transaction });
        if (!department) throw new ApplicationError("Department not found", 404);
      }

      if (resolved.frequency === "hourly" && (!resolved.frequencyInterval || resolved.frequencyInterval < 1)) {
        throw new ApplicationError("Frequency interval is required for hourly frequency and must be at least 1", 400);
      }

      const checklist = await Checklist.create(
        {
          title,
          documentNumber,
          issuedNumber: resolved.issuedNumber,
          entityDisplayName: resolved.entityDisplayName,
          companyId,
          departmentId: resolved.departmentId,
          frequency: resolved.frequency,
          frequencyInterval: resolved.frequency === "hourly" ? resolved.frequencyInterval : null,
          approvalMode: resolved.approvalMode,
          approvalRequired: resolved.approvalRequired,
          createdBy,
        },
        { transaction }
      );

      const sourceEntries = Array.isArray(entries)
        ? entries
        : [...(source?.entries || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      let createdEntries = [];
      if (sourceEntries.length > 0) {
        const entryData = sourceEntries.map((e, index) => ({
          checklistId: checklist.checklistId,
          name: e.name,
          type: e.type || "text",
          section: e.section || null,
          image: e.image || false,
          section_formular: e.section_formular || null,
          order: e.order ?? index,
          required: e.required || false,
          options: e.options || null,
          formulaExpression: e.formulaExpression || null,
          metadata: e.metadata || null,
          config: e.config || null,
        }));
        createdEntries = await ChecklistEntry.bulkCreate(entryData, { transaction });
      }

      let resolvedApprovers = approvers;
      if (resolvedApprovers === undefined && source) {
        const sourceApprovers = await ChecklistApprover.findAll({
          where: { checklistId: source.checklistId },
          attributes: ["approverId", "step"],
          transaction,
        });
        resolvedApprovers = sourceApprovers.map((a) => ({ approverId: a.approverId, step: a.step }));
      }

      let resolvedOperators = operators;
      if (resolvedOperators === undefined && source) {
        const sourceAssignments = await ChecklistAssignment.findAll({
          where: { checklistId: source.checklistId, active: true },
          attributes: ["assignedTo"],
          transaction,
        });
        resolvedOperators = sourceAssignments.map((a) => a.assignedTo);
      }

      const createdApprovers = resolved.approvalRequired
        ? await this._setChecklistApprovers(checklist.checklistId, companyId, resolvedApprovers, transaction)
        : [];
      const createdAssignments = await this._setChecklistOperators(
        checklist.checklistId, companyId, resolvedOperators, createdBy, transaction
      );

      await transaction.commit();

      for (const { operator } of createdAssignments) {
        try {
          await sendAssignmentEmail({
            email: operator.email,
            firstName: operator.firstName,
            checklistTitle: checklist.title,
            documentNumber: checklist.documentNumber,
          });
        } catch (emailError) {
          console.error("Failed to send assignment email:", emailError);
        }
      }

      for (const { approver } of createdApprovers) {
        try {
          await sendApproverAssignmentEmail({
            email: approver.email,
            firstName: approver.firstName,
            checklistTitle: checklist.title,
            documentNumber: checklist.documentNumber,
          });
        } catch (emailError) {
          console.error("Failed to send approver assignment email:", emailError);
        }
      }

      return { checklist, entries: createdEntries, message: "Checklist duplicated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      const duplicate = asDuplicateChecklistError(error);
      if (duplicate) throw duplicate;
      throw new ApplicationError(error.message || "Failed to duplicate checklist", 500);
    }
  }

  static async getChecklists({ companyId, departmentId, status, page = 1, limit = 20, search, startDate, endDate, deleted }) {
    try {
      const where = {};
      

      let paranoid = true;
      if (deleted === "true") {
        paranoid = false;
        where.deletedAt = { [Op.ne]: null };
      } else if (deleted === "all") {
        paranoid = false;
      }
      
      if (companyId) where.companyId = companyId;
      if (departmentId) where.departmentId = departmentId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { documentNumber: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if(status) {
        where.status = status;
      } 

      const offset = (page - 1) * limit;
      const { rows: checklists, count: total } = await Checklist.findAndCountAll({
        where,
        include: [
          { model: User, as: "creator", attributes: ["userId", "firstName", "lastName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          { model: Department, as: "department", attributes: ["departmentId", "departmentName"] },
          {
            model: ChecklistAssignment, as: "assignments",
            attributes: ["assignmentId"],
            where: { active: true },
            required: false,
            include: [
              { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
            ],
          },
          {
            model: ChecklistApprover, as: "approverConfigs",
            include: [
              { model: User, as: "approver", attributes: ["userId", "firstName", "lastName", "email"] },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        distinct: true,
        paranoid,
      });

      return {
        checklists,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error(error);
      throw new ApplicationError("Failed to fetch checklists", 500);
    }
  }

  static async getChecklistById(checklistId) {
    try {
      const checklist = await Checklist.findByPk(checklistId, {
        include: [
          { model: User, as: "creator", attributes: ["userId", "firstName", "lastName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          { model: Department, as: "department", attributes: ["departmentId", "departmentName"] },
          {
            model: ChecklistEntry,
            as: "entries",
            order: [["order", "ASC"]],
          },
          {
            model: ChecklistApprover,
            as: "approverConfigs",
            include: [
              { model: User, as: "approver", attributes: ["userId", "firstName", "lastName", "email"] },
            ],
          },
        ],
        order: [[{ model: ChecklistEntry, as: "entries" }, "order", "ASC"]],
      });

      if (!checklist) throw new ApplicationError("Checklist not found", 404);
      return { checklist };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch checklist", 500);
    }
  }

  static async getSubmittedChecklistsByChecklistId(checklistId, companyId, { status, search, page = 1, limit = 20 }) {
    try {
      const checklist = await Checklist.findOne({ where: { checklistId, companyId } });
      if (!checklist) throw new ApplicationError("Checklist not found", 404);

      const where = { companyId };
      if (status) where.status = status;
      if (search) where.documentNumber = { [Op.iLike]: `%${search}%` };

      const offset = (page - 1) * limit;
      const { rows: submissions, count: total } = await SubmittedChecklist.findAndCountAll({
        where,
        attributes: ["submittedChecklistId", "documentNumber", "title", "issuedNumber", "entityDisplayName", "status", "submittedAt", "createdAt", "updatedAt"],
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            attributes: ["assignmentId", "checklistId"],
            where: { checklistId, companyId },
            include: [
              { model: Checklist, as: "checklist", attributes: ["checklistId", "title", "documentNumber", "issuedNumber", "entityDisplayName"] },
              { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
            ],
          },
          { model: User, as: "approver", attributes: ["userId", "firstName", "lastName"] },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        submissions,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch submissions", 500);
    }
  }

  static async getSubmittedChecklistById(checklistId, submittedChecklistId, companyId) {
    try {
      const submission = await SubmittedChecklist.findOne({
        where: { submittedChecklistId, companyId },
        attributes: ["submittedChecklistId", "documentNumber", "title", "issuedNumber", "entityDisplayName", "status", "submittedAt", "createdAt", "updatedAt"],
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            attributes: ["assignmentId", "checklistId"],
            where: { checklistId, companyId },
            include: [
              { model: Checklist, as: "checklist", attributes: ["checklistId", "title", "documentNumber", "issuedNumber", "entityDisplayName"] },
              { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
            ],
          },
          { model: User, as: "approver", attributes: ["userId", "firstName", "lastName"] },
          {
            model: SubmittedChecklistEntry,
            as: "entries",
            attributes: ["id", "entryId", "formulaExpression", "options", "required", "config", "name", "value", "type", "image", "section_formular", "status", "section", "order"],
          },
        ],
        order: [[{ model: SubmittedChecklistEntry, as: "entries" }, "order", "ASC"]],
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      await hydrateSubmittedEntryImages(submission);
      return { submission };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch submission", 500);
    }
  }

  static async updateSubmittedChecklistEntry(checklistId, submittedChecklistId, companyId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await SubmittedChecklist.findOne({
        where: { submittedChecklistId, companyId },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            where: { checklistId, companyId },
            include: [{ model: Checklist, as: "checklist", include: [{ model: ChecklistEntry, as: "entries" }] }],
          },
        ],
        transaction,
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);

      const requiredEntries = submission.assignment.checklist.entries.filter((e) => e.required && !isOptionalSubmittedEntry(e));
      const responseMap = new Map(data.map((r) => [r.entryId, r.value ?? r.image]));

      for (const entry of requiredEntries) {
        const value = responseMap.get(entry.entryId);
        if (value === undefined || value === null || value === "") {
          throw new ApplicationError(`Field "${entry.name}" is required`, 400);
        }
      }

      const existingEntries = await SubmittedChecklistEntry.findAll({
        where: { submittedChecklistId },
        transaction,
      });
      const existingMap = new Map(existingEntries.map((entry) => [entry.entryId, entry]));

      for (const item of data) {
        const existing = existingMap.get(item.entryId);
        if (!existing) throw new ApplicationError(`Entry ${item.entryId} not found in submission`, 404);

        const updates = {};
        if (item.image !== undefined) {
          updates.image = await uploadChecklistImageValue(item.image, existing.name || "image");
          if (item.value === undefined) updates.value = updates.image;
        } else if (existing.image && item.value !== undefined) {
          updates.image = await uploadChecklistImageValue(item.value, existing.name || "image");
          updates.value = updates.image;
        } else if (item.value !== undefined) {
          updates.value = item.value;
        }

        if (item.section_formular !== undefined) updates.section_formular = item.section_formular;

        await existing.update(updates, { transaction });
      }

      await transaction.commit();
      return { submittedChecklist: submission, message: "Submission entries updated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update submission entries", 500);
    }
  }

  static async updateChecklist(checklistId, { title, documentNumber, issuedNumber, entityDisplayName, departmentId, frequency, frequencyInterval, approvalMode, approvalRequired, approvers, operators, updatedBy }) {
    const transaction = await sequelize.transaction();
    try {
      const checklist = await Checklist.findByPk(checklistId, { transaction });
      if (!checklist) throw new ApplicationError("Checklist not found", 404);

    
      await this._snapshotChecklistVersion(checklistId, updatedBy, transaction);

      if (documentNumber && documentNumber !== checklist.documentNumber) {
        const existing = await Checklist.findOne({
          where: { documentNumber, companyId: checklist.companyId, checklistId: { [Op.ne]: checklistId } },
          transaction,
        });
        if (existing) throw new ApplicationError("Document number already exists", 400);
      }


      if (departmentId !== undefined) {
        if (departmentId) {
          const department = await Department.findByPk(departmentId, { transaction });
          if (!department) throw new ApplicationError("Department not found", 404);
          checklist.departmentId = departmentId;
        } else {
          checklist.departmentId = null;
        }
      }

      if (frequency !== undefined) {
        if (frequency === "hourly" && (!frequencyInterval || frequencyInterval < 1)) {
          throw new ApplicationError("Frequency interval is required for hourly frequency and must be at least 1", 400);
        }
        checklist.frequency = frequency || null;
        checklist.frequencyInterval = frequency === "hourly" ? frequencyInterval : null;
      } else if (frequencyInterval !== undefined && checklist.frequency === "hourly") {
        if (frequencyInterval < 1) {
          throw new ApplicationError("Frequency interval must be at least 1 for hourly frequency", 400);
        }
        checklist.frequencyInterval = frequencyInterval;
      }

      if (approvalMode !== undefined) checklist.approvalMode = approvalMode;
      if (approvalRequired !== undefined) checklist.approvalRequired = approvalRequired;
      if (issuedNumber !== undefined) checklist.issuedNumber = issuedNumber || null;
      if (entityDisplayName !== undefined) checklist.entityDisplayName = entityDisplayName || null;
      if (title) checklist.title = title;
      if (documentNumber) checklist.documentNumber = documentNumber;
      checklist.updatedBy = updatedBy;

      await checklist.save({ transaction });

      const effectiveApprovalRequired = approvalRequired !== undefined ? approvalRequired : checklist.approvalRequired;
      const createdApprovers = effectiveApprovalRequired
        ? await this._setChecklistApprovers(checklistId, checklist.companyId, approvers, transaction)
        : [];
      const createdAssignments = await this._setChecklistOperators(checklistId, checklist.companyId, operators, updatedBy, transaction);

      await transaction.commit();


      for (const { operator } of createdAssignments) {
        try {
          await sendAssignmentEmail({
            email: operator.email,
            firstName: operator.firstName,
            checklistTitle: checklist.title,
            documentNumber: checklist.documentNumber,
          });
        } catch (emailError) {
          console.error("Failed to send assignment email:", emailError);
        }
      }

      for (const { approver } of createdApprovers) {
        try {
          await sendApproverAssignmentEmail({
            email: approver.email,
            firstName: approver.firstName,
            checklistTitle: checklist.title,
            documentNumber: checklist.documentNumber,
          });
        } catch (emailError) {
          console.error("Failed to send approver assignment email:", emailError);
        }
      }

      return { checklist, message: "Checklist updated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      const duplicate = asDuplicateChecklistError(error);
      if (duplicate) throw duplicate;
      throw new ApplicationError("Failed to update checklist", 500);
    }
  }

  static async deleteChecklist(checklistId) {
    try {
      const checklist = await Checklist.findByPk(checklistId);
      if (!checklist) throw new ApplicationError("Checklist not found", 404);

      const activeAssignments = await ChecklistAssignment.count({
        where: { checklistId, active: true },
      });

      if (activeAssignments > 0) {
        throw new ApplicationError("Cannot delete checklist with active assignments", 400);
      }

     await ChecklistEntry.destroy({ where: { checklistId }, force: false });
     await checklist.destroy();
      return { message: "Checklist deleted successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      console.error(error);
      throw new ApplicationError("Failed to delete checklist", 500);
    }
  }

  static async restoreChecklist(checklistId) {
    try {
      const checklist = await Checklist.findByPk(checklistId, { paranoid: false });
      if (!checklist) throw new ApplicationError("Checklist not found", 404);
      
      if (!checklist.deletedAt) {
        throw new ApplicationError("Checklist is not deleted", 400);
      }

      await checklist.restore();
      await ChecklistEntry.restore({ where: { checklistId } });
      
      return { message: "Checklist restored successfully", checklist };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to restore checklist", 500);
    }
  }


  static async getEntries(checklistId) {
    try {
      const checklist = await Checklist.findByPk(checklistId);
      if (!checklist) throw new ApplicationError("Checklist not found", 404);

      const entries = await ChecklistEntry.findAll({
        where: { checklistId },
        order: [["order", "ASC"]],
      });
      return { entries };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch entries", 500);
    }
  }

  static async createEntries(checklistId, entries) {
    const transaction = await sequelize.transaction();
    try {
      const checklist = await Checklist.findByPk(checklistId);
      if (!checklist) throw new ApplicationError("Checklist not found", 404);
      const existingEntries = await ChecklistEntry.findOne({ where: { checklistId } } );
        if (existingEntries) throw new ApplicationError("Entries already exist for this checklist. Use update endpoint to modify.", 400);

      const entryData = entries.map((e, index) => ({
        checklistId,
        name: e.name,
        type: e.type || "text",
        section: e.section || null,
        image: e.image || false,
        section_formular: e.section_formular || null,
        order: e.order ?? index,
        required: e.required || false,
        options: e.options || null,
        formulaExpression: e.formulaExpression || null,
        metadata: e.metadata || null,
        config: e.config || null,
      }));

      const created = await ChecklistEntry.bulkCreate(entryData, { transaction });
      await transaction.commit();
      return { entries: created, message: "Entries created successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to create entries", 500);
    }
  }

  static async createOrUpdateEntries(checklistId, entries, userId) {
    const transaction = await sequelize.transaction();
    try {
      const checklist = await Checklist.findByPk(checklistId);
      if (!checklist) throw new ApplicationError("Checklist not found", 404);

      await this._snapshotChecklistVersion(checklistId, userId, transaction);

      const results = [];
      for (const [index, e] of entries.entries()) {
        if (e.entryId) {
          const entry = await ChecklistEntry.findOne({
            where: { entryId: e.entryId, checklistId },
            transaction,
          });
          if (!entry) throw new ApplicationError(`Entry ${e.entryId} not found`, 404);

          if (e.name !== undefined) entry.name = e.name;
          if (e.type !== undefined) entry.type = e.type;
          if (e.section !== undefined) entry.section = e.section || null;
          if (e.image !== undefined) entry.image = e.image || false;
          if (e.section_formular !== undefined) entry.section_formular = e.section_formular || null;
          if (e.order !== undefined) entry.order = e.order;
          if (e.required !== undefined) entry.required = e.required;
          if (e.options !== undefined) entry.options = e.options;
          if (e.formulaExpression !== undefined) entry.formulaExpression = e.formulaExpression;
          if (e.metadata !== undefined) entry.metadata = e.metadata;
          if (e.config !== undefined) entry.config = e.config;

          await entry.save({ transaction });
          results.push(entry);
        } else {
          const entry = await ChecklistEntry.create({
            checklistId,
            name: e.name,
            type: e.type || "text",
            section: e.section || null,
            image: e.image || false,
            section_formular: e.section_formular || null,
            order: e.order ?? index,
            required: e.required || false,
            options: e.options || null,
            formulaExpression: e.formulaExpression || null,
            metadata: e.metadata || null,
            config: e.config || null,
          }, { transaction });
          results.push(entry);
        }
      }

      checklist.updatedBy = userId;
      await checklist.save({ transaction });

      await transaction.commit();
      return { entries: results, message: "Entries saved successfully" };
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to save entries", 500);
    }
  }

  static async deleteEntry(entryId) {
    try {
      const entry = await ChecklistEntry.findByPk(entryId, {
        include: [{ model: Checklist, as: "checklist" }],
      });
      if (!entry) throw new ApplicationError("Entry not found", 404);

      await entry.destroy();
      return { message: "Entry deleted successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete entry", 500);
    }
  }


  static async createAssignment({ checklistId, assignedTo, assignedBy,}) {
    try {
        
        const operator = await User.findByPk(assignedTo, { 
            include: [{ model: Role, as: "role" }],  
        });
        if (!operator) throw new ApplicationError("Operator not found", 404);
        if (operator.role?.roleName !== "operator") {
            throw new ApplicationError("Assigned user is not an operator", 400);
        }
        const checklist = await Checklist.findOne({ where: { checklistId, companyId: operator.companyId } });
        if (!checklist) throw new ApplicationError("Checklist not found or does not belong to the operator's company", 404);


    const checkAssignment = await ChecklistAssignment.findOne({
        where: { checklistId, assignedTo },
      });

      if (checkAssignment && checkAssignment.active) {
        throw new ApplicationError("This checklist is already assigned to the operator", 400);
      }

      let assignment;
      if (checkAssignment) {
        assignment = await checkAssignment.update({
          active: true,
          assignedBy,
          companyId: operator.companyId,
        });
      } else {
        assignment = await ChecklistAssignment.create({
          checklistId,
          assignedTo,
          assignedBy,
          companyId : operator.companyId,
        });
      }


      try {
        await sendAssignmentEmail({
          email: operator.email,
          firstName: operator.firstName,
          checklistTitle: checklist.title,
          documentNumber: checklist.documentNumber,
        });
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);

      }

      return { assignment, message: "Checklist assigned successfully" };
    } catch (error) {
        //console.log(error);
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to create assignment", 500);
    }
  }

  static async getAssignments({ companyId, checklistId, assignedTo, status, search, startDate, endDate, page = 1, limit = 20 }) {
    try {
      const where = {};
      if (companyId) where.companyId = companyId;
      if (checklistId) where.checklistId = checklistId;
      if (assignedTo) where.assignedTo = assignedTo;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const checklistWhere = {};
      if (search) {
        checklistWhere[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { documentNumber: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const rows = await ChecklistAssignment.findAll({
        where,
        include: [
          {
            model: Checklist, as: "checklist",
            attributes: ["checklistId", "title", "documentNumber"],
            where: Object.keys(checklistWhere).length ? checklistWhere : undefined,
            include: [
              {
                model: ChecklistApprover, as: "approverConfigs",
                attributes: ["id", "approverId", "step"],
                include: [{ model: User, as: "approver", attributes: ["userId", "firstName", "lastName", "email"] }],
              },
            ],
          },
          { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
          { model: User, as: "assigner", attributes: ["userId", "firstName", "lastName"] },
          {
            model: SubmittedChecklist, as: "submissions",
            attributes: ["submittedChecklistId", "title", "issuedNumber", "entityDisplayName", "status", "submittedAt", "createdAt"],
            separate: true,
            order: [["createdAt", "DESC"]],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const withStatus = rows.map((assignment) => {
        assignment.setDataValue("status", deriveAssignmentStatus(assignment.submissions));
        assignment.setDataValue("latestSubmission", assignment.submissions?.[0] || null);
        return assignment;
      });

      const filtered = status ? withStatus.filter((a) => a.getDataValue("status") === status) : withStatus;

      const total = filtered.length;
      const offset = (page - 1) * limit;
      const assignments = filtered.slice(offset, offset + limit);

      return {
        assignments,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error(error);
      throw new ApplicationError("Failed to fetch assignments", 500);
    }
  }

  static async getAssignmentById(assignmentId) {
    try {
      const assignment = await ChecklistAssignment.findByPk(assignmentId, {
        include: [
          {
            model: Checklist, as: "checklist",
            include: [
              { model: ChecklistEntry, as: "entries", separate: true, order: [["order", "ASC"]] },
              {
                model: ChecklistApprover, as: "approverConfigs",
                attributes: ["id", "approverId", "step"],
                separate: true,
                order: [["step", "ASC"]],
                include: [{ model: User, as: "approver", attributes: ["userId", "firstName", "lastName", "email"] }],
              },
            ],
          },
          { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
          { model: User, as: "assigner", attributes: ["userId", "firstName", "lastName"] },
          {
            model: SubmittedChecklist, as: "submissions",
            attributes: ["submittedChecklistId", "documentNumber", "title", "issuedNumber", "entityDisplayName", "status", "submittedAt", "createdAt"],
            separate: true,
            order: [["createdAt", "DESC"]],
          },
        ],
      });

      if (!assignment) throw new ApplicationError("Assignment not found", 404);
      assignment.setDataValue("status", deriveAssignmentStatus(assignment.submissions));
      assignment.setDataValue("latestSubmission", assignment.submissions?.[0] || null);
      return { assignment };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch assignment", 500);
    }
  }

  static async unassignOperator({ checklistId, assignedTo }) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { checklistId, assignedTo },
        transaction,
      });
      
      if (!assignment) {
        await transaction.rollback();
        throw new ApplicationError("Assignment not found", 404);
      }
      const pendingSubmissions = await SubmittedChecklist.count({
        where: { 
          assignmentId: assignment.assignmentId,
          status: "pending",
        },
        transaction,
      });

      if (pendingSubmissions > 0) {
        await transaction.rollback();
        throw new ApplicationError(
          `Cannot unassign operator with ${pendingSubmissions} pending submission(s). Please resolve pending submissions first.`,
          400
        );
      }

      await assignment.update({ active: false }, { transaction });
      
      await transaction.commit();
      return { message: "Operator unassigned successfully" };
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      if (error instanceof ApplicationError) throw error;
      console.error("Error unassigning operator:", error);
      throw new ApplicationError("Failed to unassign operator", 500);
    }
  }


  static async createCatalog({ name, list, companyId, createdBy }) {
    const transaction = await sequelize.transaction();
    try {
      const existing = await Catalog.findOne({
        where: { name, companyId },
        transaction,
      });
      if (existing) {
        throw new ApplicationError("Catalog with this name already exists", 400);
      }

      const catalog = await Catalog.create(
        { name, list, companyId, createdBy },
        { transaction }
      );

      await transaction.commit();
      return { catalog, message: "Catalog created successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(error.message || "Failed to create catalog", 500);
    }
  }

  static async getCatalogs({ companyId, page = 1, limit = 20, search }) {
    try {
      const where = {};
      if (companyId) where.companyId = companyId;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;
      const { rows: catalogs, count: total } = await Catalog.findAndCountAll({
        where,
       attributes: ["catalogId", "name", "list"],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        distinct: true,
      });

      return {
        catalogs,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error(error);
      throw new ApplicationError("Failed to fetch catalogs", 500);
    }
  }

  static async getCatalogById(catalogId) {
    try {
      const catalog = await Catalog.findByPk(catalogId, {
        attributes: ["catalogId", "name", "list"],
      });

      if (!catalog) throw new ApplicationError("Catalog not found", 404);
      return { catalog };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch catalog", 500);
    }
  }

  static async updateCatalog(catalogId, { name, list, updatedBy }) {
    try {
      const catalog = await Catalog.findByPk(catalogId);
      if (!catalog) throw new ApplicationError("Catalog not found", 404);

      if (name && name !== catalog.name) {
        const existing = await Catalog.findOne({
          where: { name, companyId: catalog.companyId, catalogId: { [Op.ne]: catalogId } },
        });
        if (existing) throw new ApplicationError("Catalog with this name already exists", 400);
        catalog.name = name;
      }

      if (list !== undefined) catalog.list = list;
      catalog.updatedBy = updatedBy;

      await catalog.save();
      return { catalog, message: "Catalog updated successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update catalog", 500);
    }
  }

  static async deleteCatalog(catalogId) {
    try {
      const catalog = await Catalog.findByPk(catalogId);
      if (!catalog) throw new ApplicationError("Catalog not found", 404);

      await catalog.destroy();
      return { message: "Catalog deleted successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete catalog", 500);
    }
  }

}
