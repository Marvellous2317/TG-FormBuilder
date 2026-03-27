import { User, State } from "./user.js";
import { Company } from "./company.js";
import { Verification } from "./verification.js";
import { Role, DEFAULT_ROLES } from "./role.js";
import { makePassword, checkPassword } from "../api/auth/helper.js";

// ============= Model Associations =============

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























export { User, State, Company, Verification, Role, DEFAULT_ROLES };
