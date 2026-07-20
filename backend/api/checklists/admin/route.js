import express from "express";
import { isAuthenticated, adminRequired, requiresRole, requiresWriteAccess } from "../../middlewares/authorization.js";
import { AdminController } from "./controller.js";
import {
  validateCreateChecklist, validateUpdateChecklist, validateChecklistId,
  validateChecklistQuery, validateCreateEntries, validateCreateOrUpdateEntries,
  validateEntryId,
  validateCreateAssignment, validateUnassignment, validateAssignmentId, validateAssignmentQuery,
  validateCreateCatalog, validateUpdateCatalog, validateCatalogId, validateCatalogQuery,
  validateSubmittedChecklistId, validateSubmittedChecklistQuery, validateSubmittedChecklistUpdate,
  validateVersionQuery, validateVersionId,
} from "./middleware.js";

const router = express.Router();




router.post("/", isAuthenticated, adminRequired, requiresWriteAccess, validateCreateChecklist, AdminController.createChecklist);
router.get("/", isAuthenticated, adminRequired, validateChecklistQuery, AdminController.getChecklists);


router.delete("/entries/:entryId", isAuthenticated, adminRequired, requiresWriteAccess, validateEntryId, AdminController.deleteEntry);


router.post("/assignments", isAuthenticated, adminRequired, requiresWriteAccess, validateCreateAssignment, AdminController.createAssignment);
router.post("/unassignments", isAuthenticated, adminRequired, requiresWriteAccess, validateUnassignment, AdminController.unassignOperator);
router.get("/assignments", isAuthenticated, adminRequired, validateAssignmentQuery, AdminController.getAssignments);
router.get("/assignments/:assignmentId", isAuthenticated, adminRequired, validateAssignmentId, AdminController.getAssignmentById);


router.post("/catalogs", isAuthenticated, adminRequired, requiresWriteAccess, validateCreateCatalog, AdminController.createCatalog);
router.get("/get-all-catalogs", isAuthenticated, adminRequired, validateCatalogQuery, AdminController.getCatalogs);
router.get("/catalogs/:catalogId", isAuthenticated, requiresRole("admin", "superAdmin","operator", "approval"), validateCatalogId, AdminController.getCatalogById);
router.put("/catalogs/:catalogId", isAuthenticated, adminRequired, requiresWriteAccess, validateUpdateCatalog, AdminController.updateCatalog);
router.delete("/catalogs/:catalogId", isAuthenticated, adminRequired, requiresWriteAccess, validateCatalogId, AdminController.deleteCatalog);

router.get("/versions/:checklistId", isAuthenticated, adminRequired, validateVersionQuery, AdminController.getChecklistVersions);
router.get("/versions/:checklistId/:versionChecklistId", isAuthenticated, adminRequired, validateVersionId, AdminController.getChecklistVersionById);

router.get("/submissions/:checklistId", isAuthenticated, adminRequired, validateSubmittedChecklistQuery, AdminController.getSubmittedChecklistsByChecklistId);
router.get("/submissions/:checklistId/:submittedChecklistId", isAuthenticated, adminRequired, validateSubmittedChecklistId, AdminController.getSubmittedChecklistById);
router.put("/submissions/:checklistId/:submittedChecklistId", isAuthenticated, adminRequired, requiresWriteAccess, validateSubmittedChecklistUpdate, AdminController.updateSubmittedChecklistEntry);


router.get("/:checklistId", isAuthenticated, adminRequired, validateChecklistId, AdminController.getChecklistById);
router.put("/:checklistId", isAuthenticated, adminRequired, requiresWriteAccess, validateUpdateChecklist, AdminController.updateChecklist);
router.delete("/:checklistId", isAuthenticated, adminRequired, requiresWriteAccess, validateChecklistId, AdminController.deleteChecklist);
router.put("/:checklistId/restore", isAuthenticated, adminRequired, requiresWriteAccess, validateChecklistId, AdminController.restoreChecklist);
router.put("/:checklistId/entries", isAuthenticated, adminRequired, requiresWriteAccess, validateCreateOrUpdateEntries, AdminController.createOrUpdateEntries);


router.get("/:checklistId/entries", isAuthenticated, adminRequired, validateChecklistId, AdminController.getEntries);
router.post("/:checklistId/entries", isAuthenticated, adminRequired, requiresWriteAccess, validateCreateEntries, AdminController.createEntries);

export default router;
