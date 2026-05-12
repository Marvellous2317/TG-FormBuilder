import { Op } from "sequelize";
import {
  Checklist, ChecklistAssignment, ChecklistEntry,
  SubmittedChecklist, SubmittedChecklistEntry, User, OperatorApprover,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";

export class ApprovalRepository {

  static async _getOperatorIds(approverId) {
    const links = await OperatorApprover.findAll({
      where: { approverId },
      attributes: ["operatorId"],
    });
    return links.map((l) => l.operatorId);
  }

  static async getPendingSubmissions(approverId, { page = 1, limit = 20 }) {
    try {
      const operatorIds = await this._getOperatorIds(approverId);
      if (operatorIds.length === 0) {
        return { submissions: [], pagination: { page: Number(page), limit: Number(limit), total: 0, totalPages: 0 } };
      }

      const offset = (page - 1) * limit;
      const { rows: submissions, count: total } = await SubmittedChecklist.findAndCountAll({
        where: { status: "pending" },
        include: [
          {
            model: ChecklistAssignment, as: "assignment",
            where: { assignedTo: { [Op.in]: operatorIds } },
            include: [
              { model: User, as: "operator", attributes: ["userId", "firstName", "lastName"] },
            ],
          },
        ],
        order: [["submittedAt", "DESC"]],
        limit,
        offset,
      });

      return {
        submissions,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch pending submissions", 500);
    }
  }

  static async getSubmissionById(submittedChecklistId, approverId) {
    try {
      const operatorIds = await this._getOperatorIds(approverId);

      const submission = await SubmittedChecklist.findByPk(submittedChecklistId, {
        attributes: ["submittedChecklistId"],
        include: [
          {
            model: ChecklistAssignment, as: "assignment",
            attributes: ["assignmentId" ],
            where: { assignedTo: { [Op.in]: operatorIds } },
            include: [
              { model: Checklist, as: "checklist", attributes: ["checklistId", "title", "documentNumber"] },
              { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
            ],
          },

  
          { model: SubmittedChecklistEntry, as: "entries", order: [["order", "ASC"]], attributes: ["entryId","formulaExpression", "options", "required","config", "name", "value", "type", "order"] },
        ],
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      return { submission };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      //console.log(error);
      throw new ApplicationError("Failed to fetch submission", 500);
    }
  }

  static async approveSubmission(submittedChecklistId, approverId, { data }) {
    const transaction = await sequelize.transaction();
    try {
      const operatorIds = await this._getOperatorIds(approverId);

      const submission = await SubmittedChecklist.findByPk(submittedChecklistId, {
        include: [{
          model: ChecklistAssignment, as: "assignment",
          where: { assignedTo: { [Op.in]: operatorIds } },
          include: [{ model: Checklist, as: "checklist", include: [{ model: ChecklistEntry, as: "entries" }] }],
        }],
        transaction,
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      if (submission.status !== "pending") {
        throw new ApplicationError("Only pending submissions can be approved", 400);
      }

   
      // const requiredEntries = submission.assignment.checklist.entries.filter((e) => e.required);
      // const responseMap = new Map(data.map((r) => [r.entryId, r.value]));

      // for (const entry of requiredEntries) {
      //   const val = responseMap.get(entry.entryId);
      //   if (val === undefined || val === null || val === "") {
      //     throw new ApplicationError(`Field "${entry.name}" is required`, 400);
      //   }
      // }

      const existingEntries = await SubmittedChecklistEntry.findAll({
        where: { submittedChecklistId },
        transaction,
      });
      const existingMap = new Map(existingEntries.map((e) => [e.entryId, e]));


      for (const item of data) {
        const existing = existingMap.get(item.entryId);
        if (existing && existing.value !== item.value) {
          await existing.update({ value: item.value, status: "approved" }, { transaction });
        } else if (existing) {
          await existing.update({ status: "approved" }, { transaction });
        }
      }

   
      await SubmittedChecklistEntry.update(
        { status: "approved" },
        { where: { submittedChecklistId, status: { [Op.ne]: "approved" } }, transaction },
      );

      submission.status = "approved";
      submission.approvedBy = approverId;
      await submission.save({ transaction });

      await transaction.commit();
      return { submittedChecklist: submission, message: "Submission approved successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to approve submission", 500);
    }
  }

  static async rejectSubmission(submittedChecklistId, approverId) {
    const transaction = await sequelize.transaction();
    try {
      const operatorIds = await this._getOperatorIds(approverId);

      const submission = await SubmittedChecklist.findByPk(submittedChecklistId, {
        include: [{
          model: ChecklistAssignment, as: "assignment",
          where: { assignedTo: { [Op.in]: operatorIds } },
        }],
        transaction,
      });

      if (!submission) throw new ApplicationError("Submission not found", 404);
      if (submission.status !== "pending") {
        throw new ApplicationError("Only pending submissions can be rejected", 400);
      }

      submission.status = "rejected";
      submission.approvedBy = approverId;
      await submission.save({ transaction });

      await SubmittedChecklistEntry.update(
        { status: "rejected" },
        { where: { submittedChecklistId }, transaction },
      );

      await transaction.commit();
      return { message: "Submission rejected successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to reject submission", 500);
    }
  }

  static async getHistory(approverId, { status, search, startDate, endDate, page = 1, limit = 20 }) {
    try {

      const where = { approvedBy: approverId };

      if (status) {
        where.status = status;
      } else {
        where.status = { [Op.in]: ["approved", "rejected"] };
      }

      if (startDate || endDate) {
        where.updatedAt = {};
        if (startDate) where.updatedAt[Op.gte] = new Date(startDate);
        if (endDate) where.updatedAt[Op.lte] = new Date(endDate);
      }

      if (search) {
        where.documentNumber = { [Op.iLike]: `%${search}%` };
      }

      const offset = (page - 1) * limit;
      const { rows: submissions, count: total } = await SubmittedChecklist.findAndCountAll({
        where,
        include: [
    
          { model: User, as: "submitter", attributes: ["userId", "firstName", "lastName"] },
        ],
        order: [["updatedAt", "DESC"]],
        limit,
        offset,
      });

      return {
        submissions,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch review history", 500);
    }
  }
}
