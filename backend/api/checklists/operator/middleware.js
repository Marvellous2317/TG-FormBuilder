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

export const validateAssignmentId = [
  param("assignmentId").isUUID().withMessage("Invalid assignment ID"),
  validate,
];

export const validateSubmitChecklist = [
  param("assignmentId").isUUID().withMessage("Invalid assignment ID"),
  body("data").isArray({ min: 1 }).withMessage("data must be a non-empty array"),
  body("data.*.entryId").isUUID().withMessage("Invalid entry ID"),
  validate,
];

export const validateSaveDraft = [
  param("assignmentId").isUUID().withMessage("Invalid assignment ID"),
  body("data").isArray().withMessage("data must be an array"),
  validate,
];

export const validateSubmittedChecklistId = [
  param("submittedChecklistId").isUUID().withMessage("Invalid submission ID"),
  validate,
];

export const validateUpdateSubmission = [
  param("submittedChecklistId").isUUID().withMessage("Invalid submission ID"),
  body("data").isArray({ min: 1 }).withMessage("data must be a non-empty array"),
  body("data.*.entryId").isUUID().withMessage("Invalid entry ID"),
  validate,
];

export const validateSubmissionQuery = [
  query("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Invalid status"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be positive"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  validate,
];
