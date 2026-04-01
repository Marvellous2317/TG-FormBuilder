import { Op } from "sequelize";
import {
  ChecklistTemplate,
  ChecklistSection,
  ChecklistField,
  ChecklistAssignment,
  ChecklistSubmission,
  ChecklistResponse,
  User,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";

export class CheckListReviewRepository {

  static async getPendingSubmissions(approverId, companyId, { department, templateId, page = 1, limit = 20 }) {
    try {

      const assignmentWhere = {
        approverId,
        companyId,
        status: "active",
      };


      const templateInclude = {
        model: ChecklistTemplate,
        as: "template",
        attributes: ["templateId", "name", "description", "department"],
      };

      if (department) {
        templateInclude.where = { department };
      }

      if (templateId) {
        assignmentWhere.templateId = templateId;
      }

      const offset = (page - 1) * limit;

      const { rows: submissions, count: total } = await ChecklistSubmission.findAndCountAll({
        where: {
          companyId,
          status: { [Op.in]: ["submitted", "pending_review"] },
        },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            where: assignmentWhere,
            include: [templateInclude],
          },
          {
            model: User,
            as: "submitter",
            attributes: ["userId", "firstName", "lastName", "email", "department"],
          },
        ],
        order: [["submittedAt", "ASC"]], 
        limit,
        offset,
      });

      return {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch pending submissions", 500);
    }
  }


  static async getSubmissionForReview(submissionId, approverId, companyId) {
    try {
      const submission = await ChecklistSubmission.findOne({
        where: {
          submissionId,
          companyId,
          status: { [Op.in]: ["submitted", "pending_review"] },
        },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            where: { approverId },
            include: [
              {
                model: ChecklistTemplate,
                as: "template",
              },
            ],
          },
          {
            model: User,
            as: "submitter",
            attributes: ["userId", "firstName", "lastName", "email", "department"],
          },
          {
            model: ChecklistResponse,
            as: "responses",
          },
        ],
      });

      if (!submission) {
        throw new ApplicationError("Submission not found or not available for review", 404);
      }


      const sections = await ChecklistSection.findAll({
        where: {
          templateId: submission.assignment.templateId,
          templateVersion: submission.assignment.templateVersion,
        },
        order: [["order", "ASC"]],
        include: [
          {
            model: ChecklistField,
            as: "fields",
            order: [["order", "ASC"]],
          },
        ],
      });


      sections.forEach((section) => {
        section.fields.sort((a, b) => a.order - b.order);
      });

      const responseMap = {};
      submission.responses.forEach((r) => {
        const key = `${r.fieldId}_${r.sectionInstanceIndex}`;
        responseMap[key] = r;
      });

      return {
        submission: {
          ...submission.toJSON(),
          sections,
          responseMap,
        },
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch submission for review", 500);
    }
  }


  static async pickupSubmission(submissionId, approverId, companyId) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await ChecklistSubmission.findOne({
        where: {
          submissionId,
          companyId,
          status: "submitted",
        },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            where: { approverId },
          },
        ],
        transaction,
      });

      if (!submission) {
        throw new ApplicationError("Submission not found or already being reviewed", 404);
      }

      const previousState = submission.toJSON();

      await submission.update(
        {
          status: "pending_review",
          reviewedBy: approverId,
        },
        { transaction }
      );


      
      await transaction.commit();

      return { submission, message: "Submission picked up for review" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to pickup submission", 500);
    }
  }


  static async approveSubmission(submissionId, approverId, companyId, reviewNotes) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await ChecklistSubmission.findOne({
        where: {
          submissionId,
          companyId,
          status: { [Op.in]: ["submitted", "pending_review"] },
        },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            where: { approverId },
          },
        ],
        transaction,
      });

      if (!submission) {
        throw new ApplicationError("Submission not found or not available for approval", 404);
      }

      const previousState = submission.toJSON();

      await submission.update(
        {
          status: "approved",
          reviewedBy: approverId,
          reviewedAt: new Date(),
          reviewNotes,
        },
        { transaction }
      );




      await transaction.commit();

      return { submission, message: "Submission approved successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to approve submission", 500);
    }
  }

  static async rejectSubmission(submissionId, approverId, companyId, reviewNotes) {
    const transaction = await sequelize.transaction();
    try {
      if (!reviewNotes || reviewNotes.trim() === "") {
        throw new ApplicationError("Rejection reason is required", 400);
      }

      const submission = await ChecklistSubmission.findOne({
        where: {
          submissionId,
          companyId,
          status: { [Op.in]: ["submitted", "pending_review"] },
        },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            where: { approverId },
          },
        ],
        transaction,
      });

      if (!submission) {
        throw new ApplicationError("Submission not found or not available for rejection", 404);
      }

      const previousState = submission.toJSON();

      await submission.update(
        {
          status: "rejected",
          reviewedBy: approverId,
          reviewedAt: new Date(),
          reviewNotes,
        },
        { transaction }
      );

  


      await transaction.commit();

      return { submission, message: "Submission rejected" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to reject submission", 500);
    }
  }


  static async getReviewHistory(approverId, companyId, { status, templateId, page = 1, limit = 20 }) {
    try {
      const where = {
        reviewedBy: approverId,
        companyId,
      };

      if (status) {
        where.status = status;
      } else {
        where.status = { [Op.in]: ["approved", "rejected"] };
      }


      const assignmentInclude = {
        model: ChecklistAssignment,
        as: "assignment",
        include: [
          {
            model: ChecklistTemplate,
            as: "template",
            attributes: ["templateId", "name", "description", "department"],
          },
        ],
      };

      if (templateId) {
        assignmentInclude.where = { templateId };
      }

      const offset = (page - 1) * limit;

      const { rows: submissions, count: total } = await ChecklistSubmission.findAndCountAll({
        where,
        include: [
          assignmentInclude,
          {
            model: User,
            as: "submitter",
            attributes: ["userId", "firstName", "lastName", "email", "department"],
          },
        ],
        order: [["reviewedAt", "DESC"]],
        limit,
        offset,
      });

      return {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch review history", 500);
    }
  }


  static async getReviewStats(approverId, companyId) {
    try {

      const pendingCount = await ChecklistSubmission.count({
        where: {
          companyId,
          status: { [Op.in]: ["submitted", "pending_review"] },
        },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            where: { approverId, status: "active" },
          },
        ],
      });

      // Get approved count (all time)
      const approvedCount = await ChecklistSubmission.count({
        where: {
          reviewedBy: approverId,
          companyId,
          status: "approved",
        },
      });

      // Get rejected count (all time)
      const rejectedCount = await ChecklistSubmission.count({
        where: {
          reviewedBy: approverId,
          companyId,
          status: "rejected",
        },
      });


      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayReviews = await ChecklistSubmission.count({
        where: {
          reviewedBy: approverId,
          companyId,
          status: { [Op.in]: ["approved", "rejected"] },
          reviewedAt: { [Op.gte]: today },
        },
      });

      return {
        stats: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          todayReviews,
          totalReviews: approvedCount + rejectedCount,
        },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch review statistics", 500);
    }
  }
}
