import express from "express";
import { isAuthenticated, adminRequired, superAdminRequired, validateUUID } from "../middlewares/authorization.js";
import { AdminController } from "./controller.js";
import { validateAddUserMiddleware, validateRoleMiddleware, validateUpdateUserMiddleware, validateUserIdsMiddleware, validateCreateCompanyMiddleware, validateUpdateCompanyMiddleware, validateCreateDepartmentMiddleware, validateUpdateDepartmentMiddleware } from "./middleware.js";
import { sigInMiddleware } from "../auth/middleware.js";

const router = express.Router();


// Role Management (superAdmin only for create/update/delete)
router.get("/roles", isAuthenticated, adminRequired, AdminController.getAllRolesApi);
router.get("/roles/:roleId", validateUUID("roleId"), isAuthenticated, adminRequired, AdminController.getRoleByIdApi);
router.post("/roles", validateRoleMiddleware, isAuthenticated, adminRequired,  AdminController.createRoleApi);
router.put("/roles/:roleId", validateUUID("roleId"), validateRoleMiddleware, isAuthenticated, superAdminRequired, AdminController.updateRoleApi);
router.delete("/roles/:roleId", validateUUID("roleId"), isAuthenticated, superAdminRequired, AdminController.deleteRoleApi);

// User Management
router.post("/add-user", validateAddUserMiddleware, isAuthenticated, adminRequired, AdminController.addUserAPi);
router.get("/users", isAuthenticated, adminRequired, AdminController.getUsersApi);
router.get("/user-statistics", isAuthenticated, adminRequired, AdminController.getUserStatisticsApi);
router.get("/users/:userId", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.getUserApi);
router.put("/users/:userId", validateUUID("userId"), validateUpdateUserMiddleware, isAuthenticated, adminRequired, AdminController.updateUserApi);
router.delete("/users/:userId", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.deleteUserApi);
router.put("/users/:userId/password-reset", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.resetUserPassword);
router.put("/users/:userId/suspend", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.suspendUserApi);
router.put("/users/:userId/activate", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.activateUserApi);
router.put("/users/:userId/assign-approver", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.assignApproverApi);
router.put("/users/:userId/unassign-approver", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.unassignApproverApi);
router.get("/users/:userId/approvers", validateUUID("userId"), isAuthenticated, adminRequired, AdminController.getOperatorApproversApi);

// Company Management
router.get("/companies", isAuthenticated, adminRequired, AdminController.getCompaniesApi);
router.get("/companies/:companyId", validateUUID("companyId"), isAuthenticated, adminRequired, AdminController.getCompanyByIdApi);
router.post("/companies", validateCreateCompanyMiddleware, isAuthenticated, adminRequired, AdminController.createCompanyApi);
router.put("/companies/:companyId", validateUUID("companyId"), validateUpdateCompanyMiddleware, isAuthenticated, adminRequired, AdminController.updateCompanyApi);
router.delete("/companies/:companyId", validateUUID("companyId"), isAuthenticated, superAdminRequired, AdminController.deleteCompanyApi);
router.put("/companies/:companyId/suspend", validateUUID("companyId"), isAuthenticated, adminRequired, AdminController.suspendCompanyApi);
router.put("/companies/:companyId/activate", validateUUID("companyId"), isAuthenticated, adminRequired, AdminController.activateCompanyApi);

// Department Management
router.get("/departments", isAuthenticated, adminRequired, AdminController.getDepartmentsApi);
router.get("/departments/:departmentId", validateUUID("departmentId"), isAuthenticated, adminRequired, AdminController.getDepartmentByIdApi);
router.post("/departments", validateCreateDepartmentMiddleware, isAuthenticated, adminRequired, AdminController.createDepartmentApi);
router.put("/departments/:departmentId", validateUUID("departmentId"), validateUpdateDepartmentMiddleware, isAuthenticated, adminRequired, AdminController.updateDepartmentApi);
router.delete("/departments/:departmentId", validateUUID("departmentId"), isAuthenticated, superAdminRequired, AdminController.deleteDepartmentApi);

// Analytics (Super Admin only)
router.get("/analytics", isAuthenticated, superAdminRequired, AdminController.getGlobalAnalyticsApi);
router.get("/analytics/:companyId", validateUUID("companyId"), isAuthenticated, superAdminRequired, AdminController.getCompanyAnalyticsApi);

export default router;
