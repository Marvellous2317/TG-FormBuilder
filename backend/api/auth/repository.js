
import { generateJWT, generateOpt } from "./helper.js";

import { User, Verification, Role, Company } from "../../models/index.js";
import { ApplicationError, ValidationError } from "../../utils/errorHandler.js";
import config from "../../appConfig.js";
import { sendPasswordMail, sendVerificationMail } from "../../views/index.js";
import crypto from "crypto";

export class AuthRepository {
  static async signin({ email, password }) {
    try {
      if (!email || !password) throw new ApplicationError("Missing email or password", 400);

      const user = await User.findOne({
        where: { email: email.toLowerCase() },
        include: [
          { model: Role, as: "role", attributes: ["roleId", "roleName"] },
          { model: Company, as: "company", attributes: ["companyId", "companyName"] },
        ],
      });

      if (!user) throw new ApplicationError("User does not exist", 404);

      const password_check = await user.checkPassword(password);
      if (!password_check) throw new ApplicationError("Invalid Credentials", 400);

      if (user.status === "suspended") throw new ApplicationError("Account suspended. Contact administrator.", 403);
      if (user.status === "pending") throw new ApplicationError("Account pending approval.", 403);

      const userData = user.toSafeJSON();
      const token = generateJWT(user.userId);

      const requiresPasswordChange = user.newLogin === true;

      return {
        token,
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

      const token = generateJWT(user.userId);
      await sendVerificationMail({ email, otp, firstName: user.firstName });

      const userData = user.toSafeJSON();
      return {
        message: "Signup successful. Please verify your email",
        user: userData,
        token,
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
        { model: Role, as: "role", attributes: ["roleId", "roleName"] },
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
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

      const token = generateJWT(user.userId);
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

      const token = generateJWT(user.userId);
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

      const token = generateJWT(user.userId);
      return { message: "Password changed successfully", token };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Password change failed", 500);
    }
  }



  static async createBulkUsers() {
    const usersData = [
      { email: "olatunjiadebayosmith@gmail.com", firstName: "smith", lastName: "olatunjiadebayo" },
    ];

    try {
      const createdUsers = [];
      const defaultRole = await Role.findOne({ where: { roleName: "operator" } });

      for (const data of usersData) {
        const existing = await User.findOne({ where: { email: data.email.toLowerCase() } });
        if (existing) continue;

        const randomPassword = crypto.randomBytes(6).toString("base64").slice(0, 10);

        const user = User.build({
          email: data.email.toLowerCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          roleId: defaultRole?.roleId,
          newLogin: true,
        });
        await user.setPassword(randomPassword);
        await user.save();

        const { otp, expiry } = generateOpt();
        await Verification.create({ userId: user.userId, otp, expiry });

        await sendPasswordMail({
          email: data.email,
          firstName: user.firstName,
          password: randomPassword,
        });

        const userData = user.toSafeJSON();
        createdUsers.push({ user: userData });
      }

      return {
        message: "Bulk users created successfully. Emails sent.",
        users: createdUsers,
      };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError("Bulk user creation failed", 500);
    }
  }
}