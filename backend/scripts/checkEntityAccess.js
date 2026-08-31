// Read-only diagnostic. Company scope is decided by rows in
// packing_check_user_companies, not by the role name, so a corporateAdmin that is
// missing a row simply cannot see that entity. This prints the rows a user
// actually has, and where a document number lives, so an empty search result or a
// membership 403 can be traced back to the data.
//
//   node scripts/checkEntityAccess.js <email|userId> [documentNumber]

import { connectDB, sequelize } from "../config/database.js";
import { User, Role, Company, Checklist } from "../models/index.js";

const [identifier, documentNumber] = process.argv.slice(2);

if (!identifier) {
  console.error("Usage: node scripts/checkEntityAccess.js <email|userId> [documentNumber]");
  process.exit(1);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function main() {
  await connectDB();

  const user = await User.findOne({
    where: UUID_REGEX.test(identifier)
      ? { userId: identifier }
      : { email: identifier.toLowerCase().trim() },
    include: [
      { model: Role, as: "role", attributes: ["roleName", "isAdmin"] },
      { model: Company, as: "company", attributes: ["companyId", "companyName"] },
      {
        model: Company,
        as: "companies",
        attributes: ["companyId", "companyName"],
        through: { attributes: [] },
      },
    ],
    paranoid: false,
  });

  if (!user) {
    console.error(`No user matched "${identifier}"`);
    return;
  }

  console.log(`\nUser    : ${user.email} (${user.userId})`);
  console.log(`Role    : ${user.role?.roleName ?? "none"}`);
  console.log(`Active  : ${user.company?.companyName ?? "none"} (${user.companyId ?? "-"})`);

  const memberships = user.companies ?? [];
  console.log(`\nEntities this user can reach (${memberships.length}):`);
  for (const c of memberships) console.log(`  - ${c.companyName} (${c.companyId})`);
  if (memberships.length === 0) {
    console.log("  (none — every company-scoped read and write returns empty or 403)");
  }

  const allCompanies = await Company.findAll({
    attributes: ["companyId", "companyName"],
    order: [["companyName", "ASC"]],
  });
  const unreachable = allCompanies.filter(
    (c) => !memberships.some((m) => m.companyId === c.companyId),
  );
  console.log(`\nEntities this user cannot reach (${unreachable.length}):`);
  for (const c of unreachable) console.log(`  - ${c.companyName} (${c.companyId})`);

  if (!documentNumber) return;

  const checklists = await Checklist.findAll({
    where: { documentNumber },
    include: [{ model: Company, as: "company", attributes: ["companyId", "companyName"] }],
    paranoid: false,
  });

  console.log(`\nChecklists with documentNumber "${documentNumber}" (${checklists.length}):`);
  for (const c of checklists) {
    const reachable = memberships.some((m) => m.companyId === c.companyId);
    console.log(`  - ${c.title} (${c.checklistId})`);
    console.log(`      entity  : ${c.company?.companyName ?? "unknown"} (${c.companyId})`);
    console.log(`      deleted : ${c.deletedAt ? c.deletedAt.toISOString() : "no"}`);
    console.log(`      in search results for this user: ${reachable && !c.deletedAt ? "yes" : "no"}`);
  }
  if (checklists.length === 0) {
    console.log("  (none — that document number does not exist in any entity)");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
