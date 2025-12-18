"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tickets", "cancelledAt", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "ticketState",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tickets", "cancelledAt");
  },
};
