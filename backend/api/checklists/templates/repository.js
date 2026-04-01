import { Op, Sequelize } from "sequelize";
import {
  ChecklistTemplate,
  ChecklistSection,
  ChecklistField,
  ChecklistAssignment,
  User,
  Company,
} from "../../../models/index.js";
import { ApplicationError } from "../../../utils/errorHandler.js";
import { sequelize } from "../../../config/database.js";

export class CheckListTemplateRepository {

  static async createTemplate({ name, description, department, companyId, createdBy }) {
    const transaction = await sequelize.transaction();
    try {
      const template = await ChecklistTemplate.create(
        {
          name,
          description,
          department,
          companyId,
          createdBy,
          version: 1,
          status: "draft",
        },
        { transaction }
      );



      await transaction.commit();
      return { template, message: "Template created successfully" };
    } catch (error) {
      await transaction.rollback();
      throw new ApplicationError(error.message || "Failed to create template", 500);
    }
  }


  static async getTemplates({ companyId, department, status, page = 1, limit = 20 }) {
    try {
      const where = { companyId };
      
      if (department) {
        where.department = department;
      }
      
      if (status) {
        where.status = status;
      }

      const offset = (page - 1) * limit;

      const { rows: templates, count: total } = await ChecklistTemplate.findAndCountAll({
        where,
        include: [
          { model: User, as: "creator", attributes: ["userId", "firstName", "lastName"] },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch templates", 500);
    }
  }


  static async getTemplateById(templateId, companyId) {
    try {
      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId },
        include: [
          { model: User, as: "creator", attributes: ["userId", "firstName", "lastName"] },
          {
            model: ChecklistSection,
            as: "sections",
            where: { templateVersion: Sequelize.col("ChecklistTemplate.version") },
            required: false,
            separate: true,
            order: [["order", "ASC"]],
            include: [
              {
                model: ChecklistField,
                as: "fields",
                separate: true,
                order: [["order", "ASC"]],
              },
            ],
          },
        ],
      });

      if (!template) {
        throw new ApplicationError("Template not found", 404);
      }

      const sections = await ChecklistSection.findAll({
        where: { templateId, templateVersion: template.version },
        order: [["order", "ASC"]],
        include: [
          {
            model: ChecklistField,
            as: "fields",
            order: [["order", "ASC"]],
          },
        ],
      });

      return { template: { ...template.toJSON(), sections } };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch template", 500);
    }
  }


