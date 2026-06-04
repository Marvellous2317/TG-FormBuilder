import { body, param, query } from "express-validator";
import { validationResult } from "express-validator";
import ResponseManager from "../../../utils/responseManager.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return ResponseManager.error(res, "ValidationError", errorMessages.join(", "), 400);
  }
  next();
};

// Checklist validation
export const validateCreateChecklist = [
  body("title").trim().notEmpty().withMessage("Checklist title is required")
    .isLength({ max: 255 }).withMessage("Title must be less than 255 characters"),
  body("documentNumber").trim().notEmpty().withMessage("Document number is required")
    .isLength({ max: 100 }).withMessage("Document number must be less than 100 characters"),
  body("departmentId").optional({ nullable: true }).isUUID().withMessage("Department ID must be a valid UUID"),
  body("frequency").optional({ nullable: true }).isIn(["hourly", "daily", "weekly", "monthly"])
    .withMessage("Frequency must be one of: hourly, daily, weekly, monthly"),
  body("frequencyInterval").optional({ nullable: true }).isInt({ min: 1, max: 24 })
    .withMessage("Frequency interval must be between 1 and 24 hours"),
  body().custom((body) => {
    if (body.frequency === "hourly" && (!body.frequencyInterval || body.frequencyInterval < 1)) {
      throw new Error("Frequency interval is required when frequency is hourly");
    }
    return true;
  }),
  validate,
];

export const validateUpdateChecklist = [
  param("checklistId").isUUID().withMessage("Invalid checklist ID"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 255 }).withMessage("Title must be less than 255 characters"),
  body("documentNumber").optional().trim().notEmpty().withMessage("Document number cannot be empty")
    .isLength({ max: 100 }).withMessage("Document number must be less than 100 characters"),
  body("departmentId").optional({ nullable: true }).isUUID().withMessage("Department ID must be a valid UUID"),
  body("frequency").optional({ nullable: true }).isIn(["hourly", "daily", "weekly", "monthly", null])
    .withMessage("Frequency must be one of: hourly, daily, weekly, monthly"),
  body("frequencyInterval").optional({ nullable: true }).isInt({ min: 1, max: 24 })
    .withMessage("Frequency interval must be between 1 and 24 hours"),
  body().custom((body) => {
    if (body.frequency === "hourly" && body.frequencyInterval !== undefined && body.frequencyInterval < 1) {
      throw new Error("Frequency interval must be at least 1 when frequency is hourly");
    }
    return true;
  }),
  validate,
];

export const validateChecklistId = [
  param("checklistId").isUUID().withMessage("Invalid checklist ID"),
  validate,
];

