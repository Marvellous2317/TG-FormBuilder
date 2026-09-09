import { ValidationError } from "../../utils/errorHandler.js";
import { query, validationResult } from "express-validator";
import ResponseManager from "../../utils/responseManager.js";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// `companyId` accepts a single UUID string (legacy payload) or an array of UUIDs.
// Returns the list; duplicates are rejected. An empty array means "no company".
function normalizeCompanyIds(companyId) {
  if (companyId === undefined || companyId === null || companyId === "") return [];

  const list = Array.isArray(companyId) ? companyId : [companyId];
  if (Array.isArray(companyId) && companyId.length === 0) return [];

  const seen = new Set();
  for (const id of list) {
    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      throw new ValidationError("Company ID must be a valid UUID");
    }
    // Reject rather than silently collapse: a repeated id means the caller
    // built the payload wrong, and quietly fixing it hides that.
    if (seen.has(id)) {
      throw new ValidationError("Duplicate company ID: " + id);
    }
    seen.add(id);
  }

  return [...seen];
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return ResponseManager.error(res, "ValidationError", errorMessages.join(", "), 400);
  }
  next();
};

// ==================== QUERY VALIDATION ====================

export const validateCompaniesQuery = [
  query("status").optional().isIn(["active", "suspended"]).withMessage("Status must be active or suspended"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  query("deleted").optional().isIn(["true", "false", "all"]).withMessage("Deleted must be true, false, or all"),
  validate,
];

export const validateUsersQuery = [
  query("status").optional().isIn(["active", "suspended", "pending"]).withMessage("Invalid status"),
  query("roleId").optional().isUUID().withMessage("Role ID must be a valid UUID"),
  query("companyId").optional().isUUID().withMessage("Company ID must be a valid UUID"),
  query("department").optional().isString().withMessage("Department must be a string"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  query("deleted").optional().isIn(["true", "false", "all"]).withMessage("Deleted must be true, false, or all"),
  validate,
];

export const validateDepartmentsQuery = [
  query("status").optional().isIn(["active", "suspended"]).withMessage("Status must be active or suspended"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  query("deleted").optional().isIn(["true", "false", "all"]).withMessage("Deleted must be true, false, or all"),
  validate,
];

export const validateSubmittedChecklistsQuery = [
  query("companyId").optional().isUUID().withMessage("Company ID must be a valid UUID"),
  query("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Status must be pending, approved or rejected"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  validate,
];

export const validateAnalyticsQuery = [
  query("companyId").optional().isUUID().withMessage("Company ID must be a valid UUID"),
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  validate,
];

export const validateRolesQuery = [
  query("deleted").optional().isIn(["true", "false", "all"]).withMessage("Deleted must be true, false, or all"),
  validate,
];

export function validateAddUserMiddleware(req, res, next) {
  try {
    const { firstName, lastName, email, roleId, companyId, department, accessLevel, ...extraFields } = req.body;

    // Check for extra fields
    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }

    // Required fields
    if (!firstName || !lastName || !email || !roleId) {
      throw new ValidationError("Missing required fields: firstName, lastName, email, roleId");
    }

    // Validate firstName
    if (typeof firstName !== "string" || firstName.trim().length < 2) {
      throw new ValidationError("First name must be at least 2 characters");
    }
    if (firstName.trim().length > 100) {
      throw new ValidationError("First name must not exceed 100 characters");
    }

    // Validate lastName
    if (typeof lastName !== "string" || lastName.trim().length < 2) {
      throw new ValidationError("Last name must be at least 2 characters");
    }
    if (lastName.trim().length > 100) {
      throw new ValidationError("Last name must not exceed 100 characters");
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }
    if (email.length > 150) {
      throw new ValidationError("Email must not exceed 150 characters");
    }

    // Validate roleId (UUID)
    if (typeof roleId !== "string" || !UUID_REGEX.test(roleId)) {
      throw new ValidationError("Role ID must be a valid UUID");
    }

    // Validate companyId if provided (single UUID or array of UUIDs)
    normalizeCompanyIds(companyId);

    // Validate department if provided
    if (department !== undefined && department !== null) {
      if (typeof department !== "string") {
        throw new ValidationError("Department must be a string");
      }
      if (department.trim().length > 100) {
        throw new ValidationError("Department must not exceed 100 characters");
      }
    }

    // Validate accessLevel if provided (per-user read/write permission)
    if (accessLevel !== undefined && accessLevel !== null) {
      if (!["read_write", "read"].includes(accessLevel)) {
        throw new ValidationError("accessLevel must be one of: read_write, read");
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function validateRoleMiddleware(req, res, next) {
  try {
    const { roleName, description, isAdmin, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }

    if (!roleName || typeof roleName !== "string" || roleName.trim().length < 2) {
      throw new ValidationError("Role name is required and must be at least 2 characters");
    }

    if (roleName.trim().length > 50) {
      throw new ValidationError("Role name must not exceed 50 characters");
    }

    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        throw new ValidationError("Description must be a string");
      }
      if (description.length > 255) {
        throw new ValidationError("Description must not exceed 255 characters");
      }
    }

    if (isAdmin !== undefined && typeof isAdmin !== "boolean") {
      throw new ValidationError("isAdmin must be a boolean");
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdateUserMiddleware(req, res, next) {
  try {
    const { firstName, lastName, email, roleId, companyId, department, accessLevel, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (firstName !== undefined) {
      if (typeof firstName !== "string" || firstName.trim().length < 2) {
        throw new ValidationError("First name must be at least 2 characters");
      }
      if (firstName.trim().length > 100) {
        throw new ValidationError("First name must not exceed 100 characters");
      }
    }


    if (lastName !== undefined) {
      if (typeof lastName !== "string" || lastName.trim().length < 2) {
        throw new ValidationError("Last name must be at least 2 characters");
      }
      if (lastName.trim().length > 100) {
        throw new ValidationError("Last name must not exceed 100 characters");
      }
    }

    if (email !== undefined) {
      if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email format");
      }
      if (email.length > 150) {
        throw new ValidationError("Email must not exceed 150 characters");
      }
    }

    if (roleId !== undefined && roleId !== null) {
      if (typeof roleId !== "string" || !UUID_REGEX.test(roleId)) {
        throw new ValidationError("Role ID must be a valid UUID");
      }
    }

    // Single UUID or array of UUIDs
    normalizeCompanyIds(companyId);

    if (department !== undefined && department !== null) {
      if (typeof department !== "string") {
        throw new ValidationError("Department must be a string");
      }
      if (department.trim().length > 100) {
        throw new ValidationError("Department must not exceed 100 characters");
      }
    }

    if (accessLevel !== undefined && accessLevel !== null) {
      if (!["read_write", "read"].includes(accessLevel)) {
        throw new ValidationError("accessLevel must be one of: read_write, read");
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function validateUserIdsMiddleware(req, res, next) {
  try {
    const { userIds, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new ValidationError("userIds must be a non-empty array");
    }

    for (const userId of userIds) {
      if (typeof userId !== "string" || !UUID_REGEX.test(userId)) {
        throw new ValidationError("Each user ID must be a valid UUID");
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ==================== COMPANY VALIDATION ====================

export function validateCreateCompanyMiddleware(req, res, next) {
  try {
    const { companyName, address, contactFullName, contactEmail, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }

    // Required field
    if (!companyName || typeof companyName !== "string" || companyName.trim().length < 2) {
      throw new ValidationError("Company name is required and must be at least 2 characters");
    }
    if (companyName.trim().length > 100) {
      throw new ValidationError("Company name must not exceed 100 characters");
    }

      if (!contactFullName || typeof contactFullName !== "string") {
        throw new ValidationError("Contact full name must be a string");
      }
      if (contactFullName.trim().length > 100) {
      throw new ValidationError("Contact full name must not exceed 100 characters");
    }

    

    // Optional: address
    if (address !== undefined && address !== null) {
      if (typeof address !== "string") {
        throw new ValidationError("Address must be a string");
      }
      if (address.trim().length > 100) {
        throw new ValidationError("Address must not exceed 100 characters");
      }
    }

    // Optional: contactEmail
    if (contactEmail !== undefined && contactEmail !== null && contactEmail !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        throw new ValidationError("Invalid contact email format");
      }
      if (contactEmail.length > 50) {
        throw new ValidationError("Contact email must not exceed 50 characters");
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdateCompanyMiddleware(req, res, next) {
  try {
    const { companyName, address,contactFullName, contactEmail, status, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }

     if (!contactFullName || typeof contactFullName !== "string") {
        throw new ValidationError("Contact full name must be a string");
      }


    if (companyName !== undefined) {
      if (typeof companyName !== "string" || companyName.trim().length < 2) {
        throw new ValidationError("Company name must be at least 2 characters");
      }
      if (companyName.trim().length > 100) {
        throw new ValidationError("Company name must not exceed 100 characters");
      }
    }

 
    if (address !== undefined && address !== null) {
      if (typeof address !== "string") {
        throw new ValidationError("Address must be a string");
      }
      if (address.trim().length > 100) {
        throw new ValidationError("Address must not exceed 100 characters");
      }
    }

  
    if (contactEmail !== undefined && contactEmail !== null && contactEmail !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        throw new ValidationError("Invalid contact email format");
      }
      if (contactEmail.length > 50) {
        throw new ValidationError("Contact email must not exceed 50 characters");
      }
    }

 
    if (status !== undefined) {
      const validStatuses = ["active", "suspended"];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(", ")}`);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function validateSuspendCompanyMiddleware(req, res, next) {
  try {
    const { reason, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
      throw new ValidationError("Reason is required and must be at least 5 characters");
    }
    if (reason.trim().length > 500) {
      throw new ValidationError("Reason must not exceed 500 characters");
    }

    next();
  } catch (error) {
    next(error);
  }
}


export function validateCreateDepartmentMiddleware(req, res, next) {
  try {
    const { departmentName, description, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }


    if (!departmentName || typeof departmentName !== "string" || departmentName.trim().length < 2) {
      throw new ValidationError("Department name is required and must be at least 2 characters");
    }
    if (departmentName.trim().length > 100) {
      throw new ValidationError("Department name must not exceed 100 characters");
    }

  
    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        throw new ValidationError("Description must be a string");
      }
      if (description.trim().length > 255) {
        throw new ValidationError("Description must not exceed 255 characters");
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function validateUpdateDepartmentMiddleware(req, res, next) {
  try {
    const { departmentName, description, status, ...extraFields } = req.body;

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`Unexpected fields: ${extraKeys.join(", ")}`);
    }


    if (departmentName !== undefined) {
      if (typeof departmentName !== "string" || departmentName.trim().length < 2) {
        throw new ValidationError("Department name must be at least 2 characters");
      }
      if (departmentName.trim().length > 100) {
        throw new ValidationError("Department name must not exceed 100 characters");
      }
    }


    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        throw new ValidationError("Description must be a string");
      }
      if (description.trim().length > 255) {
        throw new ValidationError("Description must not exceed 255 characters");
      }
    }


    if (status !== undefined) {
      const validStatuses = ["active", "suspended"];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(", ")}`);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