  static async updateTemplate(templateId, { name, description, department, companyId, updatedBy }) {
    const transaction = await sequelize.transaction();
    try {
      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId },
        transaction,
      });

      if (!template) {
        throw new ApplicationError("Template not found", 404);
      }

      const previousState = template.toJSON();


      if (template.status === "published") {

        await template.update(
          { name, description, department, updatedBy },
          { transaction }
        );
      } else {
        await template.update(
          { name, description, department, updatedBy },
          { transaction }
        );
      }


      await ChecklistAuditLog.create(
        {
          entityType: "template",
          entityId: template.templateId,
          action: "updated",
          performedBy: updatedBy,
          companyId,
          previousState,
          newState: template.toJSON(),
        },
        { transaction }
      );

      await transaction.commit();
      return { template, message: "Template updated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update template", 500);
    }
  }


  static async publishTemplate(templateId, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId },
        transaction,
      });

      if (!template) {
        throw new ApplicationError("Template not found", 404);
      }

      if (template.status === "published") {
        throw new ApplicationError("Template is already published", 400);
      }

      const sectionCount = await ChecklistSection.count({
        where: { templateId, templateVersion: template.version },
        transaction,
      });

      if (sectionCount === 0) {
        throw new ApplicationError("Cannot publish template without sections", 400);
      }

      const previousState = template.toJSON();

      await template.update({ status: "published", updatedBy: userId }, { transaction });



      await transaction.commit();
      return { template, message: "Template published successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to publish template", 500);
    }
  }


  static async archiveTemplate(templateId, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId },
        transaction,
      });

      if (!template) {
        throw new ApplicationError("Template not found", 404);
      }

      const previousState = template.toJSON();

      await template.update({ status: "archived", updatedBy: userId }, { transaction });

      await ChecklistAuditLog.create(
        {
          entityType: "template",
          entityId: template.templateId,
          action: "archived",
          performedBy: userId,
          companyId,
          previousState,
          newState: template.toJSON(),
        },
        { transaction }
      );

      await transaction.commit();
      return { template, message: "Template archived successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to archive template", 500);
    }
  }


  static async deleteTemplate(templateId, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId },
        transaction,
      });

      if (!template) {
        throw new ApplicationError("Template not found", 404);
      }

      const activeAssignments = await ChecklistAssignment.count({
        where: { templateId, status: "active" },
        transaction,
      });

      if (activeAssignments > 0) {
        throw new ApplicationError(
          "Cannot delete template with active assignments. Archive it instead.",
          400
        );
      }

      const previousState = template.toJSON();

      await template.destroy({ transaction });



      await transaction.commit();
      return { message: "Template deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete template", 500);
    }
  }


  static async cloneTemplate(templateId, { name, companyId, createdBy }) {
    const transaction = await sequelize.transaction();
    try {
      const sourceTemplate = await ChecklistTemplate.findOne({
        where: { templateId, companyId },
        transaction,
      });

      if (!sourceTemplate) {
        throw new ApplicationError("Source template not found", 404);
      }


      const newTemplate = await ChecklistTemplate.create(
        {
          name: name || `${sourceTemplate.name} (Copy)`,
          description: sourceTemplate.description,
          department: sourceTemplate.department,
          companyId,
          createdBy,
          version: 1,
          status: "draft",
        },
        { transaction }
      );


      const sections = await ChecklistSection.findAll({
        where: { templateId, templateVersion: sourceTemplate.version },
        include: [{ model: ChecklistField, as: "fields" }],
        transaction,
      });

      for (const section of sections) {
        const newSection = await ChecklistSection.create(
          {
            templateId: newTemplate.templateId,
            templateVersion: 1,
            name: section.name,
            description: section.description,
            order: section.order,
            isRepeatable: section.isRepeatable,
            minInstances: section.minInstances,
            maxInstances: section.maxInstances,
          },
          { transaction }
        );


        for (const field of section.fields) {
          await ChecklistField.create(
            {
              sectionId: newSection.sectionId,
              type: field.type,
              label: field.label,
              placeholder: field.placeholder,
              helpText: field.helpText,
              required: field.required,
              order: field.order,
              options: field.options,
              validation: field.validation,
              conditionalLogic: field.conditionalLogic,
              defaultValue: field.defaultValue,
              metadata: field.metadata,
            },
            { transaction }
          );
        }
      }




      await transaction.commit();
      return { template: newTemplate, message: "Template cloned successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to clone template", 500);
    }
  }


  static async addSection(templateId, { name, description, order, isRepeatable, minInstances, maxInstances, companyId, userId }) {
    const transaction = await sequelize.transaction();
    try {
      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId },
        transaction,
      });

      if (!template) {
        throw new ApplicationError("Template not found", 404);
      }

      if (template.status !== "draft") {
        throw new ApplicationError("Can only add sections to draft templates", 400);
      }


      if (order === undefined) {
        const maxOrder = await ChecklistSection.max("order", {
          where: { templateId, templateVersion: template.version },
          transaction,
        });
        order = (maxOrder || 0) + 1;
      }

      const section = await ChecklistSection.create(
        {
          templateId,
          templateVersion: template.version,
          name,
          description,
          order,
          isRepeatable: isRepeatable || false,
          minInstances: minInstances || 1,
          maxInstances: maxInstances || null,
        },
        { transaction }
      );




      await transaction.commit();
      return { section, message: "Section added successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to add section", 500);
    }
  }


  static async updateSection(sectionId, { name, description, order, isRepeatable, minInstances, maxInstances, companyId, userId }) {
    const transaction = await sequelize.transaction();
    try {
      const section = await ChecklistSection.findByPk(sectionId, {
        include: [{ model: ChecklistTemplate, as: "template" }],
        transaction,
      });

      if (!section) {
        throw new ApplicationError("Section not found", 404);
      }

      if (section.template.companyId !== companyId) {
        throw new ApplicationError("Section not found", 404);
      }

      if (section.template.status !== "draft") {
        throw new ApplicationError("Can only update sections in draft templates", 400);
      }

      const previousState = section.toJSON();

      await section.update(
        { name, description, order, isRepeatable, minInstances, maxInstances },
        { transaction }
      );



      await transaction.commit();
      return { section, message: "Section updated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update section", 500);
    }
  }


  static async deleteSection(sectionId, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const section = await ChecklistSection.findByPk(sectionId, {
        include: [{ model: ChecklistTemplate, as: "template" }],
        transaction,
      });

      if (!section) {
        throw new ApplicationError("Section not found", 404);
      }

      if (section.template.companyId !== companyId) {
        throw new ApplicationError("Section not found", 404);
      }

      if (section.template.status !== "draft") {
        throw new ApplicationError("Can only delete sections from draft templates", 400);
      }

      const previousState = section.toJSON();


      await ChecklistField.destroy({
        where: { sectionId },
        transaction,
      });

      await section.destroy({ transaction });




      await transaction.commit();
      return { message: "Section deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete section", 500);
    }
  }


  static async reorderSections(templateId, sectionOrders, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const template = await ChecklistTemplate.findOne({
        where: { templateId, companyId },
        transaction,
      });

      if (!template) {
        throw new ApplicationError("Template not found", 404);
      }

      if (template.status !== "draft") {
        throw new ApplicationError("Can only reorder sections in draft templates", 400);
      }

      for (const { sectionId, order } of sectionOrders) {
        await ChecklistSection.update(
          { order },
          { where: { sectionId, templateId }, transaction }
        );
      }

      await transaction.commit();
      return { message: "Sections reordered successfully" };
    } catch (error) {
      await transaction.rollback();
      throw new ApplicationError("Failed to reorder sections", 500);
    }
  }


  static async addField(sectionId, fieldData, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const section = await ChecklistSection.findByPk(sectionId, {
        include: [{ model: ChecklistTemplate, as: "template" }],
        transaction,
      });

      if (!section) {
        throw new ApplicationError("Section not found", 404);
      }

      if (section.template.companyId !== companyId) {
        throw new ApplicationError("Section not found", 404);
      }

      if (section.template.status !== "draft") {
        throw new ApplicationError("Can only add fields to draft templates", 400);
      }


      if (fieldData.order === undefined) {
        const maxOrder = await ChecklistField.max("order", {
          where: { sectionId },
          transaction,
        });
        fieldData.order = (maxOrder || 0) + 1;
      }

      const field = await ChecklistField.create(
        {
          sectionId,
          type: fieldData.type,
          label: fieldData.label,
          placeholder: fieldData.placeholder,
          helpText: fieldData.helpText,
          required: fieldData.required || false,
          order: fieldData.order,
          options: fieldData.options,
          validation: fieldData.validation,
          conditionalLogic: fieldData.conditionalLogic,
          defaultValue: fieldData.defaultValue,
          metadata: fieldData.metadata,
        },
        { transaction }
      );


      await transaction.commit();
      return { field, message: "Field added successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to add field", 500);
    }
  }


  static async updateField(fieldId, fieldData, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const field = await ChecklistField.findByPk(fieldId, {
        include: [
          {
            model: ChecklistSection,
            as: "section",
            include: [{ model: ChecklistTemplate, as: "template" }],
          },
        ],
        transaction,
      });

      if (!field) {
        throw new ApplicationError("Field not found", 404);
      }

      if (field.section.template.companyId !== companyId) {
        throw new ApplicationError("Field not found", 404);
      }

      if (field.section.template.status !== "draft") {
        throw new ApplicationError("Can only update fields in draft templates", 400);
      }

      const previousState = field.toJSON();

      await field.update(
        {
          type: fieldData.type,
          label: fieldData.label,
          placeholder: fieldData.placeholder,
          helpText: fieldData.helpText,
          required: fieldData.required,
          order: fieldData.order,
          options: fieldData.options,
          validation: fieldData.validation,
          conditionalLogic: fieldData.conditionalLogic,
          defaultValue: fieldData.defaultValue,
          metadata: fieldData.metadata,
        },
        { transaction }
      );




      await transaction.commit();
      return { field, message: "Field updated successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update field", 500);
    }
  }


  static async deleteField(fieldId, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const field = await ChecklistField.findByPk(fieldId, {
        include: [
          {
            model: ChecklistSection,
            as: "section",
            include: [{ model: ChecklistTemplate, as: "template" }],
          },
        ],
        transaction,
      });

      if (!field) {
        throw new ApplicationError("Field not found", 404);
      }

      if (field.section.template.companyId !== companyId) {
        throw new ApplicationError("Field not found", 404);
      }

      if (field.section.template.status !== "draft") {
        throw new ApplicationError("Can only delete fields from draft templates", 400);
      }

      const previousState = field.toJSON();

      await field.destroy({ transaction });




      await transaction.commit();
      return { message: "Field deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete field", 500);
    }
  }


  static async reorderFields(sectionId, fieldOrders, companyId, userId) {
    const transaction = await sequelize.transaction();
    try {
      const section = await ChecklistSection.findByPk(sectionId, {
        include: [{ model: ChecklistTemplate, as: "template" }],
        transaction,
      });

      if (!section) {
        throw new ApplicationError("Section not found", 404);
      }

      if (section.template.companyId !== companyId) {
        throw new ApplicationError("Section not found", 404);
      }

      if (section.template.status !== "draft") {
        throw new ApplicationError("Can only reorder fields in draft templates", 400);
      }


      for (const { fieldId, order } of fieldOrders) {
        await ChecklistField.update(
          { order },
          { where: { fieldId, sectionId }, transaction }
        );
      }

      await transaction.commit();
      return { message: "Fields reordered successfully" };
    } catch (error) {
      await transaction.rollback();
      throw new ApplicationError("Failed to reorder fields", 500);
    }
  }
}
