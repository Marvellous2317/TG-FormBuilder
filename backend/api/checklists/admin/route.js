import express from "express";
import { isAuthenticated, adminRequired, requiresRole } from "../../middlewares/authorization.js";
import { AdminController } from "./controller.js";
import {
  validateCreateChecklist, validateUpdateChecklist, validateChecklistId,
  validateChecklistQuery, validateCreateEntries, validateCreateOrUpdateEntries,
  validateEntryId,
  validateCreateAssignment, validateUnassignment, validateAssignmentId, validateAssignmentQuery,
  validateCreateCatalog, validateUpdateCatalog, validateCatalogId, validateCatalogQuery,
} from "./middleware.js";

const router = express.Router();

const allowedRoles = ["admin", "superAdmin", "operator", "approver"];

 

 
router.post("/", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateChecklist, AdminController.createChecklist);
router.get("/", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistQuery, AdminController.getChecklists);

 
router.delete("/entries/:entryId", isAuthenticated, requiresRole("admin", "superAdmin"), validateEntryId, AdminController.deleteEntry);

 
router.post("/assignments", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateAssignment, AdminController.createAssignment);
router.post("/unassignments", isAuthenticated, requiresRole("admin", "superAdmin"), validateUnassignment, AdminController.unassignOperator);
router.get("/assignments", isAuthenticated, requiresRole("admin", "superAdmin"), validateAssignmentQuery, AdminController.getAssignments);
router.get("/assignments/:assignmentId", isAuthenticated, requiresRole("admin", "superAdmin"), validateAssignmentId, AdminController.getAssignmentById);

 
router.post("/catalogs", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateCatalog, AdminController.createCatalog);
router.get("/get-all-catalogs", isAuthenticated, requiresRole("admin", "superAdmin"), validateCatalogQuery, AdminController.getCatalogs);
router.get("/catalogs/:catalogId", isAuthenticated, requiresRole("admin", "superAdmin","operator", "approval"), validateCatalogId, AdminController.getCatalogById);
router.put("/catalogs/:catalogId", isAuthenticated, requiresRole("admin", "superAdmin"), validateUpdateCatalog, AdminController.updateCatalog);
router.delete("/catalogs/:catalogId", isAuthenticated, requiresRole("admin", "superAdmin"), validateCatalogId, AdminController.deleteCatalog);

 
router.get("/:checklistId", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistId, AdminController.getChecklistById);
router.put("/:checklistId", isAuthenticated, requiresRole("admin", "superAdmin"), validateUpdateChecklist, AdminController.updateChecklist);
router.delete("/:checklistId", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistId, AdminController.deleteChecklist);
router.put("/:checklistId/restore", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistId, AdminController.restoreChecklist);
router.put("/:checklistId/entries", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateOrUpdateEntries, AdminController.createOrUpdateEntries);

 
router.get("/:checklistId/entries", isAuthenticated, requiresRole("admin", "superAdmin"), validateChecklistId, AdminController.getEntries);
router.post("/:checklistId/entries", isAuthenticated, requiresRole("admin", "superAdmin"), validateCreateEntries, AdminController.createEntries);

export default router;
