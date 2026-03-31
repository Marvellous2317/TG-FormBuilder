import { User, } from "./user.js";
import { Company } from "./company.js";
import { Verification } from "./verification.js";
import { Role, DEFAULT_ROLES } from "./role.js";
import { makePassword, checkPassword } from "../api/auth/helper.js";

 
import { ChecklistTemplate } from "./checklistTemplate.js";
import { ChecklistSection } from "./checklistSection.js";
import { ChecklistField } from "./checklistField.js";
import { ChecklistAssignment } from "./checklistAssignment.js";
import { ChecklistSubmission } from "./checklistSubmission.js";
import { ChecklistResponse } from "./checklistResponse.js";
import { ChecklistDraft } from "./checklistDraft.js";




 
// User belongs to Company
User.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
});

Company.hasMany(User, {
  foreignKey: "companyId",
  as: "users",
});

// User belongs to Role
User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
});

// Verification belongs to User
Verification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Verification, {
  foreignKey: "userId",
  as: "verifications",
});


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

 

// ChecklistTemplate belongs to Company (multi-tenancy)
ChecklistTemplate.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
});

Company.hasMany(ChecklistTemplate, {
  foreignKey: "companyId",
  as: "templates",
});

// ChecklistTemplate created by User
ChecklistTemplate.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

// ChecklistTemplate has many Sections
ChecklistTemplate.hasMany(ChecklistSection, {
  foreignKey: "templateId",
  as: "sections",
});

ChecklistSection.belongsTo(ChecklistTemplate, {
  foreignKey: "templateId",
  as: "template",
});

// ChecklistSection has many Fields
ChecklistSection.hasMany(ChecklistField, {
  foreignKey: "sectionId",
  as: "fields",
});

ChecklistField.belongsTo(ChecklistSection, {
  foreignKey: "sectionId",
  as: "section",
});

// ChecklistAssignment belongs to Template
ChecklistAssignment.belongsTo(ChecklistTemplate, {
  foreignKey: "templateId",
  as: "template",
});

ChecklistTemplate.hasMany(ChecklistAssignment, {
  foreignKey: "templateId",
  as: "assignments",
});

// ChecklistAssignment belongs to Company
ChecklistAssignment.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
});

// ChecklistAssignment - User relationships
ChecklistAssignment.belongsTo(User, {
  foreignKey: "assignedTo",
  as: "assignee",
});

ChecklistAssignment.belongsTo(User, {
  foreignKey: "assignedBy",
  as: "assigner",
});

ChecklistAssignment.belongsTo(User, {
  foreignKey: "approverId",
  as: "approver",
});

User.hasMany(ChecklistAssignment, {
  foreignKey: "assignedTo",
  as: "checklistAssignments",
});

User.hasMany(ChecklistAssignment, {
  foreignKey: "approverId",
  as: "assignmentsToApprove",
});

// ChecklistAssignment has many Submissions
ChecklistAssignment.hasMany(ChecklistSubmission, {
  foreignKey: "assignmentId",
  as: "submissions",
});

ChecklistSubmission.belongsTo(ChecklistAssignment, {
  foreignKey: "assignmentId",
  as: "assignment",
});

// ChecklistSubmission belongs to Company
ChecklistSubmission.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
});

// ChecklistSubmission - User relationships
ChecklistSubmission.belongsTo(User, {
  foreignKey: "submittedBy",
  as: "submitter",
});

ChecklistSubmission.belongsTo(User, {
  foreignKey: "reviewedBy",
  as: "reviewer",
});

User.hasMany(ChecklistSubmission, {
  foreignKey: "submittedBy",
  as: "checklistSubmissions",
});

User.hasMany(ChecklistSubmission, {
  foreignKey: "reviewedBy",
  as: "reviewedSubmissions",
});

// ChecklistSubmission has many Responses
ChecklistSubmission.hasMany(ChecklistResponse, {
  foreignKey: "submissionId",
  as: "responses",
});

ChecklistResponse.belongsTo(ChecklistSubmission, {
  foreignKey: "submissionId",
  as: "submission",
});


ChecklistResponse.belongsTo(ChecklistField, {
  foreignKey: "fieldId",
  as: "field",
});

// ChecklistSubmission has one Draft
ChecklistSubmission.hasOne(ChecklistDraft, {
  foreignKey: "submissionId",
  as: "draft",
});

ChecklistDraft.belongsTo(ChecklistSubmission, {
  foreignKey: "submissionId",
  as: "submission",
});

ChecklistDraft.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});


export async function seedDefaultRoles() {
  try {
    for (const roleData of DEFAULT_ROLES) {
      await Role.findOrCreate({
        where: { roleName: roleData.roleName },
        defaults: roleData,
      });
    }
    console.log("Default roles seeded successfully");
  } catch (error) {
    console.error("Error seeding default roles:", error);
  }
}























export { 
  User, 
  Company, 
  Verification, 
  Role,
  DEFAULT_ROLES,
  ChecklistTemplate,
  ChecklistSection,
  ChecklistField,
  ChecklistAssignment,
  ChecklistSubmission,
  ChecklistResponse,
  ChecklistDraft,

};
