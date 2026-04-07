import { Op } from "sequelize";
import {
  Checklist,
  ChecklistEntry,
  ChecklistAssignment,
  SubmittedChecklist,
  User,
  Role,
  Company,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";

export class AdminRepository {


  static async createChecklist({ title, documentNumber, companyId, createdBy }) {
    const transaction = await sequelize.transaction();


    try {
      const existing = await Checklist.findOne({
        where: { documentNumber, companyId },
        transaction,
      });
      if (existing) throw new ApplicationError("Document number already exists", 400);

      const checklist = await Checklist.create(
        { title, documentNumber, companyId, createdBy },
        { transaction }
      );

      await transaction.commit();
      return { checklist, message: "Checklist created successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(error.message || "Failed to create checklist", 500);
    }
  }

  static async getChecklists({ companyId, status, page = 1, limit = 20, search }) {
    try {
      const where = {};
      if (companyId) where.companyId = companyId;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { documentNumber: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;
      const { rows: checklists, count: total } = await Checklist.findAndCountAll({
        where,
        include: [
          { model: User, as: "creator", attributes: ["userId", "firstName", "lastName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          {
            model: ChecklistAssignment, as: "assignments",
            attributes: ["assignmentId", "status", "dueDate"],
            include: [
              { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        distinct: true,
      });

      return {
        checklists,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch checklists", 500);
    }
  }

  static async getChecklistById(checklistId) {
    try {
      const checklist = await Checklist.findByPk(checklistId, {
        include: [
          { model: User, as: "creator", attributes: ["userId", "firstName", "lastName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          {
            model: ChecklistEntry,
            as: "entries",
            order: [["order", "ASC"]],
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

  static async updateChecklist(checklistId, { title, documentNumber, updatedBy }) {
    try {
      const checklist = await Checklist.findByPk(checklistId);
      if (!checklist) throw new ApplicationError("Checklist not found", 404);

      if (documentNumber && documentNumber !== checklist.documentNumber) {
        const existing = await Checklist.findOne({
          where: { documentNumber, companyId: checklist.companyId, checklistId: { [Op.ne]: checklistId } },
        });
        if (existing) throw new ApplicationError("Document number already exists", 400);
      }

      if (title) checklist.title = title;
      if (documentNumber) checklist.documentNumber = documentNumber;
      checklist.updatedBy = updatedBy;

      await checklist.save();
      return { checklist, message: "Checklist updated successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update checklist", 500);
    }
  }

  static async deleteChecklist(checklistId) {
    try {
      const checklist = await Checklist.findByPk(checklistId);
      if (!checklist) throw new ApplicationError("Checklist not found", 404);

      const activeAssignments = await ChecklistAssignment.count({
        where: { checklistId, status: { [Op.in]: ["pending", "in_progress", "submitted"] } },
      });
      if (activeAssignments > 0) {
        throw new ApplicationError("Cannot delete checklist with active assignments", 400);
      }

      await ChecklistEntry.destroy({ where: { checklistId }, force: false });
      await checklist.destroy();
      return { message: "Checklist deleted successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete checklist", 500);
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
        order: e.order ?? index,
        required: e.required || false,
        options: e.options || null,
        formulaExpression: e.formulaExpression || null,
        metadata: e.metadata || null,
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
          if (e.order !== undefined) entry.order = e.order;
          if (e.required !== undefined) entry.required = e.required;
          if (e.options !== undefined) entry.options = e.options;
          if (e.formulaExpression !== undefined) entry.formulaExpression = e.formulaExpression;
          if (e.metadata !== undefined) entry.metadata = e.metadata;

          await entry.save({ transaction });
          results.push(entry);
        } else {
          const entry = await ChecklistEntry.create({
            checklistId,
            name: e.name,
            type: e.type || "text",
            section: e.section || null,
            order: e.order ?? index,
            required: e.required || false,
            options: e.options || null,
            formulaExpression: e.formulaExpression || null,
            metadata: e.metadata || null,
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

      if (checkAssignment) {
        throw new ApplicationError("This checklist is already assigned to the operator", 400);
      }

      const assignment = await ChecklistAssignment.create({
        checklistId,
        assignedTo,
        assignedBy,
        companyId : operator.companyId,
      });

      return { assignment, message: "Checklist assigned successfully" };
    } catch (error) {
        console.log(error);
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to create assignment", 500);
    }
  }

  static async getAssignments({ companyId, checklistId, assignedTo, page = 1, limit = 20 }) {
    try {
      const where = {};
      if (companyId) where.companyId = companyId;
      if (checklistId) where.checklistId = checklistId;
      if (assignedTo) where.assignedTo = assignedTo;

      const offset = (page - 1) * limit;
      const { rows: assignments, count: total } = await ChecklistAssignment.findAndCountAll({
        where,
        include: [
          { model: Checklist, as: "checklist", attributes: ["checklistId", "title", "documentNumber"] },
          { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
          { model: User, as: "assigner", attributes: ["userId", "firstName", "lastName"] },
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
      throw new ApplicationError("Failed to fetch assignments", 500);
    }
  }

  static async getAssignmentById(assignmentId) {
    try {
      const assignment = await ChecklistAssignment.findByPk(assignmentId, {
        include: [
          {
            model: Checklist, as: "checklist",
            include: [{
              model: ChecklistEntry, as: "entries",
            }],
          },
       
        ],
      });

      if (!assignment) throw new ApplicationError("Assignment not found", 404);
      return { assignment };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch assignment", 500);
    }
  }

  static async unassignOperator({ checklistId, assignedTo }) {
    try {
      const assignment = await ChecklistAssignment.findOne({
        where: { checklistId, assignedTo },
      });
      if (!assignment) throw new ApplicationError("Assignment not found", 404);

      await assignment.destroy();
      return { message: "Operator unassigned successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to unassign operator", 500);
    }
  }


}
