import { User, Role } from "../models/index.js";
import { connectDB, sequelize } from "../config/database.js";
import config from "../appConfig.js";
import { seedRoles } from "./roles.js";
import { fileURLToPath } from "url";
import path from "path";


export async function seedSuperAdmin() {
  try {
    await seedRoles();
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

    const defaultPassword = config.user_default_password;
    const superAdmin = User.build({
      email: "dev.team@tolaram.com",
      firstName: "Super",
      lastName: "Admin",
      roleId: superAdminRole.roleId,
      status: "active",
      isVerifyEmail: true,
      newLogin: true,
    });

    await superAdmin.setPassword(defaultPassword);
    await superAdmin.save();

    console.log("SuperAdmin user created successfully.");

  } catch (error) {
    console.error("Error seeding superAdmin:", error);
    throw error;
  }
}


const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMainModule) {
  (async () => {
    try {
      console.log("Connecting to database...");
      await connectDB();
      
      console.log("Syncing models...");
      await sequelize.sync();
      
      console.log("Seeding super admin...");
      await seedSuperAdmin();
      
      console.log("\nDone!");
      process.exit(0);
    } catch (err) {
      console.error("Seeder failed:", err);
      process.exit(1);
    }
  })();
}