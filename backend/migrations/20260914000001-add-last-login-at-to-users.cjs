'use strict';

const { getSchema } = require('./utils/helpers.cjs');


module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    const table = { tableName: 'packing_check_users', schema };

    const columns = await queryInterface.describeTable(table);
    if (!columns.lastLoginAt) {
      await queryInterface.addColumn(table, 'lastLoginAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.removeColumn(
      { tableName: 'packing_check_users', schema },
      'lastLoginAt'
    );
  },
};
