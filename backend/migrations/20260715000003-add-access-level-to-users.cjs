'use strict';

const { getSchema } = require('./utils/helpers.cjs');


module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    const table = { tableName: 'packing_check_users', schema };

    const columns = await queryInterface.describeTable(table);
    if (!columns.accessLevel) {
      await queryInterface.addColumn(table, 'accessLevel', {
        type: Sequelize.ENUM('read_write', 'read'),
        allowNull: false,
        defaultValue: 'read_write',
      });

  
     
    }
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.removeColumn(
      { tableName: 'packing_check_users', schema },
      'accessLevel'
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS ${schema}.enum_packing_check_users_accessLevel`
    );
  },
};
