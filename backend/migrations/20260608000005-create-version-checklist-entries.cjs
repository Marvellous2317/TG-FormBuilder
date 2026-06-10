'use strict';

const { getSchema } = require('./utils/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: 'version_checklist_entries', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        versionChecklistId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        checklistId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        entryId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'text',
        },
        section: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        image: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        section_formular: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        config: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        required: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        options: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        formulaExpression: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        metadata: {
          type: Sequelize.JSON,
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
      { tableName: 'version_checklist_entries', schema },
      {
        fields: ['versionChecklistId'],
        name: 'version_checklist_entries_version_idx',
      }
    );
    await queryInterface.addIndex(
      { tableName: 'version_checklist_entries', schema },
      {
        fields: ['checklistId', 'version'],
        name: 'version_checklist_entries_checklist_version_idx',
      }
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.dropTable({ tableName: 'version_checklist_entries', schema });
  },
};
