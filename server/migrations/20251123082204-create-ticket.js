'use strict';

const passenger = require('../models/passenger');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tickets', {
      ticketID: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      passengerID: {
        allowNull:false,
        references:{
          model:'passengers',
          key: 'passengerID'
        },
        type: Sequelize.STRING
      },
      seatNumber:{
        allowNull:false,
        references:{
          model:'seats',
          key:'seatNumber'
        },
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
      ticketBookTime:{
        allowNull:false,
        type:Sequelize.DATE
      },
      ticketState:{
        allowNull:false,
        defaultValue:'valid',
        type:Sequelize.STRING
      },
      paymentID:{
        allowNull:false,
        references:{
          model:'payments',
          key:'paymentID'
        },
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
    await queryInterface.dropTable('Tickets');
  }
};