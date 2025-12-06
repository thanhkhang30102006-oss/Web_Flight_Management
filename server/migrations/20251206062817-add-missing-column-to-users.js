"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("FlightInformations", "arriveDay", {
      allowNull: false,
      type: Sequelize.DATEONLY,
    });
    await queryInterface.addColumn("FlightInformations", "arriveTime", {
      allowNull: true,
      type: Sequelize.TIME,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("FlightInformations", "arriveDay");
    await queryInterface.removeColumn("FlightInformations", "arriveTime");
  },
};
