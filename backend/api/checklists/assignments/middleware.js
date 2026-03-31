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

export const validateCreateAssignment = [
  body("templateId").isUUID().withMessage("Invalid template ID"),
  body("assignedTo").isUUID().withMessage("Invalid assignee user ID"),
  body("approverId").isUUID().withMessage("Invalid approver user ID"),
  body("allowMultipleSubmissions")
    .optional()
    .isBoolean()
    .withMessage("allowMultipleSubmissions must be a boolean"),
  body("maxSubmissions")
    .optional()
    .isInt({ min: 1 })
    .withMessage("maxSubmissions must be a positive integer"),
  body("notes")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Notes must be less than 2000 characters"),
  body("validFrom").optional().isISO8601().withMessage("validFrom must be a valid date"),
  body("validUntil").optional().isISO8601().withMessage("validUntil must be a valid date"),
  validate,
];

export const validateBulkAssignment = [
  body("templateId").isUUID().withMessage("Invalid template ID"),
  body("userIds")
    .isArray({ min: 1 })
    .withMessage("userIds must be a non-empty array"),
  body("userIds.*").isUUID().withMessage("Invalid user ID in userIds array"),
  body("approverId").isUUID().withMessage("Invalid approver user ID"),
  body("allowMultipleSubmissions")
    .optional()
    .isBoolean()
    .withMessage("allowMultipleSubmissions must be a boolean"),
  body("maxSubmissions")
    .optional()
    .isInt({ min: 1 })
    .withMessage("maxSubmissions must be a positive integer"),
  body("notes")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Notes must be less than 2000 characters"),
  body("validFrom").optional().isISO8601().withMessage("validFrom must be a valid date"),
  body("validUntil").optional().isISO8601().withMessage("validUntil must be a valid date"),
  validate,
];

export const validateUpdateAssignment = [
  param("assignmentId").isUUID().withMessage("Invalid assignment ID"),
  body("approverId").optional().isUUID().withMessage("Invalid approver user ID"),
  body("maxSubmissions")
    .optional()
    .isInt({ min: 1 })
    .withMessage("maxSubmissions must be a positive integer"),
  body("notes")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Notes must be less than 2000 characters"),
  body("validFrom").optional().isISO8601().withMessage("validFrom must be a valid date"),
  body("validUntil").optional().isISO8601().withMessage("validUntil must be a valid date"),
  validate,
];

export const validateAssignmentId = [
  param("assignmentId").isUUID().withMessage("Invalid assignment ID"),
  validate,
];

export const validateAssignmentQuery = [
  query("templateId").optional().isUUID().withMessage("Invalid template ID"),
  query("assignedTo").optional().isUUID().withMessage("Invalid assignee user ID"),
  query("approverId").optional().isUUID().withMessage("Invalid approver user ID"),
  query("status")
    .optional()
    .isIn(["active", "paused", "revoked"])
    .withMessage("Status must be active, paused, or revoked"),
  query("department")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Department must be less than 100 characters"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate,
];

export const validateAvailableUsersQuery = [
  param("templateId").isUUID().withMessage("Invalid template ID"),
  query("department")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Department must be less than 100 characters"),
  validate,
];
