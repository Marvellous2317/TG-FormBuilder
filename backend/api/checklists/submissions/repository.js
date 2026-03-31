import { Op } from "sequelize";
import {
  ChecklistTemplate,
  ChecklistSection,
  ChecklistField,
  ChecklistAssignment,
  ChecklistSubmission,
  ChecklistResponse,
  ChecklistDraft,
  User,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";

export class ChecklistSubmissionRepository {

  static async getMyAssignments(userId, companyId, { status, page = 1, limit = 20 }) {
    try {
      const where = {
        assignedTo: userId,
        companyId,
      };



      if (status) {
        where.status = status;
      } else {
        where.status = "active";
      }


      
      const today = new Date().toISOString().split("T")[0];
      where[Op.or] = [
        { validFrom: null, validUntil: null },
        { validFrom: { [Op.lte]: today }, validUntil: null },
        { validFrom: null, validUntil: { [Op.gte]: today } },
        { validFrom: { [Op.lte]: today }, validUntil: { [Op.gte]: today } },
      ];

      const offset = (page - 1) * limit;

      const { rows: assignments, count: total } = await ChecklistAssignment.findAndCountAll({
        where,
        include: [
          {
            model: ChecklistTemplate,
            as: "template",
            attributes: ["templateId", "name", "description", "department"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["userId", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });


      
      const assignmentIds = assignments.map((a) => a.assignmentId);

      const submissionStats = await ChecklistSubmission.findAll({
        where: { assignmentId: { [Op.in]: assignmentIds } },
        attributes: [
          "assignmentId",
          [sequelize.fn("COUNT", sequelize.col("submissionId")), "total"],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal("CASE WHEN status = 'draft' THEN 1 ELSE 0 END")
            ),
            "drafts",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal("CASE WHEN status = 'approved' THEN 1 ELSE 0 END")
            ),
            "approved",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal("CASE WHEN status = 'rejected' THEN 1 ELSE 0 END")
            ),
            "rejected",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal("CASE WHEN status IN ('submitted', 'pending_review') THEN 1 ELSE 0 END")
            ),
            "pending",
          ],
        ],
        group: ["assignmentId"],
      });

      const statsMap = {};
      submissionStats.forEach((s) => {
        statsMap[s.assignmentId] = s.dataValues;
      });

      const assignmentsWithStats = assignments.map((a) => ({
        ...a.toJSON(),
        submissionStats: statsMap[a.assignmentId] || {
          total: 0,
          drafts: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
        },
      }));

      return {
        assignments: assignmentsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch assignments", 500);
    }
  }


  
  static async getAssignmentForFilling(assignmentId, userId, companyId) {
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: {
          assignmentId,
          assignedTo: userId,
          companyId,
          status: "active",
        },
        include: [
          {
            model: ChecklistTemplate,
            as: "template",
            attributes: ["templateId", "name", "description", "department"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["userId", "firstName", "lastName"],
          },
        ],
      });

      if (!assignment) {
        throw new ApplicationError("Assignment not found or not active", 404);
      }


      
      const today = new Date().toISOString().split("T")[0];
      if (assignment.validFrom && assignment.validFrom > today) {
        throw new ApplicationError("Assignment is not yet active", 400);
      }
      if (assignment.validUntil && assignment.validUntil < today) {
        throw new ApplicationError("Assignment has expired", 400);
      }


      
      const sections = await ChecklistSection.findAll({
        where: {
          templateId: assignment.templateId,
          templateVersion: assignment.templateVersion,
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


      
      const submissionCount = await ChecklistSubmission.count({
        where: { assignmentId, status: { [Op.ne]: "draft" } },
      });

      const canSubmit =
        assignment.allowMultipleSubmissions &&
        (!assignment.maxSubmissions || submissionCount < assignment.maxSubmissions);


        
      const existingDraft = await ChecklistSubmission.findOne({
        where: { assignmentId, submittedBy: userId, status: "draft" },
        include: [{ model: ChecklistDraft, as: "draft" }],
      });

      return {
        assignment: {
          ...assignment.toJSON(),
          sections,
          canSubmit,
          submissionCount,
          existingDraft: existingDraft
            ? {
                submissionId: existingDraft.submissionId,
                draftData: existingDraft.draft?.draftData || {},
                lastSavedAt: existingDraft.draft?.lastSavedAt,
              }
            : null,
        },
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch assignment", 500);
    }
  }


  
  static async startSubmission(assignmentId, userId, companyId, deviceInfo, locationData) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: {
          assignmentId,
          assignedTo: userId,
          companyId,
          status: "active",
        },
        transaction,
      });

      if (!assignment) {
        throw new ApplicationError("Assignment not found or not active", 404);
      }


      
      const existingDraft = await ChecklistSubmission.findOne({
        where: { assignmentId, submittedBy: userId, status: "draft" },
        transaction,
      });

      if (existingDraft) {
        throw new ApplicationError(
          "You already have a draft in progress. Complete or discard it first.",
          400
        );
      }


      
      const submissionCount = await ChecklistSubmission.count({
        where: { assignmentId, status: { [Op.ne]: "draft" } },
        transaction,
      });

      if (!assignment.allowMultipleSubmissions && submissionCount > 0) {
        throw new ApplicationError("This form only allows one submission", 400);
      }

      if (assignment.maxSubmissions && submissionCount >= assignment.maxSubmissions) {
        throw new ApplicationError("Maximum submissions reached for this assignment", 400);
      }


      
      const maxNumber = await ChecklistSubmission.max("submissionNumber", {
        where: { assignmentId },
        transaction,
      });

      const submissionNumber = (maxNumber || 0) + 1;


      
      const submission = await ChecklistSubmission.create(
        {
          assignmentId,
          submissionNumber,
          status: "draft",
          submittedBy: userId,
          companyId,
          startedAt: new Date(),
          deviceInfo,
          locationData,
        },
        { transaction }
      );


      
      await ChecklistDraft.create(
        {
          submissionId: submission.submissionId,
          userId,
          draftData: {},
          lastSavedAt: new Date(),
        },
        { transaction }
      );


      

      await transaction.commit();

      return {
        submission: {
          submissionId: submission.submissionId,
          submissionNumber,
          status: "draft",
          startedAt: submission.startedAt,
        },
        message: "Submission started successfully",
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(error.message || "Failed to start submission", 500);
    }
  }


  
  static async saveDraft(submissionId, userId, companyId, draftData) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await ChecklistSubmission.findOne({
        where: {
          submissionId,
          submittedBy: userId,
          companyId,
          status: "draft",
        },
        transaction,
      });

      if (!submission) {
        throw new ApplicationError("Submission not found or not a draft", 404);
      }


      
      const [draft, created] = await ChecklistDraft.findOrCreate({
        where: { submissionId },
        defaults: {
          userId,
          draftData,
          lastSavedAt: new Date(),
        },
        transaction,
      });

      if (!created) {
        await draft.update(
          {
            draftData,
            lastSavedAt: new Date(),
          },
          { transaction }
        );
      }

      await transaction.commit();

      return {
        lastSavedAt: draft.lastSavedAt,
        message: "Draft saved successfully",
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to save draft", 500);
    }
  }


  
  static async submitForm(submissionId, userId, companyId, responses) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await ChecklistSubmission.findOne({
        where: {
          submissionId,
          submittedBy: userId,
          companyId,
          status: "draft",
        },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            include: [{ model: ChecklistTemplate, as: "template" }],
          },
        ],
        transaction,
      });

      if (!submission) {
        throw new ApplicationError("Submission not found or not a draft", 404);
      }


      
      const sections = await ChecklistSection.findAll({
        where: {
          templateId: submission.assignment.templateId,
          templateVersion: submission.assignment.templateVersion,
        },
        include: [{ model: ChecklistField, as: "fields" }],
        transaction,
      });


      
      const requiredFields = [];
      sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.required) {
            requiredFields.push(field);
          }
        });
      });

      const missingFields = [];
      for (const field of requiredFields) {
        const response = responses.find((r) => r.fieldId === field.fieldId);
        if (!response || response.value === null || response.value === undefined || response.value === "") {
          missingFields.push(field.label);
        }
      }

      if (missingFields.length > 0) {
        throw new ApplicationError(
          `Required fields missing: ${missingFields.join(", ")}`,
          400
        );
      }

 
      
      for (const response of responses) {
        await ChecklistResponse.create(
          {
            submissionId,
            fieldId: response.fieldId,
            sectionInstanceIndex: response.sectionInstanceIndex || 0,
            value: response.value,
            fileUrl: response.fileUrl,
          },
          { transaction }
        );
      }


      
      const completionTime = Math.floor(
        (new Date() - new Date(submission.startedAt)) / 1000
      );


      
      await submission.update(
        {
          status: "submitted",
          submittedAt: new Date(),
          completionTime,
        },
        { transaction }
      );

      
      await ChecklistDraft.destroy({
        where: { submissionId },
        transaction,
      });


      

      await transaction.commit();

      return {
        submission: {
          submissionId: submission.submissionId,
          submissionNumber: submission.submissionNumber,
          status: "submitted",
          submittedAt: submission.submittedAt,
        },
        message: "Form submitted successfully",
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(error.message || "Failed to submit form", 500);
    }
  }


  
  static async discardDraft(submissionId, userId, companyId) {
    const transaction = await sequelize.transaction();
    try {
      const submission = await ChecklistSubmission.findOne({
        where: {
          submissionId,
          submittedBy: userId,
          companyId,
          status: "draft",
        },
        transaction,
      });

      if (!submission) {
        throw new ApplicationError("Draft submission not found", 404);
      }


      
      await ChecklistDraft.destroy({
        where: { submissionId },
        transaction,
      });


      
      await submission.destroy({ transaction });


      

      await transaction.commit();

      return { message: "Draft discarded successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to discard draft", 500);
    }
  }

  /**
   * Get my submissions
   */
  static async getMySubmissions(userId, companyId, { assignmentId, status, page = 1, limit = 20 }) {
    try {
      const where = {
        submittedBy: userId,
        companyId,
      };

      if (assignmentId) where.assignmentId = assignmentId;
      if (status) where.status = status;

      const offset = (page - 1) * limit;

      const { rows: submissions, count: total } = await ChecklistSubmission.findAndCountAll({
        where,
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            include: [
              {
                model: ChecklistTemplate,
                as: "template",
                attributes: ["templateId", "name", "description"],
              },
            ],
          },
          {
            model: User,
            as: "reviewer",
            attributes: ["userId", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
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
      throw new ApplicationError("Failed to fetch submissions", 500);
    }
  }

  /**
   * Get single submission with responses
   */
  static async getSubmissionById(submissionId, userId, companyId) {
    try {
      const submission = await ChecklistSubmission.findOne({
        where: {
          submissionId,
          submittedBy: userId,
          companyId,
        },
        include: [
          {
            model: ChecklistAssignment,
            as: "assignment",
            include: [
              {
                model: ChecklistTemplate,
                as: "template",
              },
              {
                model: User,
                as: "approver",
                attributes: ["userId", "firstName", "lastName"],
              },
            ],
          },
          {
            model: ChecklistResponse,
            as: "responses",
          },
          {
            model: User,
            as: "reviewer",
            attributes: ["userId", "firstName", "lastName"],
          },
          {
            model: ChecklistDraft,
            as: "draft",
          },
        ],
      });

      if (!submission) {
        throw new ApplicationError("Submission not found", 404);
      }

      // Get form structure
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

      // Sort fields
      sections.forEach((section) => {
        section.fields.sort((a, b) => a.order - b.order);
      });

      return {
        submission: {
          ...submission.toJSON(),
          sections,
        },
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch submission", 500);
    }
  }

  /**
   * Get submission history for an assignment
   */
  static async getAssignmentHistory(assignmentId, userId, companyId) {
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: {
          assignmentId,
          assignedTo: userId,
          companyId,
        },
      });

      if (!assignment) {
        throw new ApplicationError("Assignment not found", 404);
      }

      const submissions = await ChecklistSubmission.findAll({
        where: { assignmentId },
        include: [
          {
            model: User,
            as: "reviewer",
            attributes: ["userId", "firstName", "lastName"],
          },
        ],
        order: [["submissionNumber", "DESC"]],
      });

      return { submissions };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch submission history", 500);
    }
  }
}
