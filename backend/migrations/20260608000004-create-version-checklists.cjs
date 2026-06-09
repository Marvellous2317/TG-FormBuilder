'use strict';

const { getSchema } = require('./utils/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: 'version_checklists', schema },
      {
        versionChecklistId: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        checklistId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        documentNumber: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        companyId: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        departmentId: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        frequency: {
          type: Sequelize.ENUM('hourly', 'daily', 'weekly', 'monthly'),
          allowNull: true,
          defaultValue: null,
        },
        frequencyInterval: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        approvalMode: {
          type: Sequelize.ENUM('sequential', 'parallel'),
          allowNull: false,
          defaultValue: 'sequential',
        },
        createdBy: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        updatedBy: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        versionedBy: {
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
      { tableName: 'version_checklists', schema },
      {
        fields: ['checklistId', 'version'],
        unique: true,
        name: 'version_checklists_checklist_version_unique',
      }
    );
    await queryInterface.addIndex(
      { tableName: 'version_checklists', schema },
      {
        fields: ['checklistId'],
        name: 'version_checklists_checklist_idx',
      }
    );
    await queryInterface.addIndex(
      { tableName: 'version_checklists', schema },
      {
        fields: ['departmentId'],
        name: 'version_checklists_department_idx',
      }
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.dropTable({ tableName: 'version_checklists', schema });
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS ${schema}.enum_version_checklists_frequency`
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS ${schema}.enum_version_checklists_approvalMode`
    );
  },
};
