import express from "express";
import { isAuthenticated, requiresRole } from "../../middlewares/authorization.js";
import { ExportController } from "./controller.js";
import { validateExportSubmittedChecklistQuery } from "./middleware.js";

const router = express.Router();

router.get(
  "/submissions",
  isAuthenticated,
  validateExportSubmittedChecklistQuery,
  ExportController.exportSubmittedChecklists,
);

export default router;