export const validateChecklistQuery = [
  query("status").optional().isIn(["active", "inactive"]).withMessage("Status must be active or inactive"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  query("companyId").optional().isUUID().withMessage("Company ID must be a valid UUID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  query("departmentId").optional().isUUID().withMessage("Department ID must be a valid UUID"),
  query("deleted").optional().isIn(["true", "false", "all"]).withMessage("Deleted must be true, false, or all"),
  validate,
];

export const validateSubmittedChecklistId = [
  param("checklistId").isUUID().withMessage("Invalid checklist ID"),
  param("submittedChecklistId").isUUID().withMessage("Invalid submission ID"),
  validate,
];

export const validateSubmittedChecklistQuery = [
  param("checklistId").isUUID().withMessage("Invalid checklist ID"),
  query("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Invalid status"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be positive"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  validate,
];

export const validateSubmittedChecklistUpdate = [
  param("checklistId").isUUID().withMessage("Invalid checklist ID"),
  param("submittedChecklistId").isUUID().withMessage("Invalid submission ID"),
  body("data").isArray({ min: 1 }).withMessage("data must be a non-empty array"),
  body("data.*.entryId").isUUID().withMessage("Invalid entry ID"),
  validate,
];

// Entry validation
export const validateCreateEntries = [
  param("checklistId").isUUID().withMessage("Invalid checklist ID"),
  body("entries").isArray({ min: 1 }).withMessage("entries must be a non-empty array"),
  body("entries.*.name").trim().notEmpty().withMessage("Entry name is required")
    .isLength({ max: 500 }).withMessage("Name must be less than 500 characters"),
  body("entries.*.type").optional().isIn(["text", "number", "dropdown", "date", "time", "enum", "name", "formular", "section", "section_formular"])
    .withMessage("Invalid field type"),
  body("entries.*.section").optional({ nullable: true }).isString().isLength({ max: 255 }).withMessage("Section must be a string (max 255 chars)"),
  body("entries.*.image").optional({ nullable: true }).isBoolean().withMessage("Image must be a boolean"),
  body("entries.*.section_formular").optional({ nullable: true }).isString().isLength({ max: 255 }).withMessage("Section formula must be a string (max 255 chars)"),
  body("entries.*.order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
  body("entries.*.required").optional().isBoolean().withMessage("Required must be a boolean"),
  body("entries.*.formulaExpression").optional({ nullable: true }).isString().withMessage("Formula expression must be a string"),
  body("entries.*.options").optional({ nullable: true }).isArray().withMessage("Options must be an array"),
  body("entries").custom((entries) => {
    // for (const [i, entry] of entries.entries()) {
    //   if (entry.type === "formular" && !entry.formulaExpression) {
    //     throw new Error(`entries[${i}]: formulaExpression is required when type is formular`);
    //   }
    
    // }
    return true;
  }),
  validate,
];

export const validateCreateOrUpdateEntries = [
  param("checklistId").isUUID().withMessage("Invalid checklist ID"),
  body("entries").isArray({ min: 1 }).withMessage("entries must be a non-empty array"),
  body("entries.*.entryId").optional().isUUID().withMessage("Invalid entry ID"),
  body("entries.*.name").trim().notEmpty().withMessage("Entry name is required")
    .isLength({ max: 500 }).withMessage("Name must be less than 500 characters"),
  body("entries.*.type").optional().isIn(["text", "number", "dropdown", "date", "time", "enum", "name", "formular", "section", "section_formular"])
    .withMessage("Invalid field type"),
  body("entries.*.section").optional({ nullable: true }).isString().isLength({ max: 255 }).withMessage("Section must be a string (max 255 chars)"),
  body("entries.*.image").optional({ nullable: true }).isBoolean().withMessage("Image must be a boolean"),
  body("entries.*.section_formular").optional({ nullable: true }).isString().isLength({ max: 255 }).withMessage("Section formula must be a string (max 255 chars)"),
  body("entries.*.formulaExpression").optional({ nullable: true }).isString().withMessage("Formula expression must be a string"),
  body("entries.*.options").optional({ nullable: true }).isArray().withMessage("Options must be an array"),
  body("entries").custom((entries) => {
    // for (const [i, entry] of entries.entries()) {
    //   if (entry.type === "formula" && !entry.formulaExpression) {
    //     throw new Error(`entries[${i}]: formulaExpression is required when type is formula`);
    //   }
     
    // }
    return true;
  }),
  validate,
];

export const validateEntryId = [
  param("entryId").isUUID().withMessage("Invalid entry ID"),
  validate,
];

// Assignment validation
export const validateCreateAssignment = [
  body("checklistId").isUUID().withMessage("Invalid checklist ID"),
  body("assignedTo").isUUID().withMessage("Invalid operator ID"),
  body("notes").optional().isLength({ max: 2000 }).withMessage("Notes too long"),
  body("dueDate").optional().isISO8601().withMessage("Invalid due date format"),
  validate,
];

export const validateUnassignment = [
  body("checklistId").isUUID().withMessage("Invalid checklist ID"),
  body("assignedTo").isUUID().withMessage("Invalid operator ID"),
  validate,
];

export const validateAssignmentId = [
  param("assignmentId").isUUID().withMessage("Invalid assignment ID"),
  validate,
];

export const validateAssignmentQuery = [
  query("status").optional().isIn(["pending", "in_progress", "submitted", "approved", "rejected"])
    .withMessage("Invalid status"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  query("checklistId").optional().isUUID().withMessage("Checklist ID must be a valid UUID"),
  query("assignedTo").optional().isUUID().withMessage("Assigned To must be a valid UUID"),
  query("companyId").optional().isUUID().withMessage("Company ID must be a valid UUID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  validate,
];

// Catalog validation
export const validateCreateCatalog = [
  body("name").trim().notEmpty().withMessage("Catalog name is required")
    .isLength({ max: 255 }).withMessage("Name must be less than 255 characters"),
  body("list").isArray({ min: 1 }).withMessage("List must be a non-empty array"),
  body("list.*").isString().withMessage("Each list item must be a string")
    .trim().notEmpty().withMessage("List items cannot be empty"),
  validate,
];

export const validateUpdateCatalog = [
  param("catalogId").isUUID().withMessage("Invalid catalog ID"),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty")
    .isLength({ max: 255 }).withMessage("Name must be less than 255 characters"),
  body("list").optional().isArray().withMessage("List must be an array"),
  body("list.*").optional().isString().withMessage("Each list item must be a string")
    .trim().notEmpty().withMessage("List items cannot be empty"),
  validate,
];

export const validateCatalogId = [
  param("catalogId").isUUID().withMessage("Invalid catalog ID"),
  validate,
];

export const validateCatalogQuery = [
  query("search").optional().isString().withMessage("Search must be a string"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  validate,
];
