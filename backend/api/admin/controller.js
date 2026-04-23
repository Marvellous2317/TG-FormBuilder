
import { AdminRepository } from "./repository.js";
import ResponseManager from "../../utils/responseManager.js";

export class AdminController {

  static async getAllRolesApi(req, res, next) {

    const user = req.user;
    if (!user) {
      return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
    }
    try {
      const result = await AdminRepository.getAllRoles(user);
      return ResponseManager.success(res, result, 200, "Roles fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getRoleByIdApi(req, res, next) {

    const roleId = req.params.roleId
    if (!roleId) {
      return ResponseManager.error(res, "ValidationError", "Role ID is required", 400);
    }
    try {
      const result = await AdminRepository.getRoleById(roleId);
      return ResponseManager.success(res, result, 200, "Role fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async createRoleApi(req, res, next) {
    try {
      const result = await AdminRepository.createRole(req.body);
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async updateRoleApi(req, res, next) {
    try {
      const roleId = req.params.roleId
      if (!roleId) {
        return ResponseManager.error(res, "ValidationError", "Role ID is required", 400);
      }
      const result = await AdminRepository.updateRole(roleId, req.body);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async deleteRoleApi(req, res, next) {
    try {
      const roleId = req.params.roleId;
      if (!roleId) {
        return ResponseManager.error(res, "ValidationError", "Role ID is required", 400);
      }
      const result = await AdminRepository.deleteRole(roleId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }




  static async getUsersApi(req, res, next) {
    try {
      const result = await AdminRepository.getAllUsers(req.query, req.user);
      return ResponseManager.success(res, result, 200, "Users fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getUserStatisticsApi(req, res, next) {
    try {
      const result = await AdminRepository.getUserStatistics();
      return ResponseManager.success(res, result, 200, "User statistics fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async addUserAPi(req, res, next) {
    try {
      const result = await AdminRepository.addUser( req.user, req.body,);
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }



  static async getUserApi(req, res, next) {
    try {
      const result = await AdminRepository.getUser(req.params.userId);
      return ResponseManager.success(res, result, 200, "User fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async updateUserApi(req, res, next) {
    const admin = req.user;
    const userId = req.params.userId;
    const data = req.body;
    try {
      const result = await AdminRepository.updateUser({ userId, data, admin });
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async deleteUserApi(req, res, next) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return ResponseManager.error(res, "ValidationError", "User ID is required", 400);
      }
      const result = await AdminRepository.deleteUser(userId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async resetUserPassword(req, res, next) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return ResponseManager.error(res, "ValidationError", "User ID is required", 400);
      }
      const result = await AdminRepository.resetUserPassword(userId, req.body, req.user);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async suspendUserApi(req, res, next) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return ResponseManager.error(res, "ValidationError", "User ID is required", 400);
      }
      const result = await AdminRepository.suspendUser(userId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async activateUserApi(req, res, next) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return ResponseManager.error(res, "ValidationError", "User ID is required", 400);
      }
      const result = await AdminRepository.activateUser(userId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async assignApproverApi(req, res, next) {
    try {
      const { userId } = req.params;
      const { approverId } = req.body;
      const result = await AdminRepository.assignApprover(userId, approverId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async unassignApproverApi(req, res, next) {
    try {
      const { userId } = req.params;
      const { approverId } = req.body;
      const result = await AdminRepository.unassignApprover(userId, approverId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async getOperatorApproversApi(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await AdminRepository.getOperatorApprovers(userId);
      return ResponseManager.success(res, result, 200, "Approvers fetched successfully");
    } catch (e) {
      next(e);
    }
  }


  static async getCompaniesApi(req, res, next) {
    try {
      const result = await AdminRepository.getAllCompanies(req.query);
      return ResponseManager.success(res, result, 200, "Companies fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getCompanyByIdApi(req, res, next) {
    try {
      const companyId = req.params.companyId;
      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "Company ID is required", 400);
      }
      const result = await AdminRepository.getCompanyById(companyId);
      return ResponseManager.success(res, result, 200, "Company fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async createCompanyApi(req, res, next) {
    try {
      const result = await AdminRepository.createCompany(req.body);
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async updateCompanyApi(req, res, next) {
    try {
      const result = await AdminRepository.updateCompany(req.params.companyId, req.body);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async deleteCompanyApi(req, res, next) {
    try {
      const result = await AdminRepository.deleteCompany(req.params.companyId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async suspendCompanyApi(req, res, next) {
    try {
      const companyId = req.params.companyId;
      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "Company ID is required", 400);
      }
      const { reason } = req.body;
      const result = await AdminRepository.suspendCompany(companyId, reason);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async activateCompanyApi(req, res, next) {
    try {
      const companyId = req.params.companyId;
      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "Company ID is required", 400);
      }
      const result = await AdminRepository.activateCompany(companyId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  // ==================== DEPARTMENT MANAGEMENT ======================================

  static async getDepartmentsApi(req, res, next) {
    try {
      const result = await AdminRepository.getAllDepartments(req.query);
      return ResponseManager.success(res, result, 200, "Departments fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getDepartmentByIdApi(req, res, next) {
    try {
      const departmentId = req.params.departmentId;
      if (!departmentId) {
        return ResponseManager.error(res, "ValidationError", "Department ID is required", 400);
      }
      const result = await AdminRepository.getDepartmentById(departmentId);
      return ResponseManager.success(res, result, 200, "Department fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async createDepartmentApi(req, res, next) {
    try {
      const result = await AdminRepository.createDepartment(req.body);
      return ResponseManager.success(res, result, 201, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async updateDepartmentApi(req, res, next) {
    try {
      const result = await AdminRepository.updateDepartment(req.params.departmentId, req.body);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async deleteDepartmentApi(req, res, next) {
    try {
      const result = await AdminRepository.deleteDepartment(req.params.departmentId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async suspendDepartmentApi(req, res, next) {
    try {
      const departmentId = req.params.departmentId;
      if (!departmentId) {
        return ResponseManager.error(res, "ValidationError", "Department ID is required", 400);
      }
      const result = await AdminRepository.suspendDepartment(departmentId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async activateDepartmentApi(req, res, next) {
    try {
      const departmentId = req.params.departmentId;
      if (!departmentId) {
        return ResponseManager.error(res, "ValidationError", "Department ID is required", 400);
      }
      const result = await AdminRepository.activateDepartment(departmentId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }


  static async getGlobalAnalyticsApi(req, res, next) {
    try {
      const result = await AdminRepository.getGlobalAnalytics();
      return ResponseManager.success(res, result, 200, "Global analytics fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getCompanyAnalyticsApi(req, res, next) {
    try {
      const companyId = req.params.companyId;
      if (!companyId) {
        return ResponseManager.error(res, "ValidationError", "Company ID is required", 400);
      }
      const result = await AdminRepository.getCompanyAnalytics(companyId);
      return ResponseManager.success(res, result, 200, "Company analytics fetched successfully");
    } catch (e) {
      next(e);
    }
  }
}
