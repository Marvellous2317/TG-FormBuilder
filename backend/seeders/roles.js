import { Role} from "../models/index.js";
import { connectDB, sequelize } from "../config/database.js";
import { fileURLToPath } from "url";
import path from "path";


 const DEFAULT_ROLES = [
  {
    roleName: "operator",
    description: "Basic operator with limited access",


  },
  {
    roleName: "approval",
    description: "Can approve/reject records and requests",
   
  },
  {
    roleName: "admin",
    description: "Administrator with management access",
 
  },
  {
    roleName: "superAdmin",
    description: "Super Administrator with full access",

  },
];

export async function seedRoles() {
  try {
    console.log("Starting role seeding...");
    console.log("DEFAULT_ROLES:", JSON.stringify(DEFAULT_ROLES, null, 2));
    console.log("Number of roles to seed:", DEFAULT_ROLES?.length || 0);
    
    if (!DEFAULT_ROLES || DEFAULT_ROLES.length === 0) {
      console.log("WARNING: No roles defined in DEFAULT_ROLES!");
      return { created: 0, skipped: 0 };
    }
    
    let created = 0;
    let skipped = 0;

    for (const roleData of DEFAULT_ROLES) {
      console.log(`Processing role: ${roleData.roleName}`);
      const [role, wasCreated] = await Role.findOrCreate({
        where: { roleName: roleData.roleName },
        defaults: roleData,
      });

      if (wasCreated) {
        console.log(`  ✓ Created role: ${role.roleName}`);
        created++;
      } else {
        console.log(`  - Skipped role: ${role.roleName} (already exists)`);
        skipped++;
      }
    }

    console.log(`\nRole seeding complete: ${created} created, ${skipped} skipped`);
    return { created, skipped };
  } catch (error) {
    console.error("Error seeding roles:", error);
    throw error;
  }
}


export async function updateRoles() {
  try {
    console.log("Updating existing roles...");
    
    let updated = 0;

    for (const roleData of DEFAULT_ROLES) {
      const [affectedCount] = await Role.update(
        {
          description: roleData.description,

        },
        { where: { roleName: roleData.roleName } }
      );

      if (affectedCount > 0) {
        console.log(`  ✓ Updated role: ${roleData.roleName}`);
        updated++;
      }
    }

    console.log(`\nRole update complete: ${updated} updated`);
    return { updated };
  } catch (error) {
    console.error("Error updating roles:", error);
    throw error;
  }
}


export async function listRoles() {
  try {
    const roles = await Role.findAll({
      order: [["level", "ASC"]],
    });

    console.log("\nCurrent roles in database:");
    console.log("─".repeat(80));
    
    for (const role of roles) {
      console.log(`\n  ${role.roleName} (Level: ${role.level})`);
      console.log(`    Description: ${role.description}`);
      console.log(`    Permissions: ${JSON.stringify(role.permissions)}`);
      console.log(`    Active: ${role.isActive}`);
    }
    
    console.log("\n" + "─".repeat(80));
    console.log(`Total: ${roles.length} roles`);
    
    return roles;
  } catch (error) {
    console.error("Error listing roles:", error);
    throw error;
  }
}




const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const command = process.argv[2] || "seed";

  (async () => {
    try {
      console.log("Connecting to database...");
      await connectDB();
      
      console.log("Syncing models...");
      await sequelize.sync();
      
      console.log(`Running command: ${command}\n`);

      switch (command) {
        case "seed":
          await seedRoles();
          break;
        case "update":
          await updateRoles();
          break;
        case "list":
          await listRoles();
          break;
        case "all":
          await seedRoles();
          await listRoles();
          break;
        default:
          console.log("Usage: node seeders/roles.js [seed|update|list|all]");
          console.log("  seed   - Create default roles (skip if exists)");
          console.log("  update - Update existing roles with new permissions");
          console.log("  list   - List all roles in database");
          console.log("  all    - Seed and then list all roles");
      }

      console.log("\nDone!");
      process.exit(0);
    } catch (error) {
      console.error("Seeder failed:", error);
      process.exit(1);
    }
  })();
}
