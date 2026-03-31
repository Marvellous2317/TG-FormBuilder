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

export const validateSubmissionId = [
  param("submissionId").isUUID().withMessage("Invalid submission ID"),
  validate,
];

export const validateApproval = [
  param("submissionId").isUUID().withMessage("Invalid submission ID"),
  body("reviewNotes")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Review notes must be less than 2000 characters"),
  validate,
];

export const validateRejection = [
  param("submissionId").isUUID().withMessage("Invalid submission ID"),
  body("reviewNotes")
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isLength({ max: 2000 })
    .withMessage("Review notes must be less than 2000 characters"),
  validate,
];

export const validatePendingQuery = [
  query("department")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Department must be less than 100 characters"),
  query("templateId").optional().isUUID().withMessage("Invalid template ID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate,
];

export const validateHistoryQuery = [
  query("status")
    .optional()
    .isIn(["approved", "rejected"])
    .withMessage("Status must be approved or rejected"),
  query("templateId").optional().isUUID().withMessage("Invalid template ID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate,
];
