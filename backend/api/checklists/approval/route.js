import express from "express";
import { isAuthenticated, requiresRole } from "../../middlewares/authorization.js";
import { ApprovalController } from "./controller.js";
import { validateSubmittedChecklistId, validatePaginationQuery, validateHistoryQuery } from "./middleware.js";

const router = express.Router();

router.get("/", isAuthenticated, requiresRole("approval"), validatePaginationQuery, ApprovalController.getPendingSubmissions);

router.get("/history", isAuthenticated, requiresRole("approval"), validateHistoryQuery, ApprovalController.getHistory);

router.get("/:submittedChecklistId", isAuthenticated, requiresRole("approval"), validateSubmittedChecklistId, ApprovalController.getSubmissionById);

router.post("/:submittedChecklistId/approve", isAuthenticated, requiresRole("approval"), validateSubmittedChecklistId, ApprovalController.approveSubmission);

router.post("/:submittedChecklistId/reject", isAuthenticated, requiresRole("approval"), validateSubmittedChecklistId, ApprovalController.rejectSubmission);

export default router;
