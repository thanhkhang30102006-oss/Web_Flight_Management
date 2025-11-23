'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Staffs', {
      staffID: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      staffName: {
        allowNull:false,
        type: Sequelize.STRING
      },
      staffAccountName:{
        allowNull:true,
        type:Sequelize.STRING
      },
      staffPassword:{
        allowNull:false,
        type:Sequelize.STRING
      },
      staffPosition:{
        allowNull:false,
        defaultValue:'staff',
        type:Sequelize.STRING
      },
      emailPrivate:{
        allowNull:true,
        type:Sequelize.STRING,
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
    await queryInterface.dropTable('Staffs');
  }
};