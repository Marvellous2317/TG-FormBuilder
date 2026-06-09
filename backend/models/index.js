import { User } from "./user.js";
import { Company } from "./company.js";
import { Department } from "./department.js";
import { Verification } from "./verification.js";
import { RefreshToken } from "./refreshToken.js";
import { Role } from "./role.js";
import { makePassword, checkPassword } from "../api/auth/helper.js";

import { Checklist } from "./checklist.js";
import { ChecklistEntry } from "./checklistEntry.js";
import { ChecklistAssignment } from "./checklistAssignment.js";
import { SubmittedChecklist } from "./submittedChecklist.js";
import { SubmittedChecklistEntry } from "./submittedChecklistEntry.js";
// LEGACY: OperatorApprover (operator_approvers table) replaced by the per-checklist approver flow.
// import { OperatorApprover } from "./operatorApprover.js";
import { ChecklistApprover } from "./checklistApprover.js";
import { SubmittedChecklistApproval } from "./submittedChecklistApproval.js";
import { Catalog } from "./catalog.js";
import { VersionChecklist } from "./versionChecklist.js";
import { VersionChecklistEntry } from "./versionChecklistEntry.js";


User.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Company.hasMany(User, { foreignKey: "companyId", as: "users" });

User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

// LEGACY: global operator-approver mapping. Replaced by the per-checklist approver flow.
// User.belongsToMany(User, { through: OperatorApprover, foreignKey: "operatorId", otherKey: "approverId", as: "approvers" });
// User.belongsToMany(User, { through: OperatorApprover, foreignKey: "approverId", otherKey: "operatorId", as: "operators" });

// OperatorApprover.belongsTo(User, { foreignKey: "operatorId", as: "operator" });
// OperatorApprover.belongsTo(User, { foreignKey: "approverId", as: "approver" });

// User.hasMany(OperatorApprover, { foreignKey: "operatorId", as: "operatorApprovers" });

Verification.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Verification, { foreignKey: "userId", as: "verifications" });

RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });

User.prototype.setPassword = async function (password) {
  this.password = await makePassword(password);
};
User.prototype.checkPassword = async function (password) {
  return checkPassword(password, this.password);
};
User.prototype.toSafeJSON = function () {
  const values = this.toJSON();
  delete values.password;
  return values;
};



// ==================== CHECKLIST (Master Data) ====================

Checklist.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Company.hasMany(Checklist, { foreignKey: "companyId", as: "checklists" });

Checklist.belongsTo(Department, { foreignKey: "departmentId", as: "department" });
Department.hasMany(Checklist, { foreignKey: "departmentId", as: "checklists" });

Checklist.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// Checklist has many Entries (dynamic fields)
Checklist.hasMany(ChecklistEntry, { foreignKey: "checklistId", as: "entries" });
ChecklistEntry.belongsTo(Checklist, { foreignKey: "checklistId", as: "checklist" });

// ==================== CHECKLIST APPROVERS (per-checklist approver config) ====================

Checklist.hasMany(ChecklistApprover, { foreignKey: "checklistId", as: "approverConfigs" });
ChecklistApprover.belongsTo(Checklist, { foreignKey: "checklistId", as: "checklist" });
ChecklistApprover.belongsTo(User, { foreignKey: "approverId", as: "approver" });
User.hasMany(ChecklistApprover, { foreignKey: "approverId", as: "checklistApprovals" });

// ==================== ASSIGNMENT ====================

ChecklistAssignment.belongsTo(Checklist, { foreignKey: "checklistId", as: "checklist" });
Checklist.hasMany(ChecklistAssignment, { foreignKey: "checklistId", as: "assignments" });

ChecklistAssignment.belongsTo(Company, { foreignKey: "companyId", as: "company" });

ChecklistAssignment.belongsTo(User, { foreignKey: "assignedTo", as: "operator" });
ChecklistAssignment.belongsTo(User, { foreignKey: "assignedBy", as: "assigner" });

User.hasMany(ChecklistAssignment, { foreignKey: "assignedTo", as: "myAssignments" });

// ==================== SUBMITTED CHECKLIST ====================

ChecklistAssignment.hasMany(SubmittedChecklist, { foreignKey: "assignmentId", as: "submissions" });
SubmittedChecklist.belongsTo(ChecklistAssignment, { foreignKey: "assignmentId", as: "assignment" });

SubmittedChecklist.belongsTo(Company, { foreignKey: "companyId", as: "company" });
SubmittedChecklist.belongsTo(User, { foreignKey: "submittedBy", as: "submitter" });
SubmittedChecklist.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });
SubmittedChecklist.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });

User.hasMany(SubmittedChecklist, { foreignKey: "submittedBy", as: "submittedChecklists" });

// ==================== SUBMITTED CHECKLIST ENTRIES ====================

SubmittedChecklist.hasMany(SubmittedChecklistEntry, { foreignKey: "submittedChecklistId", as: "entries" });
SubmittedChecklistEntry.belongsTo(SubmittedChecklist, { foreignKey: "submittedChecklistId", as: "submittedChecklist" });

// ==================== SUBMITTED CHECKLIST APPROVALS (per-submission steps) ====================

SubmittedChecklist.hasMany(SubmittedChecklistApproval, { foreignKey: "submittedChecklistId", as: "approvals" });
SubmittedChecklistApproval.belongsTo(SubmittedChecklist, { foreignKey: "submittedChecklistId", as: "submittedChecklist" });
SubmittedChecklistApproval.belongsTo(User, { foreignKey: "approverId", as: "approver" });
User.hasMany(SubmittedChecklistApproval, { foreignKey: "approverId", as: "submittedChecklistApprovals" });

// ==================== CATALOG ====================

Catalog.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Company.hasMany(Catalog, { foreignKey: "companyId", as: "catalogs" });

Catalog.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Catalog.belongsTo(User, { foreignKey: "updatedBy", as: "updater" });

// ==================== CHECKLIST VERSIONS (read-only snapshots) ====================

Checklist.hasMany(VersionChecklist, { foreignKey: "checklistId", as: "versions" });
VersionChecklist.belongsTo(Checklist, { foreignKey: "checklistId", as: "checklist" });

VersionChecklist.belongsTo(Company, { foreignKey: "companyId", as: "company" });
VersionChecklist.belongsTo(Department, { foreignKey: "departmentId", as: "department" });
VersionChecklist.belongsTo(User, { foreignKey: "versionedBy", as: "versioner" });

VersionChecklist.hasMany(VersionChecklistEntry, { foreignKey: "versionChecklistId", as: "entries" });
VersionChecklistEntry.belongsTo(VersionChecklist, { foreignKey: "versionChecklistId", as: "versionChecklist" });

export {
  User,
  Company,
  Department,
  Verification,
  RefreshToken,
  Role,
  // LEGACY: OperatorApprover replaced by the per-checklist approver flow.
  // OperatorApprover,
  ChecklistApprover,
  Checklist,
  ChecklistEntry,
  ChecklistAssignment,
  SubmittedChecklist,
  SubmittedChecklistEntry,
  SubmittedChecklistApproval,
  Catalog,
  VersionChecklist,
  VersionChecklistEntry,
};
