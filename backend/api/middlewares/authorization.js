import jwt from "jsonwebtoken";
import { User, Role, Company } from "../../models/index.js";
import ResponseManager from "../../utils/responseManager.js";
import config from "../../appConfig.js";

export async function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, config.SECRET_KEY, { algorithms: [config.algorithm] });
    const userId = decoded.id;

    if (!userId) return null;

    const user = await User.findByPk(userId, {
      include: [
        { model: Role, as: "role", attributes: ["roleId", "roleName", "permissions", "level"] },
        { model: Company, as: "company", attributes: ["companyId", "companyName"] },
      ],
    });
    if (!user) return null;
    return user.toSafeJSON();
  } catch {
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
      if (err.name === "TokenExpiredError") {
        return ResponseManager.error(res, "AuthenticationError", "Token expired", 401);
      }
      if (err.name === "JsonWebTokenError") {
        return ResponseManager.error(res, "AuthenticationError", "Invalid token", 401);
      }
      return ResponseManager.error(res, "AuthenticationError", `Auth failed: ${err.message}`, 401);
    });
}

// Check if user has admin or superAdmin role
export function adminRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  const userRole = user.role;
  if (!userRole || !userRole.roleName) {
    return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);
  }

  const allowedRoles = ["admin", "superAdmin"];
  if (!allowedRoles.includes(userRole.roleName)) {
    return ResponseManager.error(res, "AuthorizationError", "Admin access required", 403);
  }

  next();
}

// Check if user has superAdmin role
export function superAdminRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  const userRole = user.role;
  if (!userRole || !userRole.roleName) {
    return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);
  }

  if (userRole.roleName !== "superAdmin") {
    return ResponseManager.error(res, "AuthorizationError", "Super Admin access required", 403);
  }

  next();
}

// Check if user has approval role or higher
export function approvalRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  const userRole = user.role;
  if (!userRole || !userRole.roleName) {
    return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);
  }

  const allowedRoles = ["approval", "admin", "superAdmin"];
  if (!allowedRoles.includes(userRole.roleName)) {
    return ResponseManager.error(res, "AuthorizationError", "Approval access required", 403);
  }

  next();
}

// Check if user has at least operator role (any authenticated user with a role)
export function operatorRequired(req, res, next) {
  const user = req.user;

  if (!user) {
    return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
  }

  const userRole = user.role;
  if (!userRole || !userRole.roleName) {
    return ResponseManager.error(res, "AuthorizationError", "Invalid role format", 400);
  }

  const allowedRoles = ["operator", "approval", "admin", "superAdmin"];
  if (!allowedRoles.includes(userRole.roleName)) {
    return ResponseManager.error(res, "AuthorizationError", "Operator access required", 403);
  }

  next();
}

// Dynamic role check - accepts role names as arguments
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

// Check if user has specific permission
export function requiresPermission(...requiredPermissions) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
    }

    const userRole = user.role;
    if (!userRole) {
      return ResponseManager.error(res, "AuthorizationError", "Invalid role", 400);
    }

    // SuperAdmin has all permissions
    if (userRole.permissions && userRole.permissions.includes("*")) {
      return next();
    }

    const userPermissions = userRole.permissions || [];
    const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm));

    if (!hasPermission) {
      return ResponseManager.error(
        res,
        "AuthorizationError",
        `Permission denied. Required: ${requiredPermissions.join(" or ")}`,
        403
      );
    }

    next();
  };
}

// Check minimum role level
export function requiresMinLevel(minLevel) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
    }

    const userRole = user.role;
    if (!userRole || userRole.level === undefined) {
      return ResponseManager.error(res, "AuthorizationError", "Invalid role", 400);
    }

    if (userRole.level < minLevel) {
      return ResponseManager.error(res, "AuthorizationError", "Insufficient access level", 403);
    }

    next();
  };
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