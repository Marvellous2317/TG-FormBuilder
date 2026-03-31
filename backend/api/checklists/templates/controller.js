import { CheckListTemplateRepository } from "./repository.js";
import ResponseManager from "../../../utils/responseManager.js";

export class CheckListTemplateController {

  
  static async createTemplate(req, res, next) {
    try {
      const { name, description, department } = req.body;
      const companyId = req.user.company?.companyId;
      const createdBy = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.createTemplate({
        name,
        description,
        department,
        companyId,
        createdBy,
      });

      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async getTemplates(req, res, next) {
    try {
      const companyId = req.user.company?.companyId;
      const { department, status, page, limit } = req.query;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.getTemplates({
        companyId,
        department,
        status,
        page,
        limit,
      });

      return ResponseManager.success(res, result, 200, "Templates fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getTemplateById(req, res, next) {
    try {
      const { templateId } = req.params;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.getTemplateById(templateId, companyId);

      return ResponseManager.success(res, result, 200, "Template fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async updateTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const { name, description, department } = req.body;
      const companyId = req.user.company?.companyId;
      const updatedBy = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.updateTemplate(templateId, {
        name,
        description,
        department,
        companyId,
        updatedBy,
      });

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async publishTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.publishTemplate(templateId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async archiveTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.archiveTemplate(templateId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async deleteTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.deleteTemplate(templateId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async cloneTemplate(req, res, next) {
    try {
      const { templateId } = req.params;
      const { name } = req.body;
      const companyId = req.user.company?.companyId;
      const createdBy = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.cloneTemplate(templateId, {
        name,
        companyId,
        createdBy,
      });

      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }


  
  static async addSection(req, res, next) {
    try {
      const { templateId } = req.params;
      const { name, description, order, isRepeatable, minInstances, maxInstances } = req.body;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.addSection(templateId, {
        name,
        description,
        order,
        isRepeatable,
        minInstances,
        maxInstances,
        companyId,
        userId,
      });

      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async updateSection(req, res, next) {
    try {
      const { sectionId } = req.params;
      const { name, description, order, isRepeatable, minInstances, maxInstances } = req.body;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.updateSection(sectionId, {
        name,
        description,
        order,
        isRepeatable,
        minInstances,
        maxInstances,
        companyId,
        userId,
      });

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async deleteSection(req, res, next) {
    try {
      const { sectionId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.deleteSection(sectionId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async reorderSections(req, res, next) {
    try {
      const { templateId } = req.params;
      const { sectionOrders } = req.body;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.reorderSections(
        templateId,
        sectionOrders,
        companyId,
        userId
      );

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }


  
  static async addField(req, res, next) {
    try {
      const { sectionId } = req.params;
      const fieldData = req.body;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.addField(sectionId, fieldData, companyId, userId);

      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async updateField(req, res, next) {
    try {
      const { fieldId } = req.params;
      const fieldData = req.body;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.updateField(fieldId, fieldData, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async deleteField(req, res, next) {
    try {
      const { fieldId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.deleteField(fieldId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async reorderFields(req, res, next) {
    try {
      const { sectionId } = req.params;
      const { fieldOrders } = req.body;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListTemplateRepository.reorderFields(
        sectionId,
        fieldOrders,
        companyId,
        userId
      );

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }
}
