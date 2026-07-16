'use strict';

const { getSchema } = require('./utils/helpers.cjs');


module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    const table = { tableName: 'packing_check_roles', schema };

    const columns = await queryInterface.describeTable(table);

    if (!columns.isAdmin) {
      await queryInterface.addColumn(table, 'isAdmin', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    await queryInterface.sequelize.query(
      `UPDATE ${schema}."packing_check_roles"
       SET "isAdmin" = true
       WHERE LOWER("roleName") IN ('admin', 'superadmin')`
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.removeColumn(
      { tableName: 'packing_check_roles', schema },
      'isAdmin'
    );
  },
};
