import jwt from "jsonwebtoken";
import { User, Role, Company } from "../../models/index.js";
import ResponseManager from "../../utils/responseManager.js";
import config from "../../appConfig.js";
import { ROLE_SUPER_ADMIN, ROLE_CORPORATE_ADMIN, APPROVAL_ROLES, OPERATOR_ROLES } from "../constants/roles.js";

export async function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, config.SECRET_KEY, { algorithms: [config.algorithm] });
    const userId = decoded.id;

    if (!userId) return null;

    const user = await User.findByPk(userId, {
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
    if (!user) return null;

    const data = user.toSafeJSON();

    // The token decides the active workspace. Fall back to the stored company for
    // tokens issued before companyId was part of the payload.
    const tokenCompanyId = decoded.companyId || null;
    if (!tokenCompanyId) return data;

    // Workspaces exist only for corporateAdmin (and superAdmin, who may enter any
    // company). Every other role stays on its stored company.
    const roleName = data.role?.roleName;
    const isSuperAdmin = roleName === ROLE_SUPER_ADMIN;
    if (roleName !== ROLE_CORPORATE_ADMIN && !isSuperAdmin) return data;

    const memberships = data.companies || [];
    const isMember = memberships.some((c) => c.companyId === tokenCompanyId);

    // Membership can be revoked after the token was issued; the token must not
    // outlive the access it claims.
    if (!isMember && !isSuperAdmin) {
      const error = new Error("Your access to this workspace has been removed. Please sign in again.");
      error.name = "WorkspaceAccessError";
      throw error;
    }

    // Every consumer of req.user.companyId / req.user.company now tracks the token.
    data.companyId = tokenCompanyId;
    data.company =
      memberships.find((c) => c.companyId === tokenCompanyId) ||
      (await Company.findByPk(tokenCompanyId, { attributes: ["companyId", "companyName"] }))?.toJSON() ||
      null;

    return data;
  } catch (error) {
    if (error?.name === "WorkspaceAccessError") throw error;
    return null;
  }
}

export function isAuthenticated(req, res, next) {
  let token = req.headers["authorization"];

  if (!token) {
    return ResponseManager.error(res, "AuthenticationError", "Token is missing", 401);
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  decodeToken(token)
    .then((user) => {
      if (!user) {
        return ResponseManager.error(res, "AuthenticationError", "Invalid user", 401);
      }

      req.user = user;

      
      next();
    })
    .catch((err) => {
      if (err.name === "WorkspaceAccessError") {
        return ResponseManager.error(res, "WorkspaceAccessError", err.message, 403);
      }
      if (err.name === "TokenExpiredError") {
        return ResponseManager.error(res, "AuthenticationError", "Token expired", 401);
      }
      if (err.name === "JsonWebTokenError") {
        return ResponseManager.error(res, "AuthenticationError", "Invalid token", 401);
      }
      return ResponseManager.error(res, "AuthenticationError", `Auth failed: ${err.message}`, 401);
    });
}


export function adminRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  const userRole = user.role;
  if (!userRole || !userRole.roleName) {
    return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);
  }

  // Any role flagged as admin-type (admin or a custom admin role) may reach admin
  // routes. superAdmin always passes. Whether it can write is decided by
  // requiresWriteAccess.
  if (userRole.isAdmin !== true && userRole.roleName !== "superAdmin") {
    return ResponseManager.error(res, "AuthorizationError", "Admin access required", 403);
  }

  next();
}


export function superAdminRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  const userRole = user.role;
  if (!userRole || !userRole.roleName) {
    return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);

  }
  console.log("User Role:", userRole.roleName); 

  if (userRole.roleName !== "superAdmin") {
    return ResponseManager.error(res, "AuthorizationError", "Super Admin access required", 403);
  }

  next();
}


export function approvalRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  const userRole = user.role;
  if (!userRole || !userRole.roleName) {
    return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);
  }

  if (!APPROVAL_ROLES.includes(userRole.roleName)) {
    return ResponseManager.error(res, "AuthorizationError", "Approval access required", 403);
  }

  next();
}


export function operatorRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  const userRole = user.role;
  if (!userRole || !userRole.roleName) {
    return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);
  }

  if (!OPERATOR_ROLES.includes(userRole.roleName)) {
    return ResponseManager.error(res, "AuthorizationError", "Operator access required", 403);
  }

  next();
}


export function requiresRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
    }

    const userRole = user.role;
    if (!userRole || !userRole.roleName) {
      return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);
    }

    if (!allowedRoles.includes(userRole.roleName)) {
      return ResponseManager.error(
        res,
        "AuthorizationError",
        `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        403
      );
    }

    next();
  };
}



export function requiresWriteAccess(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  if (user.role?.roleName !== "superAdmin" && user.accessLevel === "read") {
    return ResponseManager.error(res, "AuthorizationError", "Read-only access: write not permitted", 403);
  }

  next();
}


const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


export function validateUUID(...paramNames) {
  return (req, res, next) => {
    const invalidParams = [];

    for (const paramName of paramNames) {
      const value = req.params[paramName];
      
      if (!value) {
        invalidParams.push(`${paramName} is required`);
      } else if (!UUID_REGEX.test(value)) {
        invalidParams.push(`${paramName} must be a valid UUID`);
      }
    }

    if (invalidParams.length > 0) {
      return ResponseManager.error(
        res,
        "ValidationError",
        invalidParams.join(", "),
        400
      );
    }

    next();
  };
}


export function validateId(paramName = "id") {
  return validateUUID(paramName);
}


export function isValidUUID(value) {
  return typeof value === "string" && UUID_REGEX.test(value);
}


export function checkNewLoginRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }


  const allowedPaths = ["/change-password", "/force-change-password"];
  if (allowedPaths.some((path) => req.path.includes(path))) {
    return next();
  }

  if (user.newLogin === true) {
    return ResponseManager.error(
      res,
      "PasswordChangeRequired",
      "Password change required. Please change your password before proceeding.",
      403
    );
  }

  next();
}