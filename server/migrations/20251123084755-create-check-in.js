'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CheckIns', {
      checkinID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      passengerID: {
        type: Sequelize.STRING,
        allowNull:false,
        references:{
          model:'passengers',
          key:'passengerID'
        }
      },
      ticketID:{
        type:Sequelize.STRING,
        allowNull:false,
        references:{
          model:'tickets',
          key:'ticketID'
        }
      },
      checkinState:{
        type:Sequelize.STRING,
        defaultValue:'no',
        allowNull:false
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
    await queryInterface.dropTable('CheckIns');
  }
};