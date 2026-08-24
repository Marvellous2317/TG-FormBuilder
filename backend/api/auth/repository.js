
import { generateJWT, generateOpt, generateRefreshSecret, hashRefreshSecret, compareRefreshSecret, composeRefreshToken, parseRefreshToken, getRefreshTokenTtlMs } from "./helper.js";

import { User, Verification, Role, Company, RefreshToken, UserCompany } from "../../models/index.js";
import { ApplicationError, ValidationError } from "../../utils/errorHandler.js";
import { ROLE_SUPER_ADMIN } from "../constants/roles.js";
import config from "../../appConfig.js";
import { sendPasswordMail, sendVerificationMail } from "../../views/index.js";
import crypto from "crypto";

async function issueRefreshToken(userId, { userAgent, ipAddress } = {}) {
  const secret = generateRefreshSecret();
  const tokenHash = await hashRefreshSecret(secret);
  const expiresAt = new Date(Date.now() + getRefreshTokenTtlMs());

  const record = await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
    ipAddress: ipAddress ? String(ipAddress).slice(0, 64) : null,
  });

  return {
    refreshToken: composeRefreshToken(record.tokenId, secret),
    refreshTokenId: record.tokenId,
    refreshTokenExpiresAt: expiresAt,
  };
}

function getRequestContext(request) {
  if (!request) return {};
  return {
    userAgent: request.headers?.["user-agent"],
    ipAddress:
      (request.headers?.["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
      request.ip ||
      request.connection?.remoteAddress,
  };
}

export class AuthRepository {
  static async signin({ email, password }, request) {
    try {
      if (!email || !password) throw new ApplicationError("Missing email or password", 400);

      const user = await User.findOne({
        where: { email: email.toLowerCase() },
        include: [
          { model: Role, as: "role", attributes: ["roleId", "roleName", "isAdmin"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
          {
            model: Company,
            as: "companies",
            attributes: ["companyId", "companyName"],
            through: { attributes: [] },
          },
        ],
      });

      if (!user) throw new ApplicationError("User does not exist", 404);

      const password_check = await user.checkPassword(password);
      if (!password_check) throw new ApplicationError("Invalid Credentials", 400);

      if (user.status === "suspended") throw new ApplicationError("Account suspended. Contact administrator.", 403);
      if (user.status === "pending") throw new ApplicationError("Account pending approval.", 403);

      const userData = user.toSafeJSON();
      const token = generateJWT(user.userId, user.companyId);
      const { refreshToken } = await issueRefreshToken(
        user.userId,
        getRequestContext(request)
      );

      const requiresPasswordChange = user.newLogin === true;

      return {
        token,
        refreshToken,
        user: userData,
        message: "Signin successful",
        requiresPasswordChange,
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(error.message || "Signin failed", 500);
    }
  }

  static async signup(request) {
    const data = request.body;
    const { email, password, firstName, lastName, companyId, roleId } = data;

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) throw new ApplicationError("User already exists", 400);

    try {
      if (companyId) {
        const company = await Company.findByPk(companyId);
        if (!company) throw new ValidationError("Invalid company ID");
      }
      let assignedRoleId = roleId;
      if (!assignedRoleId) {
        const defaultRole = await Role.findOne({ where: { roleName: "operator" } });
        if (!defaultRole) throw new ApplicationError("Default role not configured. Contact administrator.", 500);
        assignedRoleId = defaultRole.roleId;
      } else {
        const role = await Role.findByPk(assignedRoleId);
        if (!role) throw new ValidationError("Invalid role ID");
      }

      const user = User.build({
        email: email.toLowerCase(),
        firstName,
        lastName,
        roleId: assignedRoleId,
        companyId: companyId || null,
      });
      await user.setPassword(password);
      await user.save();

      const { otp, expiry } = generateOpt();
      await Verification.create({ userId: user.userId, otp, expiry });

      const token = generateJWT(user.userId, user.companyId);
      const { refreshToken, refreshTokenExpiresAt } = await issueRefreshToken(
        user.userId,
        getRequestContext(request)
      );
      await sendVerificationMail({ email, otp, firstName: user.firstName });

      const userData = user.toSafeJSON();
      return {
        message: "Signup successful. Please verify your email",
        user: userData,
        token,
        refreshToken,
        refreshTokenExpiresAt,
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Signup failed", 500);
    }
  }

  static async verifyEmail(request) {
    const { otp } = request.body;
    const userId = request.user?.userId;

    if (!userId) throw new ApplicationError("Authentication error", 401);
    if (!otp) throw new ApplicationError("OTP required", 400);

    const user = await User.findOne({
      where: { userId },
      include: [
        { model: Role, as: "role", attributes: ["roleId", "roleName", "isAdmin"] },
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
        {
          model: Company,
          as: "companies",
          attributes: ["companyId", "companyName"],
          through: { attributes: [] },
        },
      ],
    });
    if (!user) throw new ApplicationError("User not found", 404);

    const otpRecord = await Verification.findOne({
      where: { userId: user.userId, otp: otp },
    });

    if (!otpRecord) throw new ApplicationError("Invalid OTP", 400);
    if (otpRecord.expiry < new Date()) throw new ApplicationError("OTP expired", 400);

    try {
      user.isVerifyEmail = true;
      await user.save();
      await otpRecord.destroy();

      const token = generateJWT(user.userId, user.companyId);
      const userData = user.toSafeJSON();

      return {
        message: "Email verified successfully",
        token,
        user: userData,
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Email verification failed", 500);
    }
  }

  static async requestForOtp(request) {
    const userId = request?.user?.userId;

    if (!userId) throw new ApplicationError("Authentication error", 401);

    try {
      const user = await User.findByPk(userId);
      if (!user) throw new ApplicationError("User does not exist", 400);

      const { otp, expiry } = generateOpt();
      await Verification.create({ userId: user.userId, otp, expiry });
      await sendVerificationMail({ email: user.email, otp, firstName: user.firstName });

      const token = generateJWT(user.userId, user.companyId);
      return { message: "OTP successfully sent.", token };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("OTP request failed", 500);
    }
  }

  static async changePassword(request) {
    const userId = request?.user?.userId;
    const { currentPassword, newPassword, confirmPassword } = request.body;

    if (!userId) throw new ApplicationError("Authentication error", 401);
    if (!currentPassword || !newPassword || !confirmPassword)
      throw new ValidationError("All password fields are required");
    if (newPassword !== confirmPassword) throw new ValidationError("Passwords do not match");
    if (newPassword.length < 6) throw new ValidationError("Password must be at least 6 characters");

    try {
      const user = await User.findByPk(userId);
      if (!user) throw new ApplicationError("User not found", 404);

      const passwordValid = await user.checkPassword(currentPassword);
      if (!passwordValid) throw new ApplicationError("Current password is incorrect", 400);

      await user.setPassword(newPassword);
      user.newLogin = false;
      await user.save();

      const token = generateJWT(user.userId, user.companyId);
      return { message: "Password changed successfully", token };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Password change failed", 500);
    }
  }




  static async refreshToken(request) {
    const raw = request.body?.refreshToken;
    if (!raw) throw new ValidationError("refreshToken is required");

    const parsed = parseRefreshToken(raw);
    if (!parsed) throw new ApplicationError("Invalid refresh token", 401);

    const record = await RefreshToken.findByPk(parsed.tokenId);
    if (!record) throw new ApplicationError("Invalid refresh token", 401);

    if (record.revokedAt) throw new ApplicationError("Refresh token revoked", 401);
    if (record.expiresAt && record.expiresAt.getTime() < Date.now())
      throw new ApplicationError("Refresh token expired", 401);

    const matches = await compareRefreshSecret(parsed.secret, record.tokenHash);
    if (!matches) {
      record.revokedAt = new Date();
      await record.save();
      throw new ApplicationError("Invalid refresh token", 401);
    }

    const user = await User.findByPk(record.userId, {
      include: [
        { model: Role, as: "role", attributes: ["roleId", "roleName", "isAdmin"] },
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
        {
          model: Company,
          as: "companies",
          attributes: ["companyId", "companyName"],
          through: { attributes: [] },
        },
      ],
    });
    if (!user) throw new ApplicationError("User not found", 404);
    if (user.status === "suspended") throw new ApplicationError("Account suspended.", 403);

    const issued = await issueRefreshToken(user.userId, getRequestContext(request));
    record.revokedAt = new Date();
    record.replacedByTokenId = issued.refreshTokenId;
    await record.save();

    const token = generateJWT(user.userId, user.companyId);
    return {
      message: "Token refreshed",
      token,
      refreshToken: issued.refreshToken,
      user: user.toSafeJSON(),
    };
  }

  // Switches the caller's ACTIVE workspace (users.companyId) to another company
  // they are a member of, and re-issues credentials with the same shape as signin.
  static async switchWorkspace(userId, companyId, request) {
    if (!userId) throw new ApplicationError("Authentication error", 401);
    if (!companyId) throw new ValidationError("companyId is required");

    const userIncludes = [
      { model: Role, as: "role", attributes: ["roleId", "roleName", "isAdmin"] },
      { model: Company, as: "company", attributes: ["companyId", "companyName"] },
      {
        model: Company,
        as: "companies",
        attributes: ["companyId", "companyName"],
        through: { attributes: [] },
      },
    ];

    try {
      const user = await User.findByPk(userId, { include: userIncludes });
      if (!user) throw new ApplicationError("User not found", 404);
      if (user.status === "suspended")
        throw new ApplicationError("Account suspended. Contact administrator.", 403);

      const company = await Company.findByPk(companyId);
      if (!company) throw new ApplicationError("Company not found", 404);
      if (company.status === "suspended")
        throw new ApplicationError("This company is suspended.", 403);

      // superAdmin may enter any company; everyone else needs a membership row.
      if (user.role?.roleName !== ROLE_SUPER_ADMIN) {
        const membership = await UserCompany.findOne({ where: { userId, companyId } });
        if (!membership)
          throw new ApplicationError("You do not belong to this company", 403);
      }

      if (user.companyId !== companyId) {
        user.companyId = companyId;
        await user.save();
      }

      const refreshedUser = await User.findByPk(userId, { include: userIncludes });
      const token = generateJWT(userId, companyId);
      const { refreshToken } = await issueRefreshToken(userId, getRequestContext(request));

      return {
        token,
        refreshToken,
        user: refreshedUser.toSafeJSON(),
        message: "Workspace switched successfully",
        requiresPasswordChange: refreshedUser.newLogin === true,
      };
    } catch (error) {
      if (error instanceof ApplicationError || error instanceof ValidationError) throw error;
      throw new ApplicationError(error.message || "Failed to switch workspace", 500);
    }
  }

  static async signout(request) {
    const raw = request.body?.refreshToken;
    if (!raw) return { message: "Signed out" };

    const parsed = parseRefreshToken(raw);
    if (!parsed) return { message: "Signed out" };

    const record = await RefreshToken.findByPk(parsed.tokenId);
    if (!record || record.revokedAt) return { message: "Signed out" };

    const matches = await compareRefreshSecret(parsed.secret, record.tokenHash);
    if (matches) {
      record.revokedAt = new Date();
      await record.save();
    }
    return { message: "Signed out" };
  }
}