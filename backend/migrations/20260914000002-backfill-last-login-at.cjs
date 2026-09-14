'use strict';

const { getSchema } = require('./utils/helpers.cjs');



module.exports = {
  async up(queryInterface) {
    const schema = getSchema();
    await queryInterface.sequelize.query(
      `UPDATE "${schema}"."packing_check_users" u
          SET "lastLoginAt" = l."lastLogin"
         FROM (
               SELECT t."userId", MAX(t."createdAt") AS "lastLogin"
                 FROM "${schema}"."packing_check_refresh_tokens" t
                WHERE NOT EXISTS (
                      SELECT 1 FROM "${schema}"."packing_check_refresh_tokens" p
                       WHERE p."replacedByTokenId" = t."tokenId")
                GROUP BY t."userId"
              ) l
        WHERE l."userId" = u."userId"
          AND u."lastLoginAt" IS NULL;`
    );
  },


  async down() {},
};
