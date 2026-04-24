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

export const validateSubmittedChecklistId = [
  param("submittedChecklistId").isUUID().withMessage("Invalid submission ID"),
  validate,
];

export const validatePaginationQuery = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be positive"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  validate,
];

export const validateHistoryQuery = [
  query("status").optional().isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be positive"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  validate,
];

export const validateApproveWithData = [
  param("submittedChecklistId").isUUID().withMessage("Invalid submission ID"),
  body("data").isArray({ min: 1 }).withMessage("data must be a non-empty array"),
  body("data.*.entryId").isUUID().withMessage("Invalid entry ID"),
  validate,
];
