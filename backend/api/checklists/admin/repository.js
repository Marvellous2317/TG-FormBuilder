import { Op } from "sequelize";
import {
  Checklist,
  ChecklistEntry,
  ChecklistAssignment,
  SubmittedChecklist,
  User,
  Role,
  Company,
  Department,
  Catalog,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";
import { config } from "dotenv";
import { sendAssignmentEmail } from "../../../views/index.js";

export class AdminRepository {


  static async createChecklist({ title, documentNumber, companyId, departmentId, frequency, frequencyInterval, createdBy }) {
    const transaction = await sequelize.transaction();


    try {
      const existing = await Checklist.findOne({
        where: {
          companyId,
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
      const checklist = await Checklist.create(
        { 
          title, 
          documentNumber, 
          companyId, 
          departmentId, 
          frequency: frequency || null,
          frequencyInterval: frequency === "hourly" ? frequencyInterval : null,
          createdBy 
        },
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
            include: [
              { model: User, as: "operator", attributes: ["userId", "firstName", "lastName", "email"] },
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

  static async updateChecklist(checklistId, { title, documentNumber, departmentId, frequency, frequencyInterval, updatedBy }) {
    try {
      const checklist = await Checklist.findByPk(checklistId);
      if (!checklist) throw new ApplicationError("Checklist not found", 404);

      if (documentNumber && documentNumber !== checklist.documentNumber) {
        const existing = await Checklist.findOne({
          where: { documentNumber, companyId: checklist.companyId, checklistId: { [Op.ne]: checklistId } },
        });
        if (existing) throw new ApplicationError("Document number already exists", 400);
      }


      if (departmentId !== undefined) {
        if (departmentId) {
          const department = await Department.findByPk(departmentId);
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
        where: { checklistId },
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
      
      // Also restore associated entries
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
          if (e.config !== undefined) entry.config = e.config;

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

      if (checkAssignment) {
        throw new ApplicationError("This checklist is already assigned to the operator", 400);
      }

      const assignment = await ChecklistAssignment.create({
        checklistId,
        assignedTo,
        assignedBy,
        companyId : operator.companyId,
      });


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
      if (status) where.status = status;
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

      const offset = (page - 1) * limit;
      const { rows: assignments, count: total } = await ChecklistAssignment.findAndCountAll({
        where,
        include: [
          { model: Checklist, as: "checklist", attributes: ["checklistId", "title", "documentNumber"], where: Object.keys(checklistWhere).length ? checklistWhere : undefined },
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
