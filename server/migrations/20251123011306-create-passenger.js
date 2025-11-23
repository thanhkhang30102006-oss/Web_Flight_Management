'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Passengers', {
      passengerID: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      passengerName: {
        allowNull:false,
        type: Sequelize.STRING
      },
      passengerGender:{
        allowNull:false,
        type: Sequelize.BOOLEAN
      },
      passengerNationality:{
        allowNull:false,
        type:Sequelize.STRING
      },
      passengerPassport:{
        allowNull:false,
        type:Sequelize.STRING
      },
      passengerEmail:{
        allowNull:false,
        type:Sequelize.STRING
      },
      passengerMobile:{
        allowNull:false,
        type:Sequelize.STRING
      },
      passengerImage:{
        allowNull:false,
        type:Sequelize.STRING
      },
      passengerAccountName:{
        allowNull:true,
        type:Sequelize.STRING
      },
      passengerPassword:{
        allowNull:false,
        type: Sequelize.STRING
      },
      passengerState:{
        allowNull:false,
        defaultValue: 'active',
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
    await queryInterface.dropTable('Passengers');
  }
};