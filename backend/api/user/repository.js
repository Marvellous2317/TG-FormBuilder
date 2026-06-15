import { col, fn, literal, Op, Sequelize } from "sequelize";
import fs from "fs";
import { ApplicationError, ValidationError } from "../../utils/errorHandler.js";
import {
  User,
  Role,
  Company,
  Verification,
  SubmittedChecklist,
  SubmittedChecklistApproval,
} from "../../models/index.js";
import { generateJWT, generateOpt } from "../auth/helper.js";
import { sendVerificationMail } from "../../views/index.js";
import { getStateAndLGA } from "../../utils/index.js";
import {
  AzureImageDownloader,
  uploadFileToAzureBlob,
} from "../../utils/azureService.js";
import { sequelize } from "../../config/database.js";
import { messages } from "@trycourier/courier/api/index.js";

export class UserRepository {
  static async updateUser(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApplicationError("User not found");
    try {
      await user.update(data);
      return user;
    } catch (error) {
      throw new ApplicationError("An error occur");
    }
  }

  static async updateUserDetails(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApplicationError("User not found", 404);

    const allowedFields = ["firstName", "lastName", "department"];
    const filteredData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        filteredData[field] = data[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      throw new ApplicationError("No valid fields provided to update", 400);
    }

    try {
      await user.update(filteredData);
      return { messages: "User details updated successfully" };
    } catch (error) {
      throw new ApplicationError("Failed to update user details");
    }
  }

  static async changePassword(userId, data) {
    const password = data.password;
    const newPassword = data.newPassword;

    if (!password || password.length < 5) {
      throw new ApplicationError(
        "Password must be greater than four characters",
        400,
      );
    }

    const user = await User.findOne({
      where: { userId: userId },
    });

    if (!user) {
      throw new ApplicationError("User not found", 404);
    }

    const password_check = await user.checkPassword(password);
    if (!password_check) throw new ApplicationError("Invalid Credentials", 400);
    try {
      await user.setPassword(newPassword);
      await user.save();

      const token = generateJWT(user.userId);

      return {
        token,
        user,
        message: "Password changed successfully",
      };
    } catch (error) {
      throw new ApplicationError("An error occur");
    }
  }

  static async forgotPassword({ data, email }) {
    const { password, otp } = data;
    if (!password || password.length < 5) {
      throw new ApplicationError(
        "Password must be greater than four characters",
        400,
      );
    }

    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new ApplicationError("User not found", 404);
    }

    let verifyOtp = await Verification.findOne({
      where: {
        email: email,
        otp: otp,
      },
    });

