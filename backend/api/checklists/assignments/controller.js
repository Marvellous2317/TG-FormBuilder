import { CheckListAssignmentRepository } from "./repository.js";
import ResponseManager from "../../../utils/responseManager.js";

export class CheckListAssignmentController {

  static async createAssignment(req, res, next) {
    try {
      const {
        templateId,
        assignedTo,
        approverId,
        allowMultipleSubmissions,
        maxSubmissions,
        notes,
        validFrom,
        validUntil,
      } = req.body;
      const companyId = req.user.company?.companyId;
      const assignedBy = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.createAssignment({
        templateId,
        assignedTo,
        approverId,
        companyId,
        assignedBy,
        allowMultipleSubmissions,
        maxSubmissions,
        notes,
        validFrom,
        validUntil,
      });

      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async bulkAssign(req, res, next) {
    try {
      const {
        templateId,
        userIds,
        approverId,
        allowMultipleSubmissions,
        maxSubmissions,
        notes,
        validFrom,
        validUntil,
      } = req.body;
      const companyId = req.user.company?.companyId;
      const assignedBy = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.bulkAssign({
        templateId,
        userIds,
        approverId,
        companyId,
        assignedBy,
        allowMultipleSubmissions,
        maxSubmissions,
        notes,
        validFrom,
        validUntil,
      });

      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async getAssignments(req, res, next) {
    try {
      const companyId = req.user.company?.companyId;
      const { templateId, assignedTo, approverId, status, department, page, limit } = req.query;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.getAssignments({
        companyId,
        templateId,
        assignedTo,
        approverId,
        status,
        department,
        page,
        limit,
      });

      return ResponseManager.success(res, result, 200, "Assignments fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getAssignmentById(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.getAssignmentById(assignmentId, companyId);

      return ResponseManager.success(res, result, 200, "Assignment fetched successfully");
    } catch (e) {
      next(e);
    }
  }


  static async updateAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const { approverId, notes, validFrom, validUntil, maxSubmissions } = req.body;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.updateAssignment(assignmentId, {
        approverId,
        notes,
        validFrom,
        validUntil,
        maxSubmissions,
        companyId,
        userId,
      });

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async pauseAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.pauseAssignment(assignmentId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async resumeAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.resumeAssignment(assignmentId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async revokeAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.revokeAssignment(assignmentId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async deleteAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const companyId = req.user.company?.companyId;
      const userId = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.deleteAssignment(assignmentId, companyId, userId);

      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async getAvailableUsers(req, res, next) {
    try {
      const { templateId } = req.params;
      const { department } = req.query;
      const companyId = req.user.company?.companyId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company", 400);
      }

      const result = await CheckListAssignmentRepository.getAvailableUsers(templateId, companyId, department);

      return ResponseManager.success(res, result, 200, "Available users fetched successfully");
    } catch (e) {
      next(e);
    }
  }
}
