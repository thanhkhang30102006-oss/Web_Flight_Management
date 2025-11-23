'use strict';

const flightinformation = require('../models/flightinformation');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Seats', {
      seatNumber: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      seatType: {
        allowNull:false,
        type: Sequelize.STRING
      },
      seatState:{
        allowNull:false,
        defaultValue: 'available',
        type: Sequelize.STRING
      },
      flightNumber:{
        allowNull:false,
        references:{
          model:'flightinformations',
          key:'flightNumber'
        },
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Seats');
  }
};