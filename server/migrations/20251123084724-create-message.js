'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      messageID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contentMessage: {
        allowNull:false,
        type: Sequelize.STRING
      },
      messageTime:{
        allowNull:false,
        type:Sequelize.DATE
      },
      passengerID:{
        allowNull:false,
        references:{
          model:'passengers',
          key:'passengerID'
        },
        type:Sequelize.STRING
      },
      staffID:{
        allowNull:false,
        references:{
          model:'staffs',
          key:'staffID'
        },
        type:Sequelize.STRING
      },
      isBeenChecked:{
        allowNull:false,
        defaultValue:'no',
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
    await queryInterface.dropTable('Messages');
  }
};