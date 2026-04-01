import express from "express";
import { isAuthenticated, adminRequired } from "../../middlewares/authorization.js";
import { CheckListTemplateController } from "./controller.js";
import {
  validateCreateTemplate,
  validateUpdateTemplate,
  validateCreateSection,
  validateUpdateSection,
  validateReorderSections,
  validateCreateField,
  validateUpdateField,
  validateReorderFields,
  validateTemplateQuery,
  validateTemplateId,
  validateSectionId,
  validateFieldId,
} from "./middleware.js";

const router = express.Router();


router.post(
  "/",
  isAuthenticated,
  adminRequired,
  validateCreateTemplate,
  CheckListTemplateController.createTemplate
);


router.get(
  "/",
  isAuthenticated,
  adminRequired,
  validateTemplateQuery,
  CheckListTemplateController.getTemplates
);


router.get(
  "/:templateId",
  isAuthenticated,
  adminRequired,
  validateTemplateId,
  CheckListTemplateController.getTemplateById
);


router.put(
  "/:templateId",
  isAuthenticated,
  adminRequired,
  validateUpdateTemplate,
  CheckListTemplateController.updateTemplate
);


router.post(
  "/:templateId/publish",
  isAuthenticated,
  adminRequired,
  validateTemplateId,
  CheckListTemplateController.publishTemplate
);


router.post(
  "/:templateId/archive",
  isAuthenticated,
  adminRequired,
  validateTemplateId,
  CheckListTemplateController.archiveTemplate
);


router.post(
  "/:templateId/clone",
  isAuthenticated,
  adminRequired,
  validateTemplateId,
  CheckListTemplateController.cloneTemplate
);


router.delete(
  "/:templateId",
  isAuthenticated,
  adminRequired,
  validateTemplateId,
  CheckListTemplateController.deleteTemplate
);


router.post(
  "/:templateId/sections",
  isAuthenticated,
  adminRequired,
  validateCreateSection,
  CheckListTemplateController.addSection
);


router.put(
  "/:templateId/sections/reorder",
  isAuthenticated,
  adminRequired,
  validateReorderSections,
  CheckListTemplateController.reorderSections
);


router.put(
  "/sections/:sectionId",
  isAuthenticated,
  adminRequired,
  validateUpdateSection,
  CheckListTemplateController.updateSection
);


router.delete(
  "/sections/:sectionId",
  isAuthenticated,
  adminRequired,
  validateSectionId,
  CheckListTemplateController.deleteSection
);


router.post(
  "/sections/:sectionId/fields",
  isAuthenticated,
  adminRequired,
  validateCreateField,
  CheckListTemplateController.addField
);


router.put(
  "/sections/:sectionId/fields/reorder",
  isAuthenticated,
  adminRequired,
  validateReorderFields,
  CheckListTemplateController.reorderFields
);


router.put(
  "/fields/:fieldId",
  isAuthenticated,
  adminRequired,
  validateUpdateField,
  CheckListTemplateController.updateField
);


router.delete(
  "/fields/:fieldId",
  isAuthenticated,
  adminRequired,
  validateFieldId,
  CheckListTemplateController.deleteField
);

export default router;
