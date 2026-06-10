import express from "express";
import { isAuthenticated, requiresRole } from "../../middlewares/authorization.js";
import { ApprovalController } from "./controller.js";
import { validateSubmittedChecklistId, validatePaginationQuery, validateHistoryQuery, validateApproveWithData, isApproverForSubmission } from "./middleware.js";

const router = express.Router();

router.get("/", isAuthenticated,  validatePaginationQuery, ApprovalController.getPendingSubmissions);

router.get("/history", isAuthenticated, validateHistoryQuery, ApprovalController.getHistory);

router.get("/:submittedChecklistId", isAuthenticated, validateSubmittedChecklistId, isApproverForSubmission, ApprovalController.getSubmissionById);

router.post("/:submittedChecklistId/approve", isAuthenticated, validateApproveWithData, isApproverForSubmission, ApprovalController.approveSubmission);

router.post("/:submittedChecklistId/reject", isAuthenticated, validateSubmittedChecklistId, isApproverForSubmission, ApprovalController.rejectSubmission);

export default router;
