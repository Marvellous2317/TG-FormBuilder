"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add issuedNumber and entityDisplayName to checklists table
    await queryInterface.addColumn("checklists", "issuedNumber", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn("checklists", "entityDisplayName", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    // Add issuedNumber and entityDisplayName to submitted_checklists table (snapshot)
    await queryInterface.addColumn("submitted_checklists", "issuedNumber", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn("submitted_checklists", "entityDisplayName", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("checklists", "issuedNumber");
    await queryInterface.removeColumn("checklists", "entityDisplayName");
    await queryInterface.removeColumn("submitted_checklists", "issuedNumber");
    await queryInterface.removeColumn("submitted_checklists", "entityDisplayName");
  },
};
