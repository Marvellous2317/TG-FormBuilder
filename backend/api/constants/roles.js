export const ROLE_OPERATOR = "operator";
export const ROLE_APPROVAL = "approval";
export const ROLE_ADMIN = "admin";
export const ROLE_SUPER_ADMIN = "superAdmin";
export const ROLE_CORPORATE_ADMIN = "corporateAdmin";

// Roles allowed to hold more than one company membership.
export const MULTI_COMPANY_ROLES = [ROLE_CORPORATE_ADMIN, ROLE_SUPER_ADMIN];

// corporateAdmin is an admin that spans companies: anywhere "admin" is granted
// access, corporateAdmin gets the same. Use these lists instead of literals so a
// new admin-type role only has to be added in one place.
export const ADMIN_ROLES = [ROLE_ADMIN, ROLE_CORPORATE_ADMIN];
export const ADMIN_ROLES_WITH_SUPER = [...ADMIN_ROLES, ROLE_SUPER_ADMIN];
export const APPROVAL_ROLES = [ROLE_APPROVAL, ...ADMIN_ROLES_WITH_SUPER];
export const OPERATOR_ROLES = [ROLE_OPERATOR, ...APPROVAL_ROLES];

export const isAdminRole = (roleName) => ADMIN_ROLES.includes(roleName);