    if (!verifyOtp) throw new ApplicationError("Invalid OTP", 400);
    if (verifyOtp.expiry < new Date())
      throw new ApplicationError("OTP expired", 400);
    try {
      await user.setPassword(password);
      await user.save();
      await verifyOtp.destroy();
      const token = generateJWT(user.userId);
      return {
        token,
        user,
        message: "Password changed successfully",
      };
    } catch (error) {
      throw new ApplicationError("An error Occur");
    }
  }

  static async resetPassword(email) {
    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new ApplicationError("User not found", 404);
    }

    try {
      const { otp, expiry } = generateOpt();

      await Verification.create({
        email: email,
        otp,
        expiry,
        userId: user.userId,
      });

      await sendVerificationMail({
        email: user.email,
        otp,
        firstName: user.firstName,
      });

      return {
        message: "OTP sent to your email successfully",
      };
    } catch (error) {
      console.log(error);

      throw new ApplicationError("An Error occur");
    }
  }

  static async getUser(userId) {
    try {
      let user = await User.findOne({
        where: { userId: userId },
        include: [{ model: Role, as: "role" }],
        attributes: { exclude: ["password"] },
      });
      if (!user) throw new ValidationError("User not found");

      return { user };
    } catch (error) {
      throw error;
    }
  }

  static async uploadSignature({ userId, signature }) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApplicationError("User not found");

    try {
      await user.update({ signature: signature }, { where: { userId } });

      return { message: "Signature uploaded successfully" };
    } catch (error) {
      throw error;
    }
  }

  static async deleteAccount(userId) {
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      throw new ApplicationError(`No user found with ID:`, 400);
    }
    try {
      await user.destroy();
      return { success: true, message: "Account deleted successfully" };
    } catch (error) {
      throw new ApplicationError(`Failed to delete account`);
    }
  }

  static async getUserAnalytics(user) {
    try {
      const role = user.role?.roleName;
      const userId = user.userId;
      const companyId = user.companyId;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(today.getDate() - diff);
      startOfWeek.setHours(0, 0, 0, 0);

      if (role === "superAdmin") {
        const totalActiveCompanies = await Company.count({
          where: { status: "active" },
        });
        const totalActiveUsers = await User.count({
          where: { status: "active" },
        });
        const totalChecklistsToday = await SubmittedChecklist.count({
          where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } },
        });
        const totalChecklistsThisWeek = await SubmittedChecklist.count({
          where: { createdAt: { [Op.gte]: startOfWeek, [Op.lt]: tomorrow } },
        });
        const pendingChecklists = await SubmittedChecklist.count({
          where: { status: "pending" },
        });
        const approvedChecklists = await SubmittedChecklist.count({
          where: { status: "approved" },
        });
        const rejectedChecklists = await SubmittedChecklist.count({
          where: { status: "rejected" },
        });

        return {
          scope: "global",
          totalActiveCompanies,
          totalActiveUsers,
          totalChecklistsToday,
          totalChecklistsThisWeek,
          pendingChecklists,
          approvedChecklists,
          rejectedChecklists,
        };
      }

      if (role === "admin") {
        if (!companyId)
          throw new ApplicationError("Admin must belong to a company", 400);

        const totalActiveUsers = await User.count({
          where: { companyId, status: "active" },
        });
        const totalChecklistsToday = await SubmittedChecklist.count({
          where: {
            companyId,
            createdAt: { [Op.gte]: today, [Op.lt]: tomorrow },
          },
        });
        const totalChecklistsThisWeek = await SubmittedChecklist.count({
          where: {
            companyId,
            createdAt: { [Op.gte]: startOfWeek, [Op.lt]: tomorrow },
          },
        });
        const totalPending = await SubmittedChecklist.count({
          where: { companyId, status: "pending" },
        });
        const totalApproved = await SubmittedChecklist.count({
          where: { companyId, status: "approved" },
        });
        const totalRejected = await SubmittedChecklist.count({
          where: { companyId, status: "rejected" },
        });

        return {
          scope: "company",
          totalActiveUsers,
          totalChecklistsToday,
          totalChecklistsThisWeek,
          totalPending,
          totalApproved,
          totalRejected,
        };
      }

      if (role === "operator") {
        const myChecklistsToday = await SubmittedChecklist.count({
          where: {
            submittedBy: userId,
            createdAt: { [Op.gte]: today, [Op.lt]: tomorrow },
          },
        });
        const myChecklistsThisWeek = await SubmittedChecklist.count({
          where: {
            submittedBy: userId,
            createdAt: { [Op.gte]: startOfWeek, [Op.lt]: tomorrow },
          },
        });
        const totalPending = await SubmittedChecklist.count({
          where: { submittedBy: userId, status: "pending" },
        });
        const totalApproved = await SubmittedChecklist.count({
          where: { submittedBy: userId, status: "approved" },
        });
        const totalRejected = await SubmittedChecklist.count({
          where: { submittedBy: userId, status: "rejected" },
        });
        const totalChecklists = await SubmittedChecklist.count({
          where: { submittedBy: userId },
        });

        return {
          scope: "personal",
          myChecklistsToday,
          myChecklistsThisWeek,
          totalPending,
          totalApproved,
          totalRejected,
          totalChecklists,
        };
      }

      if (role !== "admin"  && role !=="operator") {
        // Count this approver's own decision rows, not SubmittedChecklist.approvedBy
        // (approvedBy is only set on the submission for whoever casts the final
        // decision in the chain, so it undercounts approvers in multi-step flows).
        const myChecklistsToday = await SubmittedChecklistApproval.count({
          where: {
            approverId: userId,
            status: { [Op.in]: ["approved", "rejected"] },
            decidedAt: { [Op.gte]: today, [Op.lt]: tomorrow },
          },
        });
        const myChecklistsThisWeek = await SubmittedChecklistApproval.count({
          where: {
            approverId: userId,
            status: { [Op.in]: ["approved", "rejected"] },
            decidedAt: { [Op.gte]: startOfWeek, [Op.lt]: tomorrow },
          },
        });
        const totalApproved = await SubmittedChecklistApproval.count({
          where: { approverId: userId, status: "approved" },
        });
        const totalRejected = await SubmittedChecklistApproval.count({
          where: { approverId: userId, status: "rejected" },
        });
        const totalReviewed = await SubmittedChecklistApproval.count({
          where: { approverId: userId, status: { [Op.in]: ["approved", "rejected"] } },
        });

        const totalPending = await SubmittedChecklistApproval.count({
          where: { approverId: userId, status: "pending" },
          include: [
            {
              model: SubmittedChecklist,
              as: "submittedChecklist",
              attributes: [],
              required: true,
              where: { status: "pending" },
            },
          ],
        });

        return {
          scope: "personal",
          myChecklistsToday,
          myChecklistsThisWeek,
          totalApproved,
          totalRejected,
          totalReviewed,
          totalPending,
        };
      }

      throw new ApplicationError("Invalid role for analytics", 403);
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      console.log("Error in getUserAnalytics:", error);
      throw new ApplicationError("Failed to fetch user analytics", 500);
    }
  }
}
