import express from "express";
import { isAuthenticated } from "../../middlewares/authorization.js";
import { ChecklistSubmissionController } from "./controller.js";
import {
  validateAssignmentId,
  validateSubmissionId,
  validateStartSubmission,
  validateSaveDraft,
  validateSubmitForm,
  validateMyAssignmentsQuery,
  validateMySubmissionsQuery,
} from "./middleware.js";

const router = express.Router();

// Get my assigned forms
router.get(
  "/assignments",
  isAuthenticated,
  validateMyAssignmentsQuery,
  ChecklistSubmissionController.getMyAssignments
);

// Get assignment with form structure for filling
router.get(
  "/assignments/:assignmentId",
  isAuthenticated,
  validateAssignmentId,
  ChecklistSubmissionController.getAssignmentForFilling
);

// Start a new submission (creates draft)
router.post(
  "/assignments/:assignmentId/start",
  isAuthenticated,
  validateStartSubmission,
  ChecklistSubmissionController.startSubmission
);

// Get submission history for an assignment
router.get(
  "/assignments/:assignmentId/history",
  isAuthenticated,
  validateAssignmentId,
  ChecklistSubmissionController.getAssignmentHistory
);

// Get all my submissions
router.get(
  "/submissions",
  isAuthenticated,
  validateMySubmissionsQuery,
  ChecklistSubmissionController.getMySubmissions
);

// Get single submission
router.get(
  "/submissions/:submissionId",
  isAuthenticated,
  validateSubmissionId,
  ChecklistSubmissionController.getSubmissionById
);

// Save draft (auto-save)
router.put(
  "/submissions/:submissionId",
  isAuthenticated,
  validateSaveDraft,
  ChecklistSubmissionController.saveDraft
);

// Submit form
router.post(
  "/submissions/:submissionId/submit",
  isAuthenticated,
  validateSubmitForm,
  ChecklistSubmissionController.submitForm
);

// Discard draft
router.delete(
  "/submissions/:submissionId",
  isAuthenticated,
  validateSubmissionId,
  ChecklistSubmissionController.discardDraft
);

export default router;
