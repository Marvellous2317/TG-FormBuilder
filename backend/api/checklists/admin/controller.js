import { AdminRepository } from "./repository.js";
import ResponseManager from "../../../utils/responseManager.js";

export class AdminController {


  static async createChecklist(req, res, next) {
    try {
      const { title, documentNumber } = req.body;
      const companyId = req.user.company?.companyId || null;
      const createdBy = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company to create a checklist", 400);
      }

      const result = await AdminRepository.createChecklist({
        title, documentNumber, companyId, createdBy,
      });
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) { next(e); }
  }

  static async getChecklists(req, res, next) {
    try {
      const companyId = req.user.company?.companyId || null;
      const { page, limit, search } = req.query;
      const result = await AdminRepository.getChecklists({ companyId, page, limit, search });
      return ResponseManager.success(res, result, 200, "Checklists fetched successfully");
    } catch (e) { next(e); }
  }

  static async getChecklistById(req, res, next) {
    try {
      const { checklistId } = req.params;
      const result = await AdminRepository.getChecklistById(checklistId);
      return ResponseManager.success(res, result, 200, "Checklist fetched successfully");
    } catch (e) { next(e); }
  }

  static async updateChecklist(req, res, next) {
    try {
      const { checklistId } = req.params;
      const { title, documentNumber } = req.body;
      const updatedBy = req.user.userId;
      const result = await AdminRepository.updateChecklist(checklistId, { title, documentNumber, updatedBy });
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async deleteChecklist(req, res, next) {
    try {
      const { checklistId } = req.params;
      const result = await AdminRepository.deleteChecklist(checklistId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  // ==================== ENTRIES ====================

  static async getEntries(req, res, next) {
    try {
      const { checklistId } = req.params;
      const result = await AdminRepository.getEntries(checklistId);
      return ResponseManager.success(res, result, 200, "Entries fetched successfully");
    } catch (e) { next(e); }
  }

  static async createEntries(req, res, next) {
    try {
      const { checklistId } = req.params;
      const { entries } = req.body;
      const result = await AdminRepository.createEntries(checklistId, entries);
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) { next(e); }
  }

  static async createOrUpdateEntries(req, res, next) {
    try {
      const { checklistId } = req.params;
      const { entries } = req.body;
      const userId = req.user.userId;
      const result = await AdminRepository.createOrUpdateEntries(checklistId, entries, userId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async deleteEntry(req, res, next) {
    try {
      const { entryId } = req.params;
      const result = await AdminRepository.deleteEntry(entryId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }


  static async createAssignment(req, res, next) {
    try {
      const { checklistId, assignedTo} = req.body;
      const assignedBy = req.user.userId;
      const result = await AdminRepository.createAssignment({
        checklistId, assignedTo, assignedBy,
      });
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) { next(e); }
  }

  static async getAssignments(req, res, next) {
    try {
      const companyId = req.user.company?.companyId || null;
      const { status, checklistId, assignedTo, page, limit } = req.query;
      const result = await AdminRepository.getAssignments({
        companyId, status, checklistId, assignedTo, page, limit,
      });
      return ResponseManager.success(res, result, 200, "Assignments fetched successfully");
    } catch (e) { next(e); }
  }

  static async getAssignmentById(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const result = await AdminRepository.getAssignmentById(assignmentId);
      return ResponseManager.success(res, result, 200, "Assignment fetched successfully");
    } catch (e) { next(e); }
  }

  static async unassignOperator(req, res, next) {
    try {
      const { checklistId, assignedTo } = req.body;
      const result = await AdminRepository.unassignOperator({ checklistId, assignedTo });
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }


}
