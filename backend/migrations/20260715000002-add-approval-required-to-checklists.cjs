'use strict';

const { getSchema } = require('./utils/helpers.cjs');


module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    const table = { tableName: 'checklists', schema };

    const columns = await queryInterface.describeTable(table);
    if (!columns.approvalRequired) {
      await queryInterface.addColumn(table, 'approvalRequired', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.removeColumn(
      { tableName: 'checklists', schema },
      'approvalRequired'
    );
  },
};
