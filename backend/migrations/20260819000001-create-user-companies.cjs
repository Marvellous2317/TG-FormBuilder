'use strict';

const { getSchema } = require('./utils/helpers.cjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    const table = { tableName: 'packing_check_user_companies', schema };

    try {
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    } catch (error) {
      console.warn('Could not ensure pgcrypto extension:', error.message);
    }

    let exists = true;
    try {
      await queryInterface.describeTable(table);
    } catch {
      exists = false;
    }

    if (!exists) {
      await queryInterface.createTable(table, {
        userCompanyId: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'packing_check_users', schema }, key: 'userId' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        companyId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'packing_check_company', schema }, key: 'companyId' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      });

      await queryInterface.addConstraint(table, {
        fields: ['userId', 'companyId'],
        type: 'unique',
        name: 'packing_check_user_companies_userId_companyId_uk',
      });

      await queryInterface.addIndex(table, ['userId'], {
        name: 'packing_check_user_companies_userId_idx',
      });
    }

    await queryInterface.sequelize.query(`
      INSERT INTO "${schema}"."packing_check_user_companies" ("userId", "companyId", "createdAt", "updatedAt")
      SELECT u."userId", u."companyId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM "${schema}"."packing_check_users" u
      WHERE u."companyId" IS NOT NULL
        AND u."deletedAt" IS NULL
      ON CONFLICT ("userId", "companyId") DO NOTHING;
    `);
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.dropTable({ tableName: 'packing_check_user_companies', schema });
  },
};
