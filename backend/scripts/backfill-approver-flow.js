/**
 * Backfill script: migrate the legacy approval flow to the per-checklist
 * multi-step approver system so no existing data is lost.
 *
 * What it does (idempotent - safe to re-run):
 *   1. For each checklist that has NO new-style approver config yet, derive its
 *      approvers from the legacy `operator_approvers` links of its assigned
 *      operators, create `checklist_approvers` rows (ordered by link createdAt),
 *      and set `approvalMode` to BACKFILL_APPROVAL_MODE.
 *   2. For each submission without snapshot rows, create `submitted_checklist_approvals`:
 *        - terminal (approved/rejected): rows reflecting the recorded outcome
 *          (the recorded approvedBy as the decider; the rest set to the same
 *          terminal status) so history/aggregation stay consistent.
 *        - pending: the full approver chain snapshotted as `pending`.
 *
 * CAVEAT: The legacy flow was single-approval (first approver wins), which has
 * no exact equivalent in the new modes. Backfilled checklists default to
 * 'parallel' (ALL must approve); admins can switch any checklist to
 * 'sequential' afterward. Pending submissions migrated to 'parallel' may now
 * require additional approvals that the legacy flow did not.
 *
 * Usage:
 *   node scripts/backfill-approver-flow.js            # apply changes
 *   node scripts/backfill-approver-flow.js --dry-run  # report only, no writes
 */

import { fileURLToPath } from "url";
import path from "path";
import { QueryTypes } from "sequelize";
import { connectDB, sequelize } from "../config/database.js";
import {
  Checklist,
  ChecklistAssignment,
  ChecklistApprover,
  SubmittedChecklist,
  SubmittedChecklistApproval,
} from "../models/index.js";

// The legacy `operator_approvers` model has been retired from the app, so this
// one-time migration reads the legacy table directly via raw SQL.
async function getLegacyApproverLinks(operatorIds) {
  if (!operatorIds.length) return [];
  return sequelize.query(
    `SELECT "approverId", "createdAt"
       FROM operator_approvers
      WHERE "operatorId" IN (:operatorIds)
      ORDER BY "createdAt" ASC`,
    { replacements: { operatorIds }, type: QueryTypes.SELECT },
  );
}

const BACKFILL_APPROVAL_MODE = "parallel";
const TERMINAL_STATUSES = ["approved", "rejected"];

async function backfillChecklistApprovers(dryRun, stats) {
  const checklists = await Checklist.findAll({ paranoid: false });

  for (const checklist of checklists) {
    const existing = await ChecklistApprover.count({
      where: { checklistId: checklist.checklistId },
    });
    if (existing > 0) {
      stats.checklistsSkipped += 1;
      continue;
    }

    const assignments = await ChecklistAssignment.findAll({
      where: { checklistId: checklist.checklistId },
      attributes: ["assignedTo"],
      paranoid: false,
    });
    const operatorIds = [...new Set(assignments.map((a) => a.assignedTo))];
    if (operatorIds.length === 0) {
      stats.checklistsNoOperators += 1;
      continue;
    }

    const links = await getLegacyApproverLinks(operatorIds);

    const seen = new Set();
    const orderedApproverIds = [];
    for (const link of links) {
      if (seen.has(link.approverId)) continue;
      seen.add(link.approverId);
      orderedApproverIds.push(link.approverId);
    }

    if (orderedApproverIds.length === 0) {
      stats.checklistsNoApprovers += 1;
      continue;
    }

    const rows = orderedApproverIds.map((approverId, index) => ({
      checklistId: checklist.checklistId,
      approverId,
      step: index,
      companyId: checklist.companyId || null,
    }));

    if (!dryRun) {
      await sequelize.transaction(async (transaction) => {
        await ChecklistApprover.bulkCreate(rows, { transaction });
        checklist.approvalMode = BACKFILL_APPROVAL_MODE;
        await checklist.save({ transaction });
      });
    }

    stats.checklistsMigrated += 1;
    stats.approverRowsCreated += rows.length;
  }
}

async function getChainForChecklist(checklistId, cache) {
  if (cache.has(checklistId)) return cache.get(checklistId);
  const approverConfigs = await ChecklistApprover.findAll({
    where: { checklistId },
    order: [["step", "ASC"], ["createdAt", "ASC"]],
    attributes: ["approverId", "step"],
  });
  const chain = approverConfigs.map((c) => ({ approverId: c.approverId, step: c.step }));
  cache.set(checklistId, chain);
  return chain;
}

