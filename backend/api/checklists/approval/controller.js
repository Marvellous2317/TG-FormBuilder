import { ApprovalRepository } from "./repository.js";
import ResponseManager from "../../../utils/responseManager.js";

export class ApprovalController {

  static async getPendingSubmissions(req, res, next) {
    try {
      const approverId = req.user.userId;
      const { page, limit } = req.query;
      const result = await ApprovalRepository.getPendingSubmissions(approverId, { page, limit });
      return ResponseManager.success(res, result, 200, "Pending submissions fetched successfully");
    } catch (e) { next(e); }
  }

  static async getSubmissionById(req, res, next) {
    try {
      const { submittedChecklistId } = req.params;
      const approverId = req.user.userId;
      const result = await ApprovalRepository.getSubmissionById(submittedChecklistId, approverId);
      return ResponseManager.success(res, result, 200, "Submission fetched successfully");
    } catch (e) { next(e); }
  }

  static async approveSubmission(req, res, next) {
    try {
      const { submittedChecklistId } = req.params;
      const approverId = req.user.userId;
      const result = await ApprovalRepository.approveSubmission(submittedChecklistId, approverId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async rejectSubmission(req, res, next) {
    try {
      const { submittedChecklistId } = req.params;
      const approverId = req.user.userId;
      const result = await ApprovalRepository.rejectSubmission(submittedChecklistId, approverId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async getHistory(req, res, next) {
    try {
      const approverId = req.user.userId;
      const { status, search, startDate, endDate, page, limit } = req.query;
      const result = await ApprovalRepository.getHistory(approverId, { status, search, startDate, endDate, page, limit });
      return ResponseManager.success(res, result, 200, "Review history fetched successfully");
    } catch (e) { next(e); }
  }
}
