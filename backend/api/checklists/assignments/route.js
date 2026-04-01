import express from "express";
import { isAuthenticated, adminRequired } from "../../middlewares/authorization.js";
import { CheckListAssignmentController } from "./controller.js";
import {
  validateCreateAssignment,
  validateBulkAssignment,
  validateUpdateAssignment,
  validateAssignmentId,
  validateAssignmentQuery,
  validateAvailableUsersQuery,
} from "./middleware.js";

const router = express.Router();

// Create single assignment
router.post(
  "/",
  isAuthenticated,
  adminRequired,
  validateCreateAssignment,
  CheckListAssignmentController.createAssignment
);

// Bulk assign to multiple users
router.post(
  "/bulk",
  isAuthenticated,
  adminRequired,
  validateBulkAssignment,
  CheckListAssignmentController.bulkAssign
);

// Get all assignments
router.get(
  "/",
  isAuthenticated,
  adminRequired,
  validateAssignmentQuery,
  CheckListAssignmentController.getAssignments
);

// Get users available for assignment to a template
router.get(
  "/available-users/:templateId",
  isAuthenticated,
  adminRequired,
  validateAvailableUsersQuery,
  CheckListAssignmentController.getAvailableUsers
);

// Get single assignment
router.get(
  "/:assignmentId",
  isAuthenticated,
  adminRequired,
  validateAssignmentId,
  CheckListAssignmentController.getAssignmentById
);

// Update assignment
router.put(
  "/:assignmentId",
  isAuthenticated,
  adminRequired,
  validateUpdateAssignment,
  CheckListAssignmentController.updateAssignment
);

// Pause assignment
router.post(
  "/:assignmentId/pause",
  isAuthenticated,
  adminRequired,
  validateAssignmentId,
  CheckListAssignmentController.pauseAssignment
);

// Resume assignment
router.post(
  "/:assignmentId/resume",
  isAuthenticated,
  adminRequired,
  validateAssignmentId,
  CheckListAssignmentController.resumeAssignment
);

// Revoke assignment
router.post(
  "/:assignmentId/revoke",
  isAuthenticated,
  adminRequired,
  validateAssignmentId,
  CheckListAssignmentController.revokeAssignment
);

// Delete assignment
router.delete(
  "/:assignmentId",
  isAuthenticated,
  adminRequired,
  validateAssignmentId,
  CheckListAssignmentController.deleteAssignment
);

export default router;
