'use strict';

const { getSchema } = require('./utils/helpers.cjs');

/**
 * Add an `active` flag to checklist_assignments.
 *
 * Unassigning an operator used to hard-delete the assignment, which fired the
 * ON DELETE CASCADE on submitted_checklists.assignmentId and permanently wiped
 * every submission made under it (and their entries). Going forward, unassign
 * flips `active` to false instead of deleting, so the row — and all linked
 * submissions/history — are preserved and stay visible. Reassigning flips it back.
 *
 * Added NOT NULL with a default of true so every existing assignment is treated
 * as active. Idempotent.
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    const table = { tableName: 'checklist_assignments', schema };

    const columns = await queryInterface.describeTable(table);
    if (!columns.active) {
      await queryInterface.addColumn(table, 'active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.removeColumn(
      { tableName: 'checklist_assignments', schema },
      'active'
    );
  },
};
