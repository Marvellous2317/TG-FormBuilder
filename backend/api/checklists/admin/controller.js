import { AdminRepository } from "./repository.js";
import ResponseManager from "../../../utils/responseManager.js";
import { ROLE_SUPER_ADMIN } from "../../constants/roles.js";

export class AdminController {


  static async createChecklist(req, res, next) {
    try {
      const { title, documentNumber, issuedNumber, entityDisplayName, departmentId, frequency, frequencyInterval, approvalMode, approvalRequired, approvers, operators } = req.body;
      const companyId = req.user.company?.companyId || null;
      const createdBy = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company to create a checklist", 400);
      }

      const result = await AdminRepository.createChecklist({
        title, documentNumber, issuedNumber, entityDisplayName, companyId, departmentId, frequency, frequencyInterval, approvalMode, approvalRequired, approvers, operators, createdBy,
      });
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) { next(e); }
  }

  static async searchChecklistByDocumentNumber(req, res, next) {
    try {
      const { documentNumber } = req.query;
      const isSuperAdmin = req.user.role?.roleName === ROLE_SUPER_ADMIN;

      // Search every company the caller has access to, not just the active
      // workspace — a corporateAdmin can find a document without switching first.
      // The active company is unioned in as a fallback for users whose membership
      // rows predate the join table.
      const activeCompanyId = req.user.company?.companyId || req.user.companyId || null;
      const companyIds = [
        ...new Set(
          [...(req.user.companies || []).map((c) => c.companyId), activeCompanyId].filter(Boolean),
        ),
      ];

      if (companyIds.length === 0 && !isSuperAdmin) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company to search checklists", 400);
      }

      const result = await AdminRepository.searchChecklistByDocumentNumber({ documentNumber, companyIds, isSuperAdmin });
      return ResponseManager.success(res, result, 200, "Checklists fetched successfully");
    } catch (e) { next(e); }
  }

  static async duplicateChecklist(req, res, next) {
    try {
      const {
        sourceChecklistId, title, documentNumber, issuedNumber, entityDisplayName,
        departmentId, frequency, frequencyInterval, approvalMode, approvalRequired,
        approvers, operators, entries,
      } = req.body;
      const companyId = req.user.company?.companyId || null;
      const createdBy = req.user.userId;
      const isSuperAdmin = req.user.role?.roleName === ROLE_SUPER_ADMIN;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company to duplicate a checklist", 400);
      }

      const result = await AdminRepository.duplicateChecklist({
        sourceChecklistId, title, documentNumber, issuedNumber, entityDisplayName,
        companyId, departmentId, frequency, frequencyInterval, approvalMode, approvalRequired,
        approvers, operators, entries, createdBy, isSuperAdmin,
      });
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) { next(e); }
  }

  static async getChecklists(req, res, next) {
    try {
      const companyId = req.user.company?.companyId || null;
      const { page, limit, search, departmentId, deleted } = req.query;
      const result = await AdminRepository.getChecklists({ companyId, departmentId, page, limit, search, deleted });
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

  static async getSubmittedChecklistsByChecklistId(req, res, next) {
    try {
      const { checklistId } = req.params;
      const companyId = req.user.company?.companyId || req.user.companyId || null;
      const { status, page, limit, search } = req.query;
      const result = await AdminRepository.getSubmittedChecklistsByChecklistId(checklistId, companyId, { status, page, limit, search });
      return ResponseManager.success(res, result, 200, "Submissions fetched successfully");
    } catch (e) { next(e); }
  }

  static async getSubmittedChecklistById(req, res, next) {
    try {
      const { checklistId, submittedChecklistId } = req.params;
      const companyId = req.user.company?.companyId || req.user.companyId || null;
      const result = await AdminRepository.getSubmittedChecklistById(checklistId, submittedChecklistId, companyId);
      return ResponseManager.success(res, result, 200, "Submission fetched successfully");
    } catch (e) { next(e); }
  }

  static async updateSubmittedChecklistEntry(req, res, next) {
    try {
      const { checklistId, submittedChecklistId } = req.params;
      const companyId = req.user.company?.companyId || req.user.companyId || null;
      const { data } = req.body;
      const result = await AdminRepository.updateSubmittedChecklistEntry(checklistId, submittedChecklistId, companyId, { data });
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async updateChecklist(req, res, next) {
    try {
      const { checklistId } = req.params;
      const { title, documentNumber, issuedNumber, entityDisplayName, departmentId, frequency, frequencyInterval, approvalMode, approvalRequired, approvers, operators } = req.body;
      const updatedBy = req.user.userId;
      const result = await AdminRepository.updateChecklist(checklistId, { title, documentNumber, issuedNumber, entityDisplayName, departmentId, frequency, frequencyInterval, approvalMode, approvalRequired, approvers, operators, updatedBy });
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

  static async restoreChecklist(req, res, next) {
    try {
      const { checklistId } = req.params;
      const result = await AdminRepository.restoreChecklist(checklistId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  // ==================== VERSIONS (read-only) ====================

  static async getChecklistVersions(req, res, next) {
    try {
      const companyId = req.user.company?.companyId || null;
      const { checklistId } = req.params;
      const { version,  page, limit } = req.query;
      const result = await AdminRepository.getChecklistVersions({
        checklistId, version, page, limit,
      });
      return ResponseManager.success(res, result, 200, "Checklist versions fetched successfully");
    } catch (e) { next(e); }
  }

  static async getChecklistVersionById(req, res, next) {
    try {
      const { versionChecklistId, checklistId } = req.params;
      const result = await AdminRepository.getChecklistVersionById(versionChecklistId, checklistId);
      return ResponseManager.success(res, result, 200, "Checklist version fetched successfully");
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


  static async createCatalog(req, res, next) {
    try {
      const { name, list } = req.body;
      const companyId = req.user.company?.companyId || null;
      const createdBy = req.user.userId;

      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "User must belong to a company to create a catalog", 400);
      }

      const result = await AdminRepository.createCatalog({ name, list, companyId, createdBy });
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) { next(e); }
  }

  static async getCatalogs(req, res, next) {
    try {
      const companyId = req.user.company?.companyId || null;
      const { page, limit, search } = req.query;
      const result = await AdminRepository.getCatalogs({ companyId, page, limit, search });
      return ResponseManager.success(res, result, 200, "Catalogs fetched successfully");
    } catch (e) { next(e); }
  }

  static async getCatalogById(req, res, next) {
    try {
      const { catalogId } = req.params;
      const result = await AdminRepository.getCatalogById(catalogId);
      return ResponseManager.success(res, result, 200, "Catalog fetched successfully");
    } catch (e) { next(e); }
  }

  static async updateCatalog(req, res, next) {
    try {
      const { catalogId } = req.params;
      const { name, list } = req.body;
      const updatedBy = req.user.userId;
      const result = await AdminRepository.updateCatalog(catalogId, { name, list, updatedBy });
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

  static async deleteCatalog(req, res, next) {
    try {
      const { catalogId } = req.params;
      const result = await AdminRepository.deleteCatalog(catalogId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) { next(e); }
  }

}
