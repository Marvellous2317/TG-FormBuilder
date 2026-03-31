import { body, param, query } from "express-validator";
import { validationResult } from "express-validator";
import ResponseManager from "../../../utils/responseManager.js";

// Validation result checker middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return ResponseManager.error(res, "ValidationError", errorMessages.join(", "), 400);
  }
  next();
};

// Template validation
export const validateCreateTemplate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Template name is required")
    .isLength({ max: 255 })
    .withMessage("Template name must be less than 255 characters"),
  body("description")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("Description must be less than 5000 characters"),
  body("department")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Department must be less than 100 characters"),
  validate,
];

export const validateUpdateTemplate = [
  param("templateId").isUUID().withMessage("Invalid template ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Template name cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Template name must be less than 255 characters"),
  body("description")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("Description must be less than 5000 characters"),
  body("department")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Department must be less than 100 characters"),
  validate,
];

// Section validation
export const validateCreateSection = [
  param("templateId").isUUID().withMessage("Invalid template ID"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Section name is required")
    .isLength({ max: 255 })
    .withMessage("Section name must be less than 255 characters"),
  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  body("isRepeatable").optional().isBoolean().withMessage("isRepeatable must be a boolean"),
  body("minInstances")
    .optional()
    .isInt({ min: 1 })
    .withMessage("minInstances must be at least 1"),
  body("maxInstances")
    .optional()
    .isInt({ min: 1 })
    .withMessage("maxInstances must be at least 1"),
  validate,
];

export const validateUpdateSection = [
  param("sectionId").isUUID().withMessage("Invalid section ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Section name cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Section name must be less than 255 characters"),
  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  body("isRepeatable").optional().isBoolean().withMessage("isRepeatable must be a boolean"),
  validate,
];

export const validateReorderSections = [
  param("templateId").isUUID().withMessage("Invalid template ID"),
  body("sectionOrders")
    .isArray({ min: 1 })
    .withMessage("sectionOrders must be a non-empty array"),
  body("sectionOrders.*.sectionId").isUUID().withMessage("Invalid section ID in order array"),
  body("sectionOrders.*.order").isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  validate,
];

// Field validation
const VALID_FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "decimal",
  "date",
  "datetime",
  "time",
  "select",
  "multiselect",
  "radio",
  "checkbox",
  "file",
  "image",
  "signature",
  "location",
  "barcode",
  "qrcode",
  "calculated",
  "lookup",
];

export const validateCreateField = [
  param("sectionId").isUUID().withMessage("Invalid section ID"),
  body("type")
    .isIn(VALID_FIELD_TYPES)
    .withMessage(`Field type must be one of: ${VALID_FIELD_TYPES.join(", ")}`),
  body("label")
    .trim()
    .notEmpty()
    .withMessage("Field label is required")
    .isLength({ max: 500 })
    .withMessage("Field label must be less than 500 characters"),
  body("placeholder")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Placeholder must be less than 255 characters"),
  body("helpText")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Help text must be less than 2000 characters"),
  body("required").optional().isBoolean().withMessage("required must be a boolean"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  body("options").optional().isArray().withMessage("Options must be an array"),
  body("validation").optional().isObject().withMessage("Validation must be an object"),
  body("conditionalLogic").optional().isObject().withMessage("Conditional logic must be an object"),
  body("metadata").optional().isObject().withMessage("Metadata must be an object"),
  validate,
];

export const validateUpdateField = [
  param("fieldId").isUUID().withMessage("Invalid field ID"),
  body("type")
    .optional()
    .isIn(VALID_FIELD_TYPES)
    .withMessage(`Field type must be one of: ${VALID_FIELD_TYPES.join(", ")}`),
  body("label")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Field label cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Field label must be less than 500 characters"),
  body("placeholder")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Placeholder must be less than 255 characters"),
  body("required").optional().isBoolean().withMessage("required must be a boolean"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  validate,
];

export const validateReorderFields = [
  param("sectionId").isUUID().withMessage("Invalid section ID"),
  body("fieldOrders")
    .isArray({ min: 1 })
    .withMessage("fieldOrders must be a non-empty array"),
  body("fieldOrders.*.fieldId").isUUID().withMessage("Invalid field ID in order array"),
  body("fieldOrders.*.order").isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  validate,
];

// Query validation
export const validateTemplateQuery = [
  query("department")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Department must be less than 100 characters"),
  query("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be draft, published, or archived"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate,
];

export const validateTemplateId = [
  param("templateId").isUUID().withMessage("Invalid template ID"),
  validate,
];

export const validateSectionId = [
  param("sectionId").isUUID().withMessage("Invalid section ID"),
  validate,
];

export const validateFieldId = [
  param("fieldId").isUUID().withMessage("Invalid field ID"),
  validate,
];
