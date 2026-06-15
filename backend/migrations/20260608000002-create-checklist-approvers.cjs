'use strict';

const { getSchema } = require('./utils/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: 'checklist_approvers', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        checklistId: {
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
        companyId: {
          type: Sequelize.UUID,
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
      { tableName: 'checklist_approvers', schema },
      {
        fields: ['checklistId', 'approverId'],
        unique: true,
        name: 'checklist_approvers_checklist_approver_unique',
      }
    );
    await queryInterface.addIndex(
      { tableName: 'checklist_approvers', schema },
      {
        fields: ['checklistId'],
        name: 'checklist_approvers_checklist_idx',
      }
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.dropTable({ tableName: 'checklist_approvers', schema });
  },
};
