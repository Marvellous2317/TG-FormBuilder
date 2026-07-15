import express from "express";
import { isAuthenticated, adminRequired, superAdminRequired, requiresWriteAccess, validateUUID } from "../middlewares/authorization.js";
import { AdminController } from "./controller.js";
import { validateAddUserMiddleware, validateRoleMiddleware, validateUpdateUserMiddleware, validateUserIdsMiddleware, validateCreateCompanyMiddleware, validateUpdateCompanyMiddleware, validateSuspendCompanyMiddleware, validateCreateDepartmentMiddleware, validateUpdateDepartmentMiddleware, validateCompaniesQuery, validateUsersQuery, validateDepartmentsQuery, validateRolesQuery } from "./middleware.js";
import { sigInMiddleware } from "../auth/middleware.js";

const router = express.Router();


// Role Management (superAdmin only for create/update/delete)
router.get("/roles", validateRolesQuery, isAuthenticated, adminRequired, AdminController.getAllRolesApi);
router.get("/roles/:roleId", validateUUID("roleId"), isAuthenticated, adminRequired, AdminController.getRoleByIdApi);
router.post("/roles", validateRoleMiddleware, isAuthenticated, adminRequired, requiresWriteAccess, AdminController.createRoleApi);
router.put("/roles/:roleId", validateUUID("roleId"), validateRoleMiddleware, isAuthenticated, superAdminRequired, requiresWriteAccess, AdminController.updateRoleApi);
router.delete("/roles/:roleId", validateUUID("roleId"), isAuthenticated, superAdminRequired, requiresWriteAccess, AdminController.deleteRoleApi);
router.put("/roles/:roleId/restore", validateUUID("roleId"), isAuthenticated, superAdminRequired, requiresWriteAccess, AdminController.restoreRoleApi);

// User Management
router.post("/add-user", validateAddUserMiddleware, isAuthenticated, adminRequired, requiresWriteAccess, AdminController.addUserAPi);
router.get("/users", validateUsersQuery, isAuthenticated, adminRequired, AdminController.getUsersApi);
router.get("/user-statistics", isAuthenticated, adminRequired, AdminController.getUserStatisticsApi);
router.get("/users/:userId", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.getUserApi);
router.put("/users/:userId", validateUUID("userId"), validateUpdateUserMiddleware, isAuthenticated, adminRequired, requiresWriteAccess, AdminController.updateUserApi);
router.delete("/users/:userId", validateUUID("userId"), isAuthenticated, adminRequired, requiresWriteAccess, AdminController.deleteUserApi);
router.put("/users/:userId/restore", validateUUID("userId"), isAuthenticated, adminRequired, requiresWriteAccess, AdminController.restoreUserApi);
router.put("/users/:userId/password-reset", validateUUID("userId"), isAuthenticated, adminRequired, requiresWriteAccess, AdminController.resetUserPassword);
router.put("/users/:userId/suspend", validateUUID("userId"), isAuthenticated, adminRequired, requiresWriteAccess, AdminController.suspendUserApi);
router.put("/users/:userId/activate", validateUUID("userId"), isAuthenticated, adminRequired, requiresWriteAccess, AdminController.activateUserApi);
// LEGACY: global operator-approver mapping. Replaced by the per-checklist approver flow.
// router.put("/users/:userId/assign-approver", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.assignApproverApi);
// router.put("/users/:userId/unassign-approver", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.unassignApproverApi);
// router.get("/users/:userId/approvers", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.getOperatorApproversApi);

// Company Management
router.get("/companies", validateCompaniesQuery, isAuthenticated, adminRequired, AdminController.getCompaniesApi);
router.get("/companies/:companyId", validateUUID("companyId"), isAuthenticated, adminRequired, AdminController.getCompanyByIdApi);
router.post("/companies", validateCreateCompanyMiddleware, isAuthenticated, adminRequired, requiresWriteAccess, AdminController.createCompanyApi);
router.put("/companies/:companyId", validateUUID("companyId"), validateUpdateCompanyMiddleware, isAuthenticated, adminRequired, requiresWriteAccess, AdminController.updateCompanyApi);
router.delete("/companies/:companyId", validateUUID("companyId"), isAuthenticated, superAdminRequired, requiresWriteAccess, AdminController.deleteCompanyApi);
router.put("/companies/:companyId/restore", validateUUID("companyId"), isAuthenticated, superAdminRequired, requiresWriteAccess, AdminController.restoreCompanyApi);
router.put("/companies/:companyId/suspend", validateUUID("companyId"), validateSuspendCompanyMiddleware, isAuthenticated, adminRequired, requiresWriteAccess, AdminController.suspendCompanyApi);
router.put("/companies/:companyId/activate", validateUUID("companyId"), isAuthenticated, adminRequired, requiresWriteAccess, AdminController.activateCompanyApi);

// Department Management
router.get("/departments", validateDepartmentsQuery, isAuthenticated, adminRequired, AdminController.getDepartmentsApi);
router.get("/departments/:departmentId", validateUUID("departmentId"), isAuthenticated, adminRequired, AdminController.getDepartmentByIdApi);
router.post("/departments", validateCreateDepartmentMiddleware, isAuthenticated, adminRequired, requiresWriteAccess, AdminController.createDepartmentApi);
router.put("/departments/:departmentId", validateUUID("departmentId"), validateUpdateDepartmentMiddleware, isAuthenticated, adminRequired, requiresWriteAccess, AdminController.updateDepartmentApi);
router.delete("/departments/:departmentId", validateUUID("departmentId"), isAuthenticated, superAdminRequired, requiresWriteAccess, AdminController.deleteDepartmentApi);

// Analytics (Super Admin only)
router.get("/analytics", isAuthenticated, superAdminRequired, AdminController.getGlobalAnalyticsApi);
router.get("/analytics/:companyId", validateUUID("companyId"), isAuthenticated, superAdminRequired, AdminController.getCompanyAnalyticsApi);

export default router;
