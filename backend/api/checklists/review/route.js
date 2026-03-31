import express from "express";
import { isAuthenticated, approvalRequired } from "../../middlewares/authorization.js";
import { CheckListReviewController } from "./controller.js";
import {
  validateSubmissionId,
  validateApproval,
  validateRejection,
  validatePendingQuery,
  validateHistoryQuery,
} from "./middleware.js";

const router = express.Router();
 
router.get(
  "/submissions",
  isAuthenticated,
  approvalRequired,
  validatePendingQuery,
  CheckListReviewController.getPendingSubmissions
);

 
router.get(
  "/stats",
  isAuthenticated,
  approvalRequired,
  CheckListReviewController.getReviewStats
);
 
router.get(
  "/history",
  isAuthenticated,
  approvalRequired,
  validateHistoryQuery,
  CheckListReviewController.getReviewHistory
);

 
router.get(
  "/submissions/:submissionId",
  isAuthenticated,
  approvalRequired,
  validateSubmissionId,
  CheckListReviewController.getSubmissionForReview
);

 
router.post(
  "/submissions/:submissionId/pickup",
  isAuthenticated,
  approvalRequired,
  validateSubmissionId,
  CheckListReviewController.pickupSubmission
);

 
router.post(
  "/submissions/:submissionId/approve",
  isAuthenticated,
  approvalRequired,
  validateApproval,
  CheckListReviewController.approveSubmission
);

 
router.post(
  "/submissions/:submissionId/reject",
  isAuthenticated,
  approvalRequired,
  validateRejection,
  CheckListReviewController.rejectSubmission
);

export default router;
