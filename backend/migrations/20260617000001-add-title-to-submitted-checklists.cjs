'use strict';

const { getSchema } = require('./utils/helpers.cjs');

/**
 * Add a snapshot `title` to submitted_checklists.
 *
 * A submission is a point-in-time snapshot of a checklist, but it only captured
 * the documentNumber — not the title. This adds the column, backfills it from
 * the originating checklist (via the assignment), and then enforces NOT NULL.
 *
 * The column is added nullable first so the backfill can run; any submission
 * whose checklist can no longer be resolved (e.g. hard-deleted) falls back to
 * its documentNumber so the NOT NULL constraint can be applied. Idempotent.
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    const table = { tableName: 'submitted_checklists', schema };

    const columns = await queryInterface.describeTable(table);
    if (!columns.title) {
      await queryInterface.addColumn(table, 'title', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    // Backfill from the originating checklist via the assignment.
    await queryInterface.sequelize.query(
      `UPDATE "${schema}"."submitted_checklists" sc
          SET title = c.title
         FROM "${schema}"."checklist_assignments" ca
         JOIN "${schema}"."checklists" c
           ON c."checklistId" = ca."checklistId"
        WHERE sc."assignmentId" = ca."assignmentId"
          AND sc.title IS NULL;`
    );

    // Fallback for any rows whose checklist could not be resolved.
    await queryInterface.sequelize.query(
      `UPDATE "${schema}"."submitted_checklists"
          SET title = "documentNumber"
        WHERE title IS NULL;`
    );

    await queryInterface.changeColumn(table, 'title', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.removeColumn(
      { tableName: 'submitted_checklists', schema },
      'title'
    );
  },
};
