import { User, Role, seedDefaultRoles } from "../models/model.js";
import { connectDB, sequelize } from "../config/database.js";
import config from "../appConfig.js";

/**
 * Seeds a default superAdmin user if one doesn't exist.
 * Run this once after setting up the database.
 */
export async function seedSuperAdmin() {
  try {
    // First ensure default roles exist
    await seedDefaultRoles();

    // Check if superAdmin user already exists
    const superAdminRole = await Role.findOne({ where: { roleName: "superAdmin" } });
    if (!superAdminRole) {
      console.log("SuperAdmin role not found. Please run role seeder first.");
      return;
    }

    const existingSuperAdmin = await User.findOne({
      where: { roleId: superAdminRole.roleId },
    });

    if (existingSuperAdmin) {
      console.log("SuperAdmin user already exists.");
      return;
    }

    // Create default superAdmin
    const defaultPassword = config.user_default_password || "SuperAdmin123!";
    const superAdmin = User.build({
      email: "superadmin@example.com",
      firstName: "Super",
      lastName: "Admin",
      roleId: superAdminRole.roleId,
      status: "active",
      isVerifyEmail: true,
      newLogin: true, // Force password change on first login
    });

    await superAdmin.setPassword(defaultPassword);
    await superAdmin.save();

    console.log("SuperAdmin user created successfully.");
    console.log("Email: superadmin@example.com");
    console.log("Default Password:", defaultPassword);
    console.log("NOTE: Please change the password on first login!");
  } catch (error) {
    console.error("Error seeding superAdmin:", error);
    throw error;
  }
}

// Run seeder if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  (async () => {
    await connectDB();
    await sequelize.sync();
    await seedSuperAdmin();
    process.exit(0);
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}