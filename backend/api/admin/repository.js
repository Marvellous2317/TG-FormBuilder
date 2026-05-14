import { Op, Sequelize } from "sequelize";
import crypto from "crypto";

import { User, Role, Company, Department, OperatorApprover, SubmittedChecklist } from "../../models/index.js";
import { ApplicationError, ValidationError } from "../../utils/errorHandler.js";

import { generateJWT } from "../auth/helper.js";
import { sendApprovalEmail, sendPasswordMail } from "../../views/index.js";
import { sequelize } from "../../config/database.js";
import { generateRandomPassword } from "./helper.js";
import e from "express";




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


  static async getAllRoles(user, { deleted } = {}) {
    const role = user.roleId ? await Role.findByPk(user.roleId) : null;
    
    // Determine paranoid setting based on deleted filter
    let paranoid = true;
    let deletedAtCondition = null;
    
    if (deleted === "true") {
      paranoid = false;
      deletedAtCondition = { deletedAt: { [Op.ne]: null } };
    } else if (deleted === "all") {
      paranoid = false;
    }
    
    if (role?.roleName === "superAdmin") {
      try {
        const where = deletedAtCondition || {};
        const roles = await Role.findAll({
          where,
          order: [["roleName", "ASC"]],
          paranoid,
        });
        return { roles };
      } catch (error) {
        throw new ApplicationError("Failed to fetch roles", 500);
      }
    }

    try {
      const where = { isActive: true, roleName: { [Op.notIn]: ["superAdmin"] } };
      if (deletedAtCondition) {
        Object.assign(where, deletedAtCondition);
      }
      const roles = await Role.findAll({
        where,
        order: [["roleName", "ASC"]],
        paranoid,
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

  static async restoreRole(roleId) {
    try {
      const role = await Role.findByPk(roleId, { paranoid: false });
      if (!role) throw new ApplicationError("Role not found", 404);
      
      if (!role.deletedAt) {
        throw new ApplicationError("Role is not deleted", 400);
      }

      await role.restore();
      return { message: "Role restored successfully", role };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to restore role", 500);
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

  static async restoreUser(userId) {
    try {
      const user = await User.findByPk(userId, { paranoid: false });
      if (!user) throw new ApplicationError("User not found", 404);
      
      if (!user.deletedAt) {
        throw new ApplicationError("User is not deleted", 400);
      }

      await user.restore();
      return { message: "User restored successfully", user: user.toSafeJSON() };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to restore user", 500);
    }
  }

  static async addUser( admin,{ email, firstName, lastName, roleId, companyId, department }) {
    try {
      const existingUser = await User.findOne({ 
        where: { email: email.toLowerCase().trim() },
        paranoid: false 
      });

      
      
      if (existingUser) {
        if (existingUser.deletedAt) {
          throw new ApplicationError("User with this email already exists but has been deleted", 400);
        }
        throw new ApplicationError("User with this email already exists", 400);
      }

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

  static async getAllUsers({ status, roleId, companyId, department, page = 1, limit = 20, search, startDate, endDate, deleted }, user) {
    try {
      page = Number(page) || 1;
      limit = Number(limit) || 20;
      const offset = (page - 1) * limit;
      const where = {};

      let paranoid = true;
      if (deleted === "true") {
        paranoid = false;
        where.deletedAt = { [Op.ne]: null };
      } else if (deleted === "all") {
        paranoid = false;
      }

      const isSuperAdmin = user?.role?.roleName === "superAdmin";
      if (!isSuperAdmin && user?.companyId) {
        where.companyId = user.companyId;
      } else if (companyId) {
        where.companyId = companyId;
      }

      if (!isSuperAdmin) {
        where.roleId = {
          [Op.notIn]: Sequelize.literal(`(SELECT "roleId" FROM "packing_check_roles" WHERE "roleName" = 'superAdmin')`)
        };
      }

      if (status) {
        where.status = status;
      }

      if (roleId) {
        if (!isSuperAdmin) {
          where.roleId = {
            [Op.and]: [
              { [Op.eq]: roleId },
              { [Op.notIn]: Sequelize.literal(`(SELECT "roleId" FROM "packing_check_roles" WHERE "roleName" = 'superAdmin')`) }
            ]
          };
        } else {
          where.roleId = roleId;
        }
      }

      if (department) {
        where.department = { [Op.iLike]: `%${department}%` };
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
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
          { model: OperatorApprover, as: "operatorApprovers",attributes: ["id"]  , include: [{ model: User, as: "approver", attributes: ["firstName", "lastName", "userId"] }] }
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        paranoid,
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

  static async getUserStatistics(user) {
    const where = {};

    if (user?.role?.roleName !== "superAdmin") { 
      where.companyId = user.companyId;
    }
    try {
      const totalUsers = await User.count({ where });
      const activeUsers = await User.count({ where: { ...where, status: "active" } });
      const suspendedUsers = await User.count({ where: { ...where, status: "suspended" } });
   
      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
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


  static async getAllCompanies({ status, search, page = 1, limit = 20, startDate, endDate, deleted }) {
    try {
      page = Number(page) || 1;
      limit = Number(limit) || 20;
      const offset = (page - 1) * limit;
      const where = {};

      let paranoid = true;
      if (deleted === "true") {
        paranoid = false;
        where.deletedAt = { [Op.ne]: null };
      } else if (deleted === "all") {
        paranoid = false;
      }

      if (status) {
        where.status = status;
      } else {
        where.status = { [Op.ne]: "suspended" };
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      if (search) {
        where[Op.or] = [
          { companyName: { [Op.iLike]: `%${search}%` } },
          { contactEmail: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const [{ rows: companies, count }, totalUsersCount] = await Promise.all([
        Company.findAndCountAll({
          where,
          limit,
          offset,
          order: [["createdAt", "DESC"]],
          paranoid,
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                  SELECT COUNT(*)::integer
                  FROM "packing_check_users" AS "users"
                  WHERE "users"."companyId" = "packing_check_company"."companyId"
                    AND "users"."deletedAt" IS NULL
                )`),
                'userCount'
              ]
            ]
          }
        }),
        User.count()
      ]);

      return {
        companies,
        totalUsersCount,
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
      

      const usersCount = await User.count({ where: { companyId } });
      
      return { company: { ...company.toJSON(), usersCount } };
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
      if (data.contactFullName !== undefined) company.contactFullName = data.contactFullName?.trim() || null;
   

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

  static async restoreCompany(companyId) {
    try {
      const company = await Company.findByPk(companyId, { paranoid: false });
      if (!company) throw new ApplicationError("Company not found", 404);
      
      if (!company.deletedAt) {
        throw new ApplicationError("Company is not deleted", 400);
      }

      await company.restore();
      return { message: "Company restored successfully", company };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to restore company", 500);
    }
  }

  static async suspendCompany(companyId, reason) {
    try {
      const company = await Company.findByPk(companyId);
      if (!company) throw new ApplicationError("Company not found", 404);

      if (company.status === "suspended") {
        throw new ApplicationError("Company is already suspended", 400);
      }

      company.status = "suspended";
      company.suspendReason = reason;
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


  static async getAllDepartments({ status, search, page = 1, limit = 20, startDate, endDate }) {
    try {
      page = Number(page) || 1;
      limit = Number(limit) || 20;
      const offset = (page - 1) * limit;
      const where = {};

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      if (search) {
        where[Op.or] = [
          { departmentName: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows: departments, count } = await Department.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        departments,
        pagination: {
          total: count,
          page,
          pageSize: limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new ApplicationError("Failed to fetch departments", 500);
    }
  }

  static async getDepartmentById(departmentId) {
    try {
      const department = await Department.findByPk(departmentId);
      if (!department) throw new ApplicationError("Department not found", 404);
      return { department };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to fetch department", 500);
    }
  }

  static async createDepartment({ departmentName, description }) {
    try {
      const existing = await Department.findOne({
        where: {
          departmentName: { [Op.iLike]: departmentName.trim() },
        },
        paranoid: false,
      });

      if (existing) {
        if (existing.deletedAt) {
          throw new ApplicationError("Department with this name already exists but has been deleted", 400);
        }
        throw new ApplicationError("Department with this name already exists", 400);
      }

      const department = await Department.create({
        departmentName: departmentName.trim(),
        description: description?.trim() || null,
      });

      return { message: "Department created successfully", department };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to create department", 500);
    }
  }

  static async updateDepartment(departmentId, data) {
    try {
      const department = await Department.findByPk(departmentId);
      if (!department) throw new ApplicationError("Department not found", 404);

      if (data.departmentName !== undefined) {
        const existing = await Department.findOne({
          where: {
            departmentName: { [Op.iLike]: data.departmentName.trim() },
            departmentId: { [Op.ne]: departmentId },
          },
        });
        if (existing) throw new ApplicationError("Department with this name already exists", 400);
        department.departmentName = data.departmentName.trim();
      }

      if (data.description !== undefined) department.description = data.description?.trim() || null;
      if (data.status !== undefined) department.status = data.status;

      await department.save();
      return { message: "Department updated successfully", department };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to update department", 500);
    }
  }

  static async deleteDepartment(departmentId) {
    try {
      const department = await Department.findByPk(departmentId);
      if (!department) throw new ApplicationError("Department not found", 404);

      await department.destroy();
      return { message: "Department deleted successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to delete department", 500);
    }
  }

  static async suspendDepartment(departmentId) {
    try {
      const department = await Department.findByPk(departmentId);
      if (!department) throw new ApplicationError("Department not found", 404);

      if (department.status === "suspended") {
        throw new ApplicationError("Department is already suspended", 400);
      }

      department.status = "suspended";
      await department.save();

      return { message: "Department suspended successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to suspend department", 500);
    }
  }

  static async activateDepartment(departmentId) {
    try {
      const department = await Department.findByPk(departmentId);
      if (!department) throw new ApplicationError("Department not found", 404);

      if (department.status === "active") {
        throw new ApplicationError("Department is already active", 400);
      }

      department.status = "active";
      await department.save();

      return { message: "Department activated successfully" };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Failed to activate department", 500);
    }
  }

  static async getGlobalAnalytics() {
    try {

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

   
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
      startOfWeek.setDate(today.getDate() - diff);
      startOfWeek.setHours(0, 0, 0, 0);

  
      const totalActiveCompanies = await Company.count({
        where: { status: "active" },
      });

  
      const totalActiveUsers = await User.count({
        where: { status: "active" },
      });

      const totalChecklistsToday = await SubmittedChecklist.count({
        where: {
          createdAt: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
        },
      });


      const totalChecklistsThisWeek = await SubmittedChecklist.count({
        where: {
          createdAt: {
            [Op.gte]: startOfWeek,
            [Op.lt]: tomorrow,
          },
        },
      });

      return {
        totalActiveCompanies,
        totalActiveUsers,
        totalChecklistsToday,
        totalChecklistsThisWeek,
      };
    } catch (error) {
      console.log("Error in getGlobalAnalytics:", error);
      throw new ApplicationError("Failed to fetch analytics", 500);
    }
  }

  static async getCompanyAnalytics(companyId) {
    try {

      const company = await Company.findByPk(companyId);
      if (!company) throw new ApplicationError("Company not found", 404);


      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

  
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
      startOfWeek.setDate(today.getDate() - diff);
      startOfWeek.setHours(0, 0, 0, 0);


      const totalActiveUsers = await User.count({
        where: { companyId, status: "active" },
      });

   
      const totalChecklistsToday = await SubmittedChecklist.count({
        where: {
          companyId,
          createdAt: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
        },
      });


      const totalChecklistsThisWeek = await SubmittedChecklist.count({
        where: {
          companyId,
          createdAt: {
            [Op.gte]: startOfWeek,
            [Op.lt]: tomorrow,
          },
        },
      });

      return {
        companyId,
        companyName: company.companyName,
        totalActiveUsers,
        totalChecklistsToday,
        totalChecklistsThisWeek,
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      console.log("Error in getCompanyAnalytics:", error);
      throw new ApplicationError("Failed to fetch company analytics", 500);
    }
  }
}