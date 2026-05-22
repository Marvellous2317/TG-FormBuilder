import { OperatorRepository } from "./repository.js";
import ResponseManager from "../../../utils/responseManager.js";

export class OperatorController {

  static async getOperatorCheckList(req, res, next) {
    try {

      const {userId, companyId} = req.user;
      const { status, page, limit } = req.query;
      const result = await OperatorRepository.getOperatorCheckList(userId, companyId, { status, page, limit });
      return ResponseManager.success(res, result, 200, "Assignments fetched successfully");
    } catch (e) { next(e); }
  }

  static async getOperatorCheckEntryList(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.userId;
      const result = await OperatorRepository.getOperatorCheckEntryList(assignmentId, userId);
      return ResponseManager.success(res, result, 200, "Assignment fetched successfully");
    } catch (e) { next(e); }
  }

  static async submitChecklistEntry(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.userId;
      const { data } = req.body;
      const result = await OperatorRepository.submitChecklistEntry(assignmentId, userId, { data });
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async saveDraft(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.userId;
      const { responses } = req.body;
      const result = await OperatorRepository.saveDraft(assignmentId, userId, { responses });
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async updateSubmission(req, res, next) {
    try {
      const { submittedChecklistId } = req.params;
      const userId = req.user.userId;
      const { data } = req.body;
      const result = await OperatorRepository.updateSubmission(submittedChecklistId, userId, { data });
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async deleteSubmission(req, res, next) {
    try {
      const { submittedChecklistId } = req.params;
      const userId = req.user.userId;
      const result = await OperatorRepository.deleteSubmission(submittedChecklistId, userId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async getSubmissionById(req, res, next) {
    try {
      const { submittedChecklistId } = req.params;
      const userId = req.user.userId;
      const result = await OperatorRepository.getSubmissionById(submittedChecklistId, userId);
      return ResponseManager.success(res, result, 200, "Submission fetched successfully");
    } catch (e) { next(e); }
  }

  static async getMySubmissions(req, res, next) {
    try {
      const userId = req.user.userId;
      const { status, page, limit, search } = req.query;
      const result = await OperatorRepository.getMySubmissions(userId, { status, page, limit, search });
      return ResponseManager.success(res, result, 200, "Submissions fetched successfully");
    } catch (e) { next(e); }
  }
}
