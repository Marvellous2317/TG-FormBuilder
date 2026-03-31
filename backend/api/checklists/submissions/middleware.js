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

export const validateSubmissionId = [
  param("submissionId").isUUID().withMessage("Invalid submission ID"),
  validate,
];

export const validateStartSubmission = [
  param("assignmentId").isUUID().withMessage("Invalid assignment ID"),
  body("deviceInfo").optional().isObject().withMessage("deviceInfo must be an object"),
  body("locationData").optional().isObject().withMessage("locationData must be an object"),
  validate,
];

export const validateSaveDraft = [
  param("submissionId").isUUID().withMessage("Invalid submission ID"),
  body("draftData").isObject().withMessage("draftData must be an object"),
  validate,
];

export const validateSubmitForm = [
  param("submissionId").isUUID().withMessage("Invalid submission ID"),
  body("responses").isArray().withMessage("responses must be an array"),
  body("responses.*.fieldId").isUUID().withMessage("Invalid field ID in responses"),
  body("responses.*.sectionInstanceIndex")
    .optional()
    .isInt({ min: 0 })
    .withMessage("sectionInstanceIndex must be a non-negative integer"),
  validate,
];

export const validateMyAssignmentsQuery = [
  query("status")
    .optional()
    .isIn(["active", "paused", "revoked"])
    .withMessage("Status must be active, paused, or revoked"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate,
];

export const validateMySubmissionsQuery = [
  query("assignmentId").optional().isUUID().withMessage("Invalid assignment ID"),
  query("status")
    .optional()
    .isIn(["draft", "submitted", "pending_review", "approved", "rejected"])
    .withMessage("Invalid status"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate,
];
