'use strict';

const { getSchema } = require('./utils/helpers.cjs');

/**
 * Data backfill: align stale approval rows with their rejected submissions.
 *
 * Before the reject flow marked sibling rows, rejecting a submission only
 * updated the rejecting approver's row, leaving every other approver's row at
 * 'pending'. Those submissions then vanished from the other approvers' history
 * (history reads rows whose own status is approved/rejected). This sets the
 * remaining 'pending' rows of already-rejected submissions to 'rejected' so the
 * submissions show up in every involved approver's history.
 *
 * Prior 'approved' rows are left untouched (audit trail). Idempotent.
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const schema = getSchema();
    await queryInterface.sequelize.query(
      `UPDATE "${schema}"."submitted_checklist_approvals" a
          SET status = 'rejected',
              "decidedAt" = COALESCE(a."decidedAt", s."updatedAt"),
              "updatedAt" = CURRENT_TIMESTAMP
         FROM "${schema}"."submitted_checklists" s
        WHERE a."submittedChecklistId" = s."submittedChecklistId"
          AND s.status = 'rejected'
          AND a.status = 'pending';`
    );
  },

  // Irreversible data backfill: the original 'pending' state of each affected
  // row is not recoverable, so down is intentionally a no-op.
  async down() {},
};
