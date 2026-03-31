import { Op } from "sequelize";
import {
  ChecklistTemplate,
  ChecklistAssignment,
  ChecklistSubmission,
  ChecklistSection,
  ChecklistField,
  User,
  Company,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";

export class CheckListAssignmentRepository {

  static async createAssignment({
    templateId,
    assignedTo,
    approverId,
    companyId,
    assignedBy,
    allowMultipleSubmissions = true,
    maxSubmissions,
    notes,
    validFrom,
    validUntil,
  }) {
    const transaction = await sequelize.transaction();
    try {

      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId, status: "published" },
        transaction,
      });

      if (!template) {
        throw new ApplicationError("Template not found or not published", 404);
      }


      const assignee = await User.findOne({
        where: { userId: assignedTo, companyId, status: "active" },
        transaction,
      });

      if (!assignee) {
        throw new ApplicationError("Assignee not found or not active", 404);
      }


      const approver = await User.findOne({
        where: { userId: approverId, companyId, status: "active" },
        transaction,
      });

      if (!approver) {
        throw new ApplicationError("Approver not found or not active", 404);
      }


      const existingAssignment = await ChecklistAssignment.findOne({
        where: {
          templateId,
          assignedTo,
          companyId,
          status: "active",
        },
        transaction,
      });

      if (existingAssignment) {
        throw new ApplicationError("User already has an active assignment for this template", 400);
      }


      const assignment = await ChecklistAssignment.create(
        {
          templateId,
          templateVersion: template.version,
          assignedTo,
          assignedBy,
          approverId,
          companyId,
          allowMultipleSubmissions,
          maxSubmissions,
          notes,
          validFrom,
          validUntil,
          status: "active",
        },
        { transaction }
      );




      await transaction.commit();


      const result = await ChecklistAssignment.findByPk(assignment.assignmentId, {
        include: [
          { model: ChecklistTemplate, as: "template", attributes: ["templateId", "name", "description"] },
          { model: User, as: "assignee", attributes: ["userId", "firstName", "lastName", "email"] },
          { model: User, as: "approver", attributes: ["userId", "firstName", "lastName", "email"] },
        ],
      });

      return { assignment: result, message: "Form assigned successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(error.message || "Failed to create assignment", 500);
    }
  }


  static async bulkAssign({
    templateId,
    userIds,
    approverId,
    companyId,
    assignedBy,
    allowMultipleSubmissions = true,
    maxSubmissions,
    notes,
    validFrom,
    validUntil,
  }) {
    const transaction = await sequelize.transaction();
    try {
  
      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId, status: "published" },
        transaction,
      });

      if (!template) {
        throw new ApplicationError("Template not found or not published", 404);
      }


      const approver = await User.findOne({
        where: { userId: approverId, companyId, status: "active" },
        transaction,
      });

      if (!approver) {
        throw new ApplicationError("Approver not found or not active", 404);
      }


      const users = await User.findAll({
        where: { userId: { [Op.in]: userIds }, companyId, status: "active" },
        transaction,
      });

      if (users.length !== userIds.length) {
        throw new ApplicationError("Some users not found or not active", 400);
      }


      const existingAssignments = await ChecklistAssignment.findAll({
        where: {
          templateId,
          assignedTo: { [Op.in]: userIds },
          companyId,
          status: "active",
        },
        transaction,
      });

      const existingUserIds = existingAssignments.map((a) => a.assignedTo);
      const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

      if (newUserIds.length === 0) {
        throw new ApplicationError("All users already have active assignments for this template", 400);
      }


      const assignments = await ChecklistAssignment.bulkCreate(
        newUserIds.map((userId) => ({
          templateId,
          templateVersion: template.version,
          assignedTo: userId,
          assignedBy,
          approverId,
          companyId,
          allowMultipleSubmissions,
          maxSubmissions,
          notes,
          validFrom,
          validUntil,
          status: "active",
        })),
        { transaction }
      );


     

      await transaction.commit();

      return {
        created: assignments.length,
        skipped: existingUserIds.length,
        message: `Assigned to ${assignments.length} users, ${existingUserIds.length} already assigned`,
      };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(error.message || "Failed to bulk assign", 500);
    }
  }


  static async getAssignments({
    companyId,
    templateId,
    assignedTo,
    approverId,
    status,
    department,
    page = 1,
    limit = 20,
  }) {
    try {
      const where = { companyId };

      if (templateId) where.templateId = templateId;
      if (assignedTo) where.assignedTo = assignedTo;
      if (approverId) where.approverId = approverId;
      if (status) where.status = status;

      const offset = (page - 1) * limit;

      const templateInclude = {
        model: ChecklistTemplate,
        as: "template",
        attributes: ["templateId", "name", "description", "department"],
      };

      if (department) {
        templateInclude.where = { department };
      }

      const { rows: assignments, count: total } = await ChecklistAssignment.findAndCountAll({
        where,
        include: [
          templateInclude,
          { model: User, as: "assignee", attributes: ["userId", "firstName", "lastName", "email", "department"] },
          { model: User, as: "approver", attributes: ["userId", "firstName", "lastName", "email"] },
          { model: User, as: "assigner", attributes: ["userId", "firstName", "lastName"] },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });


      const assignmentIds = assignments.map((a) => a.assignmentId);
      const submissionCounts = await ChecklistSubmission.findAll({
        where: { assignmentId: { [Op.in]: assignmentIds } },
        attributes: [
          "assignmentId",
          [sequelize.fn("COUNT", sequelize.col("submissionId")), "total"],
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

      const countMap = {};
      submissionCounts.forEach((sc) => {
        countMap[sc.assignmentId] = sc.dataValues;
      });

      const assignmentsWithCounts = assignments.map((a) => ({
        ...a.toJSON(),
        submissionStats: countMap[a.assignmentId] || { total: 0, approved: 0, rejected: 0, pending: 0 },
      }));

      return {
        assignments: assignmentsWithCounts,
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


  static async getAssignmentById(assignmentId, companyId) {
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, companyId },
        include: [
          { model: ChecklistTemplate, as: "template" },
          { model: User, as: "assignee", attributes: ["userId", "firstName", "lastName", "email", "department"] },
          { model: User, as: "approver", attributes: ["userId", "firstName", "lastName", "email"] },
          { model: User, as: "assigner", attributes: ["userId", "firstName", "lastName"] },
          {
            model: ChecklistSubmission,
            as: "submissions",
            separate: true,
            order: [["submissionNumber", "DESC"]],
            limit: 10,
          },
        ],
      });

      if (!assignment) {
        throw new ApplicationError("Assignment not found", 404);
      }

      return { assignment };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch assignment", 500);
    }
  }


  static async updateAssignment(assignmentId, { approverId, notes, validFrom, validUntil, maxSubmissions, companyId, userId }) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, companyId },
        transaction,
      });

      if (!assignment) {
        throw new ApplicationError("Assignment not found", 404);
      }


      if (approverId && approverId !== assignment.approverId) {
        const approver = await User.findOne({
          where: { userId: approverId, companyId, status: "active" },
          transaction,
        });

        if (!approver) {
          throw new ApplicationError("Approver not found or not active", 404);
        }
      }


      await assignment.update(
        {
          approverId: approverId || assignment.approverId,
          notes: notes !== undefined ? notes : assignment.notes,
          validFrom: validFrom !== undefined ? validFrom : assignment.validFrom,
          validUntil: validUntil !== undefined ? validUntil : assignment.validUntil,
          maxSubmissions: maxSubmissions !== undefined ? maxSubmissions : assignment.maxSubmissions,
        },
        { transaction }
      );



      await transaction.commit();
      return { assignment, message: "Assignment updated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update assignment", 500);
    }
  }

  static async pauseAssignment(assignmentId, companyId, userId) {
    return this._updateAssignmentStatus(assignmentId, "paused", companyId, userId);
  }


  static async resumeAssignment(assignmentId, companyId, userId) {
    return this._updateAssignmentStatus(assignmentId, "active", companyId, userId);
  }


  static async revokeAssignment(assignmentId, companyId, userId) {
    return this._updateAssignmentStatus(assignmentId, "revoked", companyId, userId);
  }

  
  static async _updateAssignmentStatus(assignmentId, newStatus, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, companyId },
        transaction,
      });

      if (!assignment) {
        throw new ApplicationError("Assignment not found", 404);
      }

      const actionMap = {
        active: "resumed",
        paused: "paused",
        revoked: "revoked",
      };

      const previousState = assignment.toJSON();

      await assignment.update({ status: newStatus }, { transaction });




      await transaction.commit();
      return { assignment, message: `Assignment ${actionMap[newStatus]} successfully` };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(`Failed to ${newStatus} assignment`, 500);
    }
  }


  static async deleteAssignment(assignmentId, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { assignmentId, companyId },
        transaction,
      });

      if (!assignment) {
        throw new ApplicationError("Assignment not found", 404);
      }

      const previousState = assignment.toJSON();

      await assignment.destroy({ transaction });


      await transaction.commit();
      return { message: "Assignment deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete assignment", 500);
    }
  }


  static async getAvailableUsers(templateId, companyId, department) {
    try {
      const existingAssignments = await ChecklistAssignment.findAll({
        where: { templateId, companyId, status: "active" },
        attributes: ["assignedTo"],
      });

      const assignedUserIds = existingAssignments.map((a) => a.assignedTo);

      const where = {
        companyId,
        status: "active",
      };

      if (assignedUserIds.length > 0) {
        where.userId = { [Op.notIn]: assignedUserIds };
      }

      if (department) {
        where.department = department;
      }

      const users = await User.findAll({
        where,
        attributes: ["userId", "firstName", "lastName", "email", "department"],
        order: [["firstName", "ASC"], ["lastName", "ASC"]],
      });

      return { users };
    } catch (error) {
      throw new ApplicationError("Failed to fetch available users", 500);
    }
  }
}
