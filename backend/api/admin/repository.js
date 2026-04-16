import { Op, Sequelize } from "sequelize";
import crypto from "crypto";

import { User, Role, Company, OperatorApprover } from "../../models/index.js";
import { ApplicationError, ValidationError } from "../../utils/errorHandler.js";

import { generateJWT } from "../auth/helper.js";
import { sendApprovalEmail, sendPasswordMail } from "../../views/index.js";
import { sequelize } from "../../config/database.js";
import { generateRandomPassword } from "./helper.js";




export class AdminRepository {

  static async signin(request) {
    try {
      const data = request.body;
      const email = data?.email;
      const password = data?.password;

      if (!email || !password) {
        throw new ApplicationError("Missing email or password", 400);
      }

      const userRaw = await User.findOne({
        where: { email: email.toLowerCase() },
        include: [
          { model: Role, as: "role", attributes: ["roleId", "roleName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
        ],
      });

      if (!userRaw) {
        throw new ApplicationError("User does not exist", 404);
      }

      const password_check = await userRaw.checkPassword(password);
      if (!password_check) {
        throw new ApplicationError("Invalid Credentials", 400);
      }

      const user = userRaw.toSafeJSON();
      const allowedRoles = ["admin", "superAdmin"];

      if (!user.role || !allowedRoles.includes(user.role.roleName)) {
        throw new ApplicationError("Unauthorized access", 401);
      }

      const token = generateJWT(user.userId);
      const requiresPasswordChange = userRaw.newLogin === true;

      return { token, user, message: "Signin successful", requiresPasswordChange };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(error.message || "Signin failed", error.statusCode || 500);
    }
  }


  static async getAllRoles(user) {
    const role = user.roleId ? await Role.findByPk(user.roleId) : null;
    if (role?.roleName === "superAdmin") {
      try {
        const roles = await Role.findAll({
          order: [["roleName", "ASC"]],
        });
        return { roles };
      } catch (error) {
        throw new ApplicationError("Failed to fetch roles", 500);
      }
    }

    try {
      const roles = await Role.findAll({
        where: { isActive: true, roleName: { [Op.notIn]: ["superAdmin"] } },
        order: [["roleName", "ASC"]],
      });
      return { roles };
    } catch (error) {
      throw new ApplicationError("Failed to fetch roles", 500);
    }
  }

  static async getRoleById(roleId) {
    try {
      const role = await Role.findByPk(roleId);
      if (!role) throw new ApplicationError("Role not found", 404);
      return { role };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch role", 500);
    }
  }

  static async createRole({ roleName, description }) {
    try {
        const existing = await Role.findOne({
            where: {
                roleName: roleName.toLowerCase()
            },
            paranoid: false 
        });
        
        if (existing) {
            if (existing.deletedAt) {
                throw new ApplicationError("Role already exists but has been deleted", 400);
            }
            throw new ApplicationError("Role already exists", 400);
        }

        const role = await Role.create({
            roleName: roleName.toLowerCase(),
            description,
        });

        return { message: "Role created successfully", role };
    } catch (error) {
        if (error instanceof ApplicationError) throw error;
        console.log("Error in createRole:", error);
        throw new ApplicationError("Failed to create role", 500);
    }
  }

  static async updateRole(roleId, data) {
    try {
      const role = await Role.findByPk(roleId);
      if (!role) throw new ApplicationError("Role not found", 404);

      if (role.roleName === "superAdmin" && data.roleName && data.roleName !== "superAdmin") {
        throw new ApplicationError("Cannot rename superAdmin role", 400);
      }

      if (data.roleName) role.roleName = data.roleName.toLowerCase();
      if (data.description !== undefined) role.description = data.description;
      if (data.isActive !== undefined) role.isActive = data.isActive;

      await role.save();
      return { message: "Role updated successfully", role };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update role", 500);
    }
  }

  static async deleteRole(roleId) {
    try {
      const role = await Role.findByPk(roleId);
      if (!role) throw new ApplicationError("Role not found", 404);

      const protectedRoles = ["operator", "approval", "admin", "superAdmin"];
      if (protectedRoles.includes(role.roleName)) {
        throw new ApplicationError("Cannot delete protected system role", 400);
      }


      const usersWithRole = await User.count({ where: { roleId } });
      if (usersWithRole > 0) {
        throw new ApplicationError(`Cannot delete role. ${usersWithRole} user(s) are assigned to this role.`, 400);
      }

      await role.destroy();
      return { message: "Role deleted successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete role", 500);
    }
  }



  static async getUser(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "updatedAt"] },
      include: [
        { model: Role, as: "role", attributes: ["roleId", "roleName"] },
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
      ],
    });

    if (!user) throw new ApplicationError("User not found", 404);
    return { user };
  }

  static async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApplicationError("User not found", 404);

    await user.destroy();
    return { message: "User deleted successfully" };
  }

  static async addUser( admin,{ email, firstName, lastName, roleId, companyId, department }) {
    try {
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) throw new ApplicationError("User with this email already exists", 400);

      if (!roleId) throw new ValidationError("Role ID is required");
      const role = await Role.findByPk(roleId);
      if (!role) throw new ValidationError("Invalid role ID");

      if (companyId) {
        const company = await Company.findByPk(companyId);
        if (!company) throw new ValidationError("Invalid company ID");

      }

      const checkAdminRole = await Role.findByPk(admin.roleId);
      if (role.roleName === "superAdmin" && checkAdminRole.roleName !== "superAdmin") {
        throw new ApplicationError("Only SuperAdmin is Allowed to add SuperAdmin", 403);
      }

      const password = generateRandomPassword();

      const user = User.build({
        email: email.toLowerCase(),
        firstName,
        lastName,
        status: "active",
        roleId,
        companyId: companyId || null,
        department: department || null,
        newLogin: true, 
      });

      await user.setPassword(password);
      await user.save();

      sendPasswordMail({ email: user.email, password, firstName: user.firstName });

      return { message: "User added successfully" };
    } catch (error) {
      if (error instanceof ApplicationError || error instanceof ValidationError) throw error;
      console.log("Error in addUser:", error);
      throw new ApplicationError("Failed to add user", 500);
    }
  }

  static async getAllUsers({ status, roleId, companyId, department, page = 1, limit = 20, search }) {
    try {
      page = Number(page) || 1;
      limit = Number(limit) || 20;
      const offset = (page - 1) * limit;
      const where = {};

      if (status) {
        where.status = status;
      }

      if (roleId) {
        where.roleId = roleId;
      }

      if (companyId) {
        where.companyId = companyId;
      }

      if (department) {
        where.department = { [Op.iLike]: `%${department}%` };
      }

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { department: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows: users, count } = await User.findAndCountAll({
        where,
        attributes: { exclude: ["password"] },
        include: [
          { model: Role, as: "role", attributes: ["roleId", "roleName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          { model: OperatorApprover, as: "operatorApprovers",attributes: ["id"]  , include: [{ model: User, as: "approver", attributes: ["firstName", "lastName"] }] }
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        users,
        pagination: {
          total: count,
          page,
          pageSize: limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUserStatistics() {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { status: "active" } });
      const suspendedUsers = await User.count({ where: { status: "suspended" } });
      const totalRoles = await Role.count();


      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalRoles
      };
    } catch (error) {
      console.log("Error in getUserStatistics:", error);
      throw new ApplicationError("Failed to fetch user statistics", 500);
    }
  }

  static async updateUser({ userId, data, admin }) {
    try {
      const firstName = (data.firstName || "").trim();
      const lastName = (data.lastName || "").trim();
      const email = (data.email || "").trim().toLowerCase();
      const roleId = data.roleId || null;
      const companyId = data.companyId;
      const department = data.department;
      const status = data.status;

      const user = await User.findOne({ where: { userId } });
      if (!user) throw new ApplicationError("User not found", 404);

      if (user.userId === admin.userId) {
        throw new ApplicationError("You cannot modify your own profile, contact an Administrator", 400);
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;

      if (roleId) {
        const role = await Role.findByPk(roleId);
        if (!role) throw new ValidationError("Invalid role ID");
        user.roleId = roleId;
      }

      if (companyId !== undefined) {
        if (companyId) {
          const company = await Company.findByPk(companyId);
          if (!company) throw new ValidationError("Invalid company ID");
        }
        user.companyId = companyId || null;
      }

      if (department !== undefined) {
        user.department = department || null;
      }

      if (status && ["pending", "active", "suspended"].includes(status)) {
        user.status = status;
      }

      await user.save();
      return { message: "User updated successfully" };
    } catch (error) {
      if (error instanceof ApplicationError || error instanceof ValidationError) throw error;
      throw new ApplicationError("Failed to update user", 500);
    }
  }

  static async resetUserPassword(userId, body, admin) {
    const user = await User.findOne({ where: { userId: userId } });
    if (!user) throw new ApplicationError("User not found", 404);

    if (user.userId === admin.userId)
      throw new ApplicationError("You cannot reset your own password this way", 400);

  
    const password = generateRandomPassword();

    await user.setPassword(password);
    user.newLogin = true; 
    await user.save();

    sendPasswordMail({ email: user.email, password, firstName: user.firstName });

    return { message: "Password reset successfully. User will be required to change password on next login." };
  }



  static async suspendUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new ApplicationError("User not found", 404);

      if (user.status === "suspended") {
        throw new ApplicationError("User is already suspended", 400);
      }

      user.status = "suspended";
      await user.save();

      return { message: "User suspended successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to suspend user", 500);
    }
  }

  static async activateUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new ApplicationError("User not found", 404);

      if (user.status === "active") {
        throw new ApplicationError("User is already active", 400);
      }

      user.status = "active";
      await user.save();

      return { message: "User activated successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to activate user", 500);
    }
  }

  static async assignApprover(operatorId, approverId) {
    try {
      const operator = await User.findByPk(operatorId, {
        include: [{ model: Role, as: "role" }],
      });
      if (!operator) throw new ApplicationError("Operator not found", 404);
      if (operator.role?.roleName !== "operator") {
        throw new ApplicationError("User is not an operator", 400);
      }

      const approver = await User.findByPk(approverId, {
        include: [{ model: Role, as: "role" }],
      });
      if (!approver) throw new ApplicationError("Approver not found", 404);
      if (approver.role?.roleName !== "approval") {
        throw new ApplicationError("Selected user does not have approval role", 400);
      }

      const existing = await OperatorApprover.findOne({
        where: { operatorId, approverId },
      });
      if (existing) throw new ApplicationError("Approver is already assigned to this operator", 400);

      await OperatorApprover.create({ operatorId, approverId });

      return { message: "Approver assigned to operator successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to assign approver", 500);
    }
  }

  static async unassignApprover(operatorId, approverId) {
    try {
      const record = await OperatorApprover.findOne({
        where: { operatorId, approverId },
      });
      if (!record) throw new ApplicationError("Approver is not assigned to this operator", 404);

      await record.destroy();

      return { message: "Approver unassigned from operator successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to unassign approver", 500);
    }
  }

  static async getOperatorApprovers(operatorId) {
    try {
      const operator = await User.findByPk(operatorId, {
        include: [{ model: Role, as: "role" }],
      });
      if (!operator) throw new ApplicationError("Operator not found", 404);

      const approvers = await OperatorApprover.findAll({
        where: { operatorId },
        include: [{ model: User, as: "approver", attributes: ["userId", "firstName", "lastName", "email"] }],
      });

      return { approvers: approvers.map((r) => r.approver) };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch approvers", 500);
    }
  }


  static async getAllCompanies({ status, search, page = 1, limit = 20 }) {
    try {
      page = Number(page) || 1;
      limit = Number(limit) || 20;
      const offset = (page - 1) * limit;
      const where = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where[Op.or] = [
          { companyName: { [Op.iLike]: `%${search}%` } },
          { contactEmail: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows: companies, count } = await Company.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        companies,
        pagination: {
          total: count,
          page,
          pageSize: limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch companies", 500);
    }
  }

  static async getCompanyById(companyId) {
    try {
      const company = await Company.findByPk(companyId);
      if (!company) throw new ApplicationError("Company not found", 404);
      return { company };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch company", 500);
    }
  }

  static async createCompany({ companyName, address, contactEmail, contactFullName }) {
    try {
      const existing = await Company.findOne({ 
        where: {
           companyName: { [Op.iLike]: companyName.trim() },
        },
        paranoid: false 
      });
      
      if (existing) {
        if (existing.deletedAt) {
          throw new ApplicationError("Company with this name already exists but has been deleted", 400);
        }
        throw new ApplicationError("Company with this name already exists", 400);
      }

      const company = await Company.create({
        companyName: companyName.trim(),
        address: address?.trim() || null,
        contactEmail: contactEmail?.toLowerCase().trim() || null,
        contactFullName: contactFullName?.trim() || null,

      });

      return { message: "Company created successfully", company };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to create company", 500);
    }
  }

  static async updateCompany(companyId, data) {
    try {
      const company = await Company.findByPk(companyId);
      if (!company) throw new ApplicationError("Company not found", 404);

      if (data.companyName !== undefined) {
        const existing = await Company.findOne({
          where: {
            companyName: { [Op.iLike]: data.companyName.trim() },
            companyId: { [Op.ne]: companyId },
          },
        });
        if (existing) throw new ApplicationError("Company with this name already exists", 400);
        company.companyName = data.companyName.trim();
      }

      if (data.address !== undefined) company.address = data.address?.trim() || null;
      if (data.contactEmail !== undefined) company.contactEmail = data.contactEmail?.toLowerCase().trim() || null;
      if (data.status !== undefined) company.status = data.status;

      await company.save();
      return { message: "Company updated successfully", company };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update company", 500);
    }
  }

  static async deleteCompany(companyId) {
    try {
      const company = await Company.findByPk(companyId);
      if (!company) throw new ApplicationError("Company not found", 404);

      const usersInCompany = await User.count({ where: { companyId } });
      if (usersInCompany > 0) {
        throw new ApplicationError(
          `Cannot delete company. ${usersInCompany} user(s) are assigned to this company.`,
          400
        );
      }

      await company.destroy();
      return { message: "Company deleted successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete company", 500);
    }
  }

  static async suspendCompany(companyId) {
    try {
      const company = await Company.findByPk(companyId);
      if (!company) throw new ApplicationError("Company not found", 404);

      if (company.status === "suspended") {
        throw new ApplicationError("Company is already suspended", 400);
      }

      company.status = "suspended";
      await company.save();

      return { message: "Company suspended successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to suspend company", 500);
    }
  }

  static async activateCompany(companyId) {
    try {
      const company = await Company.findByPk(companyId);
      if (!company) throw new ApplicationError("Company not found", 404);

      if (company.status === "active") {
        throw new ApplicationError("Company is already active", 400);
      }

      company.status = "active";
      await company.save();

      return { message: "Company activated successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to activate company", 500);
    }
  }
}