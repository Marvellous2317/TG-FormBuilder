'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [[row]] = await queryInterface.sequelize.query(
      `SELECT n.nspname AS schema
       FROM pg_type t
       JOIN pg_namespace n ON t.typnamespace = n.oid
       WHERE t.typname = 'enum_checklist_entries_type'
       LIMIT 1`
    );

    if (!row) {
      throw new Error("Could not find enum type 'enum_checklist_entries_type' in the database.");
    }

    const schema = row.schema;
    await queryInterface.sequelize.query(
      `ALTER TYPE ${schema}.enum_checklist_entries_type ADD VALUE IF NOT EXISTS 'image'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE ${schema}.enum_checklist_entries_type ADD VALUE IF NOT EXISTS 'section_formular'`
    );
  },

  async down() {

    console.warn("down: Cannot remove enum value 'image' from enum_checklist_entries_type automatically.");
    console.warn("down: Cannot remove enum value 'section_formular' from enum_checklist_entries_type automatically.");
  },
};
