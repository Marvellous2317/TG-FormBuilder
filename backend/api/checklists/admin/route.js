import express from "express";
import { isAuthenticated, adminRequired, requiresRole } from "../../middlewares/authorization.js";
import { AdminController } from "./controller.js";
import {
  validateCreateChecklist, validateUpdateChecklist, validateChecklistId,
  validateChecklistQuery, validateCreateEntries, validateCreateOrUpdateEntries,
  validateEntryId,
  validateCreateAssignment, validateUnassignment, validateAssignmentId, validateAssignmentQuery,
} from "./middleware.js";

const router = express.Router();

const allowedRoles = ["admin", "superAdmin"]

//const Roles = ["operator", "approval", "admin", "superAdmin"]

router.post("/", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateChecklist, AdminController.createChecklist);
router.get("/", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistQuery, AdminController.getChecklists);
router.get("/:checklistId", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistId, AdminController.getChecklistById);
router.put("/:checklistId", isAuthenticated, requiresRole("admin", "superAdmin"), validateUpdateChecklist, AdminController.updateChecklist);
router.delete("/:checklistId", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistId, AdminController.deleteChecklist);


router.get("/:checklistId/entries", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistId, AdminController.getEntries);
router.post("/:checklistId/entries", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateEntries, AdminController.createEntries);
router.put("/:checklistId/entries", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateOrUpdateEntries, AdminController.createOrUpdateEntries);
router.delete("/entries/:entryId", isAuthenticated, requiresRole("admin", "superAdmin"), validateEntryId, AdminController.deleteEntry);


router.post("/assignments", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateAssignment, AdminController.createAssignment);
router.post("/unassignments", isAuthenticated, requiresRole("admin", "superAdmin"), validateUnassignment, AdminController.unassignOperator);
router.get("/assignments", isAuthenticated, requiresRole("admin", "superAdmin"), validateAssignmentQuery, AdminController.getAssignments);
router.get("/assignments/:assignmentId", isAuthenticated, requiresRole("admin", "superAdmin"), validateAssignmentId, AdminController.getAssignmentById);

export default router;