async function backfillSubmissionApprovals(dryRun, stats) {
  const chainCache = new Map();

  const submissions = await SubmittedChecklist.findAll({
    where: { status: ["pending", ...TERMINAL_STATUSES] },
    include: [
      { model: ChecklistAssignment, as: "assignment", attributes: ["checklistId"], paranoid: false },
    ],
    paranoid: false,
  });

  for (const submission of submissions) {
    const existing = await SubmittedChecklistApproval.count({
      where: { submittedChecklistId: submission.submittedChecklistId },
    });
    if (existing > 0) {
      stats.submissionsSkipped += 1;
      continue;
    }

    const checklistId = submission.assignment?.checklistId;
    if (!checklistId) {
      stats.submissionsNoChecklist += 1;
      continue;
    }

    const chain = await getChainForChecklist(checklistId, chainCache);

    const isTerminal = TERMINAL_STATUSES.includes(submission.status);

    const approverEntries = chain.map((c) => ({ approverId: c.approverId, step: c.step }));
    if (isTerminal && submission.approvedBy && !approverEntries.some((e) => e.approverId === submission.approvedBy)) {
      approverEntries.push({ approverId: submission.approvedBy, step: approverEntries.length });
    }

    if (approverEntries.length === 0) {
      stats.submissionsNoChain += 1;
      continue;
    }

    const rows = approverEntries.map((entry) => ({
      submittedChecklistId: submission.submittedChecklistId,
      approverId: entry.approverId,
      step: entry.step,
      status: isTerminal ? submission.status : "pending",
      decidedAt: isTerminal ? submission.updatedAt : null,
    }));

    if (!dryRun) {
      await SubmittedChecklistApproval.bulkCreate(rows);
    }

    stats.submissionRowsCreated += rows.length;
    if (isTerminal) stats.terminalSubmissionsMigrated += 1;
    else stats.pendingSubmissionsMigrated += 1;
  }
}

async function run() {
  const dryRun = process.argv.includes("--dry-run");

  const stats = {
    checklistsMigrated: 0,
    checklistsSkipped: 0,
    checklistsNoOperators: 0,
    checklistsNoApprovers: 0,
    approverRowsCreated: 0,
    terminalSubmissionsMigrated: 0,
    pendingSubmissionsMigrated: 0,
    submissionsSkipped: 0,
    submissionsNoChecklist: 0,
    submissionsNoChain: 0,
    submissionRowsCreated: 0,
  };

  console.log("Connecting to database...");
  await connectDB();

  console.log(`\n=== Backfill approver flow ${dryRun ? "(DRY RUN - no writes)" : ""} ===\n`);

  console.log("Step 1/2: Backfilling checklist approvers from legacy operator-approver links...");
  await backfillChecklistApprovers(dryRun, stats);

  console.log("Step 2/2: Backfilling submission approval snapshots...");
  await backfillSubmissionApprovals(dryRun, stats);

  console.log("\n=== Summary ===");
  console.log(`Checklists migrated:            ${stats.checklistsMigrated}`);
  console.log(`Checklists skipped (had config):${stats.checklistsSkipped}`);
  console.log(`Checklists w/o operators:       ${stats.checklistsNoOperators}`);
  console.log(`Checklists w/o legacy approvers:${stats.checklistsNoApprovers}`);
  console.log(`ChecklistApprover rows created: ${stats.approverRowsCreated}`);
  console.log(`Terminal submissions migrated:  ${stats.terminalSubmissionsMigrated}`);
  console.log(`Pending submissions migrated:   ${stats.pendingSubmissionsMigrated}`);
  console.log(`Submissions skipped (had rows): ${stats.submissionsSkipped}`);
  console.log(`Submissions w/o checklist:      ${stats.submissionsNoChecklist}`);
  console.log(`Submissions w/o approver chain: ${stats.submissionsNoChain}`);
  console.log(`Approval snapshot rows created: ${stats.submissionRowsCreated}`);
  console.log(`\nDone${dryRun ? " (dry run - nothing was written)" : ""}.`);
}

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMainModule) {
  run()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Backfill failed:", error);
      try {
        await sequelize.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
      process.exit(1);
    });
}

export { run };
