import { CheckListReviewRepository } from "./repository.js";
import ResponseManager from "../../../utils/responseManager.js";

export class CheckListReviewController {
 
  static async getPendingSubmissions(req, res, next) {
    try {
      const approverId = req.user.userId;
      const companyId = req.user.company?.companyId;
      const { department, templateId, page, limit } = req.query;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListReviewRepository.getPendingSubmissions(approverId, companyId, {
        department,
        templateId,
        page,
        limit,
      });

      return ResponseManager.success(res, result, 200, "Pending submissions fetched successfully");
    } catch (e) {
      next(e);
    }
  }
 
  static async getSubmissionForReview(req, res, next) {
    try {
      const { submissionId } = req.params;
      const approverId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListReviewRepository.getSubmissionForReview(
        submissionId,
        approverId,
        companyId
      );

      return ResponseManager.success(res, result, 200, "Submission fetched successfully");
    } catch (e) {
      next(e);
    }
  }

 
  static async pickupSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const approverId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListReviewRepository.pickupSubmission(
        submissionId,
        approverId,
        companyId
      );

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

 
  static async approveSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const { reviewNotes } = req.body;
      const approverId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListReviewRepository.approveSubmission(
        submissionId,
        approverId,
        companyId,
        reviewNotes
      );

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }
 
  static async rejectSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const { reviewNotes } = req.body;
      const approverId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListReviewRepository.rejectSubmission(
        submissionId,
        approverId,
        companyId,
        reviewNotes
      );

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

 
  static async getReviewHistory(req, res, next) {
    try {
      const approverId = req.user.userId;
      const companyId = req.user.company?.companyId;
      const { status, templateId, page, limit } = req.query;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListReviewRepository.getReviewHistory(approverId, companyId, {
        status,
        templateId,
        page,
        limit,
      });

      return ResponseManager.success(res, result, 200, "Review history fetched successfully");
    } catch (e) {
      next(e);
    }
  }

 
  static async getReviewStats(req, res, next) {
    try {
      const approverId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListReviewRepository.getReviewStats(approverId, companyId);

      return ResponseManager.success(res, result, 200, "Review statistics fetched successfully");
    } catch (e) {
      next(e);
    }
  }
}
