'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FlightInformations', {
      flightNumber: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      departurePoint: {
        allowNull:false,
        type: Sequelize.STRING
      },
      arrivePoint:{
        allowNull:false,
        type:Sequelize.STRING
      },
      departureDay:{
        allowNull:false,
        type:Sequelize.DATEONLY
      },
      departureTime:{
        allowNull:false,
        type:Sequelize.TIME
      },
      planeType:{
        allowNull:false,
        type:Sequelize.STRING
      },
      flightTotalSeat:{
        allowNull:false,
        type:Sequelize.INTEGER
      },
      flightState:{
        allowNull:false,
        defaultValue:'active',
        type:Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FLightInformations');
  }
};