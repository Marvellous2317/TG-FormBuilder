import { ChecklistSubmissionRepository } from "./repository.js";
import ResponseManager from "../../../utils/responseManager.js";

export class ChecklistSubmissionController {

  static async getMyAssignments(req, res, next) {
    try {
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;
      const { status, page, limit } = req.query;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.getMyAssignments(userId, companyId, {
        status,
        page,
        limit,
      });

      return ResponseManager.success(res, result, 200, "Assignments fetched successfully");
    } catch (e) {
      next(e);
    }
  }


  static async getAssignmentForFilling(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.getAssignmentForFilling(
        assignmentId,
        userId,
        companyId
      );

      return ResponseManager.success(res, result, 200, "Assignment fetched successfully");
    } catch (e) {
      next(e);
    }
  }


  static async startSubmission(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;
      const { deviceInfo, locationData } = req.body;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.startSubmission(
        assignmentId,
        userId,
        companyId,
        deviceInfo,
        locationData
      );

      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async saveDraft(req, res, next) {
    try {
      const { submissionId } = req.params;
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;
      const { draftData } = req.body;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.saveDraft(
        submissionId,
        userId,
        companyId,
        draftData
      );

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async submitForm(req, res, next) {
    try {
      const { submissionId } = req.params;
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;
      const { responses } = req.body;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.submitForm(
        submissionId,
        userId,
        companyId,
        responses
      );

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async discardDraft(req, res, next) {
    try {
      const { submissionId } = req.params;
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.discardDraft(submissionId, userId, companyId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async getMySubmissions(req, res, next) {
    try {
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;
      const { assignmentId, status, page, limit } = req.query;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.getMySubmissions(userId, companyId, {
        assignmentId,
        status,
        page,
        limit,
      });

      return ResponseManager.success(res, result, 200, "Submissions fetched successfully");
    } catch (e) {
      next(e);
    }
  }


  static async getSubmissionById(req, res, next) {
    try {
      const { submissionId } = req.params;
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.getSubmissionById(
        submissionId,
        userId,
        companyId
      );

      return ResponseManager.success(res, result, 200, "Submission fetched successfully");
    } catch (e) {
      next(e);
    }
  }


  static async getAssignmentHistory(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.userId;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await ChecklistSubmissionRepository.getAssignmentHistory(
        assignmentId,
        userId,
        companyId
      );

      return ResponseManager.success(res, result, 200, "Submission history fetched successfully");
    } catch (e) {
      next(e);
    }
  }
}
