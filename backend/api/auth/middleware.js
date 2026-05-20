import { ValidationError } from "../../utils/errorHandler.js";

export const sigUpMiddleware = (req, res, next) => {
  const { firstName, lastName, email, password, companyId, roleId, ...extraFields } = req.body;

  const extraKeys = Object.keys(extraFields);
  if (extraKeys.length > 0) throw new ValidationError(`${extraKeys.join(", ")} not required`);

  if (!firstName || !lastName || !email || !password) throw new ValidationError("All fields required.");

  if (typeof firstName !== "string" || firstName.trim().length < 2) throw new ValidationError("first name is not valid");

  if (typeof lastName !== "string" || lastName.trim().length < 2) throw new ValidationError("last name is not valid");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new ValidationError("Invalid email.");

  if (typeof password !== "string" || password.length < 5) throw new ValidationError("Password must be at least 5 characters");

  next();
};

export const sigInMiddleware = (req, res, next) => {
  const { email, password, ...extraFields } = req.body;

  const extraKeys = Object.keys(extraFields);
  if (extraKeys.length > 0) throw new ValidationError(`${extraKeys.join(", ")} not required`);

  if (!email || !password) throw new ValidationError("All fields required.");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new ValidationError("Invalid email.");

  if (typeof password !== "string" || password.length < 5) throw new ValidationError("Password must be at least 5 characters");

  next();
};

export const accountVerificationMiddleware = (req, res, next) => {
  try {
    const { otp, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`${extraKeys.join(", ")} not required`);
    }

    if (otp === undefined || otp === null) {
      throw new ValidationError("otp required");
    }

    const otpStr = String(otp);

    if (!/^\d{6}$/.test(otpStr)) {
      throw new ValidationError("otp must be exactly 6 digits");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const changePasswordMiddleware = (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`${extraKeys.join(", ")} not required`);
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError("All password fields are required");
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      throw new ValidationError("New password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError("Passwords do not match");
    }

    next();
  } catch (error) {
    next(error);
  }
};