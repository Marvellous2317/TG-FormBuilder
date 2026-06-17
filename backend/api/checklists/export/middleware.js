import { query, validationResult } from "express-validator";
import ResponseManager from "../../../utils/responseManager.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return ResponseManager.error(res, "ValidationError", errorMessages.join(", "), 400);
  }
  next();
};

export const validateExportSubmittedChecklistQuery = [
  query("documentNumber").trim().notEmpty().withMessage("documentNumber is required"),
  query("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Invalid status"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  query("limit").optional().isInt({ min: 1, max: 1000 }).withMessage("Limit must be 1-1000"),
  validate,
];
