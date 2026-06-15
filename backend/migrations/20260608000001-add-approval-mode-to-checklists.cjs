'use strict';

const { getSchema } = require('./utils/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.addColumn(
      { tableName: 'checklists', schema },
      'approvalMode',
      {
        type: Sequelize.ENUM('sequential', 'parallel'),
        allowNull: false,
        defaultValue: 'sequential',
      }
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.removeColumn(
      { tableName: 'checklists', schema },
      'approvalMode'
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS ${schema}.enum_checklists_approvalMode`
    );
  },
};
