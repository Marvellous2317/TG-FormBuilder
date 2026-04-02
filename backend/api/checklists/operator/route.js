import express from "express";
import { isAuthenticated, requiresRole } from "../../middlewares/authorization.js";
import { OperatorController } from "./controller.js";
import { validateAssignmentId, validateSubmitChecklist, validateSaveDraft, validateSubmittedChecklistId, validateUpdateSubmission, validateSubmissionQuery } from "./middleware.js";

const router = express.Router();





router.get("/", isAuthenticated, requiresRole("operator"), validateSubmissionQuery, OperatorController.getOperatorCheckList);

router.get("/submissions", isAuthenticated, requiresRole("operator"), validateSubmissionQuery, OperatorController.getMySubmissions);

router.get("/submissions/:submittedChecklistId", isAuthenticated, requiresRole("operator"), validateSubmittedChecklistId, OperatorController.getSubmissionById);

router.put("/submissions/:submittedChecklistId", isAuthenticated, requiresRole("operator"), validateUpdateSubmission, OperatorController.updateSubmission);

router.delete("/submissions/:submittedChecklistId", isAuthenticated, requiresRole("operator"), validateSubmittedChecklistId, OperatorController.deleteSubmission);

router.get("/:assignmentId", isAuthenticated, requiresRole("operator"), validateAssignmentId, OperatorController.getOperatorCheckEntryList);


router.post("/:assignmentId/submit", isAuthenticated, requiresRole("operator"), validateSubmitChecklist, OperatorController.submitChecklistEntry);


router.post("/:assignmentId/draft", isAuthenticated, requiresRole("operator"), validateSaveDraft, OperatorController.saveDraft);




export default router;
