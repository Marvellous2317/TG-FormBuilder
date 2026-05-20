import { Department } from "../models/index.js";
import { connectDB, sequelize } from "../config/database.js";
import { fileURLToPath } from "url";
import path from "path";

const DEFAULT_DEPARTMENTS = [
  { departmentName: "Accounting" },
  { departmentName: "Administration" },
  { departmentName: "Asset" },
  { departmentName: "Business Development" },
  { departmentName: "Compliance" },
  { departmentName: "Customer Service" },
  { departmentName: "EHS (Environment, Health & Safety)" },
  { departmentName: "Engineering (Civil)" },
  { departmentName: "Engineering (Electrical)" },
  { departmentName: "Engineering (Mechanical)" },
  { departmentName: "Facilities Management" },
  { departmentName: "Finance" },
  { departmentName: "HSE (Health, Safety & Environment)" },
  { departmentName: "Human Resources (HR)" },
  { departmentName: "IT / Infrastructure" },
  { departmentName: "Learning & Development" },
  { departmentName: "Legal" },
  { departmentName: "Logistics" },
  { departmentName: "Maintenance" },
  { departmentName: "Manufacturing" },
  { departmentName: "Marketing" },
  { departmentName: "Operations" },
  { departmentName: "Packaging Operations" },
  { departmentName: "Plant Operations" },
  { departmentName: "Procurement / Sourcing" },
  { departmentName: "Production" },
  { departmentName: "Project Management" },
  { departmentName: "Projects" },
  { departmentName: "Quality Assurance (QA)" },
  { departmentName: "Quality Control (QC)" },
  { departmentName: "Research & Development (R&D)" },
  { departmentName: "Sales" },
  { departmentName: "Security" },
  { departmentName: "Supply Chain Management" },
  { departmentName: "Sustainability" },
  { departmentName: "Treasury" },
  { departmentName: "Utility" },
  { departmentName: "Warehouse" },
];

export async function seedDepartments() {
  try {
    console.log("Starting department seeding...");
    console.log("Number of departments to seed:", DEFAULT_DEPARTMENTS.length);
    
    let created = 0;
    let skipped = 0;

    for (const deptData of DEFAULT_DEPARTMENTS) {
      const [department, wasCreated] = await Department.findOrCreate({
        where: { departmentName: deptData.departmentName },
        defaults: deptData,
      });

      if (wasCreated) {
        console.log(`  ✓ Created department: ${department.departmentName}`);
        created++;
      } else {
        console.log(`  - Skipped department: ${department.departmentName} (already exists)`);
        skipped++;
      }
    }

    console.log(`\nDepartment seeding complete: ${created} created, ${skipped} skipped`);
    return { created, skipped };
  } catch (error) {
    console.error("Error seeding departments:", error);
    throw error;
  }
}

export async function listDepartments() {
  try {
    const departments = await Department.findAll({
      order: [["departmentName", "ASC"]],
    });
    console.log("\nCurrent departments in database:");
    departments.forEach((dept) => {
      console.log(`  - ${dept.departmentName}`);
    });
    return departments;
  } catch (error) {
    console.error("Error listing departments:", error);
    throw error;
  }
}

// Run as standalone script
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  const command = process.argv[2] || "seed";

  (async () => {
    try {
      await connectDB();
      console.log("Database connected successfully\n");

      switch (command) {
        case "seed":
          await seedDepartments();
          break;
        case "list":
          await listDepartments();
          break;
        default:
          console.log("Usage: node departments.js [seed|list]");
          console.log("  seed - Seed departments into the database");
          console.log("  list - List all departments");
      }
    } catch (error) {
      console.error("Script failed:", error);
      process.exit(1);
    } finally {
      await sequelize.close();
      console.log("\nDatabase connection closed");
    }
  })();
}
