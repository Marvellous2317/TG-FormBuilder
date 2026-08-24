'use strict';

const { getSchema } = require('./utils/helpers.cjs');


module.exports = {
  async up(queryInterface) {
    const schema = getSchema();

    const [duplicates] = await queryInterface.sequelize.query(`
      SELECT "companyId", "documentNumber", count(*) AS c
      FROM "${schema}"."checklists"
      WHERE "deletedAt" IS NULL
      GROUP BY 1, 2
      HAVING count(*) > 1
    `);

    if (duplicates.length > 0) {
      throw new Error(
        `Cannot scope checklist uniqueness: ${duplicates.length} live (companyId, documentNumber) duplicate(s) already exist. Resolve them first.`
      );
    }

    // Legacy global rules, superseded by the per-company partial index.
    // These are backed by UNIQUE constraints, so the constraint must go first --
    // Postgres refuses to drop an index that a constraint depends on.
    const legacy = ['checklists_documentNumber_key', 'checklists_title_key'];
    for (const name of legacy) {
      await queryInterface.sequelize.query(
        `ALTER TABLE "${schema}"."checklists" DROP CONSTRAINT IF EXISTS "${name}"`
      );
      // Covers the case where the same name exists as a bare index.
      await queryInterface.sequelize.query(
        `DROP INDEX IF EXISTS "${schema}"."${name}"`
      );
    }

    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS "${schema}"."checklists_documentNumber_companyId_idx"`
    );

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "checklists_document_number_company_id"
      ON "${schema}"."checklists" ("documentNumber", "companyId")
      WHERE "deletedAt" IS NULL
    `);
  },

  async down(queryInterface) {
    const schema = getSchema();


    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "checklists_documentNumber_key"
      ON "${schema}"."checklists" ("documentNumber")
    `);
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "checklists_title_key"
      ON "${schema}"."checklists" (title)
    `);
  },
};
