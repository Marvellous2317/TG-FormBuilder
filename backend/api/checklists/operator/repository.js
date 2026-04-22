import { Op } from "sequelize";
import {
  Checklist, ChecklistAssignment, ChecklistEntry,
  SubmittedChecklist, SubmittedChecklistEntry, User,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";

export class OperatorRepository {

  static async getOperatorCheckList(userId, {page = 1, limit = 20 }) {
    try {
      const where = { assignedTo: userId };

      const offset = (page - 1) * limit;
      const { rows: assignments, count: total } = await ChecklistAssignment.findAndCountAll({
        where,
        attributes: ["assignmentId"],
        include: [
          { model: Checklist, as: "checklist", attributes: ["checklistId", "title", "documentNumber"] },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        assignments,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
        console.error("Error fetching operator checklist:", error);
      throw new ApplicationError("Failed to fetch assignments", 500);
    }
  }

  static async getOperatorCheckEntryList(assignmentId, userId) {
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, assignedTo: userId },
        attributes: ["assignmentId"],
        include: [
          {
            model: Checklist, as: "checklist",
            include: [{
              model: ChecklistEntry, as: "entries",
              order: [["order", "ASC"]],
            }],
          },
        ],
      });

      if (!assignment) throw new ApplicationError("Assignment not found", 404);


      return { assignment};
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch assignment for filling", 500);
    }
  }

  static async submitChecklistEntry(assignmentId, userId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, assignedTo: userId },
        include: [{ model: Checklist, as: "checklist", include: [{ model: ChecklistEntry, as: "entries" }] }],
      });

      if (!assignment) throw new ApplicationError("Assignment not found", 404);

      const requiredEntries = assignment.checklist.entries.filter((e) => e.required);
      const responseMap = new Map(data.map((r) => [r.entryId, r.value]));

      for (const entry of requiredEntries) {
        const val = responseMap.get(entry.entryId);
        if (val === undefined || val === null || val === "") {
          throw new ApplicationError(`Field "${entry.name}" is required`, 400);
        }
      }

      const submittedChecklist = await SubmittedChecklist.create({
        assignmentId,
        submittedBy: userId,
        companyId: assignment.companyId,
        documentNumber: assignment.checklist.documentNumber,
        submittedAt: new Date(),
      }, { transaction });

      const entriesMap = new Map(assignment.checklist.entries.map((e) => [e.entryId, e]));
      const entryData = data.map((r) => {
        const original = entriesMap.get(r.entryId);
        return {
          submittedChecklistId: submittedChecklist.submittedChecklistId,
          entryId: r.entryId,
          name: original?.name || "",
          type: original?.type || "text",
          section: original?.section,
          order: original?.order || 0,
          required: original?.required || false,
          options: original?.options || null,
          formulaExpression: original?.formulaExpression || null,
          value: r.value,
        };
      });
      await SubmittedChecklistEntry.bulkCreate(entryData, { transaction });

      await transaction.commit();
      return { submittedChecklist, message: "Checklist submitted successfully" };
    } catch (error) {
      await transaction.rollback();
      console.error("Error submitting checklist:", error);
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to submit checklist", 500);
    }
  }

  static async saveDraft(assignmentId, userId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, assignedTo: userId },
        include: [{ model: Checklist, as: "checklist", include: [{ model: ChecklistEntry, as: "entries" }] }],
      });
      if (!assignment) throw new ApplicationError("Assignment not found", 404);

      let submittedChecklist = await SubmittedChecklist.findOne({
        where: { assignmentId, submittedBy: userId, status: "draft" },
        transaction,
      });

      if (!submittedChecklist) {
        submittedChecklist = await SubmittedChecklist.create({
          assignmentId,
          submittedBy: userId,
          documentNumber: assignment.checklist.documentNumber,
          companyId: assignment.companyId,
          status: "draft",
        }, { transaction });
      }

      await SubmittedChecklistEntry.destroy({
        where: { submittedChecklistId: submittedChecklist.submittedChecklistId },
        transaction,
      });

      if (data?.length > 0) {
        const entriesMap = new Map(assignment.checklist.entries.map((e) => [e.entryId, e]));
        const entryData = data.map((r) => {
          const original = entriesMap.get(r.entryId);
          return {
            submittedChecklistId: submittedChecklist.submittedChecklistId,
            entryId: r.entryId,
            name: original?.name || "",
            type: original?.type || "text",
            section: original?.section || null,
            order: original?.order || 0,
            required: original?.required || false,
            options: original?.options || null,
            formulaExpression: original?.formulaExpression || null,
            value: r.value,
          };
        });
        await SubmittedChecklistEntry.bulkCreate(entryData, { transaction });
      }

      await transaction.commit();
      return { submittedChecklist, message: "Draft saved successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to save draft", 500);
    }
  }

  static async updateSubmission(submittedChecklistId, userId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await SubmittedChecklist.findOne({
        where: { submittedChecklistId, submittedBy: userId },
        transaction,
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      if (submission.status !== "pending") {
        throw new ApplicationError("Only pending submissions can be updated", 400);
      }

      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId: submission.assignmentId, assignedTo: userId },
        include: [{ model: Checklist, as: "checklist", include: [{ model: ChecklistEntry, as: "entries" }] }],
        transaction,
      });

      if (!assignment) throw new ApplicationError("Assignment not found", 404);

      const requiredEntries = assignment.checklist.entries.filter((e) => e.required);
      const responseMap = new Map(data.map((r) => [r.entryId, r.value]));

      for (const entry of requiredEntries) {
        const val = responseMap.get(entry.entryId);
        if (val === undefined || val === null || val === "") {
          throw new ApplicationError(`Field "${entry.name}" is required`, 400);
        }
      }

      await SubmittedChecklistEntry.destroy({
        where: { submittedChecklistId },
        transaction,
      });

      const entriesMap = new Map(assignment.checklist.entries.map((e) => [e.entryId, e]));
      const entryData = data.map((r) => {
        const original = entriesMap.get(r.entryId);
        return {
          submittedChecklistId,
          entryId: r.entryId,
          name: original?.name || "",
          type: original?.type || "text",
          section: original?.section || null,
          order: original?.order || 0,
          required: original?.required || false,
          options: original?.options || null,
          formulaExpression: original?.formulaExpression || null,
          value: r.value,
        };
      });
      await SubmittedChecklistEntry.bulkCreate(entryData, { transaction });

      submission.submittedAt = new Date();
      await submission.save({ transaction });

      await transaction.commit();
      return { submittedChecklist: submission, message: "Submission updated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update submission", 500);
    }
  }

  static async deleteSubmission(submittedChecklistId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await SubmittedChecklist.findOne({
        where: { submittedChecklistId, submittedBy: userId },
        transaction,
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      if (submission.status !== "pending") {
        throw new ApplicationError("Only pending submissions can be deleted", 400);
      }

      await SubmittedChecklistEntry.destroy({
        where: { submittedChecklistId },
        transaction,
      });
      await submission.destroy({ transaction });

      await transaction.commit();
      return { message: "Submission deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete submission", 500);
    }
  }

  static async getSubmissionById(submittedChecklistId, userId) {
    try {
      const submission = await SubmittedChecklist.findOne({
        where: { submittedChecklistId, submittedBy: userId },
        attributes: ["submittedChecklistId", "documentNumber", "status", "submittedAt"],
        include: [
          { model: User, as: "approver", attributes: ["firstName", "lastName"] },
          { model: SubmittedChecklistEntry, as: "entries" },
        ],
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      return { submission };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch submission", 500);
    }
  }

  static async getMySubmissions(userId, { search, status, startDate, endDate, page = 1, limit = 20 }) {
    try {
      const where = { submittedBy: userId };
      if (status) where.status = status;
      if (search) where.documentNumber = { [Op.iLike]: `%${search}%` };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }
      const offset = (page - 1) * limit;
      const { rows: submissions, count: total } = await SubmittedChecklist.findAndCountAll({
        where,
        attributes: ["submittedChecklistId", "documentNumber", "status", "submittedAt"],
        include: [
          { model: User, as: "approver", attributes: ["firstName", "lastName"] },
          {
            model: ChecklistAssignment, as: "assignment",
            attributes: ["assignmentId"],
            include: [
              { model: Checklist, as: "checklist", attributes: ["title"] },
            ],
          },
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
      throw new ApplicationError("Failed to fetch submissions", 500);
    }
  }
}
