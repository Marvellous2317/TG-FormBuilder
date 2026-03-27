
import { AdminRepository } from "./repository.js";
import ResponseManager from "../../utils/responseManager.js";

export class AdminController {

  static async getAllRolesApi(req, res, next) {
    try {
      const result = await AdminRepository.getAllRoles();
      return ResponseManager.success(res, result, 200, "Roles fetched successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getRoleByIdApi(req, res, next) {
    try {
      const result = await AdminRepository.getRoleById(req.params.id);
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
      const result = await AdminRepository.updateRole(req.params.id, req.body);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async deleteRoleApi(req, res, next) {
    try {
      const result = await AdminRepository.deleteRole(req.params.id);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }




  static async getUsersApi(req, res, next) {
    try {
      const result = await AdminRepository.getAllUsers(req.query);
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
      const result = await AdminRepository.addUser(req.body);
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
      const result = await AdminRepository.deleteUser(req.params.userId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async resetUserPassword(req, res, next) {
    try {
      const result = await AdminRepository.resetUserPassword(req.params.userId, req.body, req.user);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async suspendUserApi(req, res, next) {
    try {
      const result = await AdminRepository.suspendUser(req.params.userId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async activateUserApi(req, res, next) {
    try {
      const result = await AdminRepository.activateUser(req.params.userId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  // ==================== COMPANY MANAGEMENT ====================

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
      const result = await AdminRepository.getCompanyById(req.params.companyId	);
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
      const result = await AdminRepository.suspendCompany(req.params.companyId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }

  static async activateCompanyApi(req, res, next) {
    try {
      const result = await AdminRepository.activateCompany(req.params.companyId);
      return ResponseManager.success(res, result, 200, result.message);
    } catch (e) {
      next(e);
    }
  }
}
