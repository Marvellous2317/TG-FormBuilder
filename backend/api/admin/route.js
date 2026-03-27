import express from "express";
import { isAuthenticated, adminRequired, superAdminRequired } from "../middlewares/authorization.js";
import { AdminController } from "./controller.js";
import { validateAddUserMiddleware, validateRoleMiddleware, validateUpdateUserMiddleware, validateUserIdsMiddleware, validateCreateCompanyMiddleware, validateUpdateCompanyMiddleware } from "./middleware.js";
import { sigInMiddleware } from "../auth/middleware.js";

const router = express.Router();

// Auth
router.post("/signin", sigInMiddleware, AdminController.signin_api);

// Role Management (superAdmin only for create/update/delete)
router.get("/roles", isAuthenticated, adminRequired, AdminController.getAllRolesApi);
router.get("/roles/:roleId", isAuthenticated, adminRequired, AdminController.getRoleByIdApi);
router.post("/roles", validateRoleMiddleware, isAuthenticated, superAdminRequired, AdminController.createRoleApi);
router.put("/roles/:roleId", validateRoleMiddleware, isAuthenticated, superAdminRequired, AdminController.updateRoleApi);
router.delete("/roles/:roleId", isAuthenticated, superAdminRequired, AdminController.deleteRoleApi);

// User Management
router.post("/add-user", validateAddUserMiddleware, isAuthenticated, adminRequired, AdminController.addUserAPi);
router.get("/users", isAuthenticated, adminRequired, AdminController.getUsersApi);
router.get("/user-statistics", isAuthenticated, adminRequired, AdminController.getUserStatisticsApi);
router.get("/users/:userId", isAuthenticated, adminRequired, AdminController.getUserApi);
router.put("/users/:userId", validateUpdateUserMiddleware, isAuthenticated, adminRequired, AdminController.updateUserApi);
router.delete("/users/:userId", isAuthenticated, adminRequired, AdminController.deleteUserApi);
router.put("/users/:userId/password-reset", isAuthenticated, adminRequired, AdminController.resetUserPassword);
router.put("/users/:userId/suspend", isAuthenticated, adminRequired, AdminController.suspendUserApi);
router.put("/users/:userId/activate", isAuthenticated, adminRequired, AdminController.activateUserApi);

// Company Management
router.get("/companies", isAuthenticated, adminRequired, AdminController.getCompaniesApi);
router.get("/companies/:companyId", isAuthenticated, adminRequired, AdminController.getCompanyByIdApi);
router.post("/companies", validateCreateCompanyMiddleware, isAuthenticated, adminRequired, AdminController.createCompanyApi);
router.put("/companies/:companyId", validateUpdateCompanyMiddleware, isAuthenticated, adminRequired, AdminController.updateCompanyApi);
router.delete("/companies/:companyId", isAuthenticated, superAdminRequired, AdminController.deleteCompanyApi);
router.put("/companies/:companyId/suspend", isAuthenticated, adminRequired, AdminController.suspendCompanyApi);
router.put("/companies/:companyId/activate", isAuthenticated, adminRequired, AdminController.activateCompanyApi);

export default router;
