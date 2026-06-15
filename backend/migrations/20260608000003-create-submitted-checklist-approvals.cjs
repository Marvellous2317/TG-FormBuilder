'use strict';

const { getSchema } = require('./utils/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: 'submitted_checklist_approvals', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        submittedChecklistId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        approverId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        step: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
        },
        decidedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }
    );

    await queryInterface.addIndex(
      { tableName: 'submitted_checklist_approvals', schema },
      {
        fields: ['submittedChecklistId'],
        name: 'submitted_checklist_approvals_submission_idx',
      }
    );
    await queryInterface.addIndex(
      { tableName: 'submitted_checklist_approvals', schema },
      {
        fields: ['submittedChecklistId', 'approverId'],
        unique: true,
        name: 'submitted_checklist_approvals_submission_approver_unique',
      }
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.dropTable({ tableName: 'submitted_checklist_approvals', schema });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS ${schema}.enum_submitted_checklist_approvals_status`
    );
  },
};
