'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      paymentID: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      paymentPrice: {
        allowNull:false,
        type: Sequelize.DECIMAL(10,2)
      },
      paymentType:{
        allowNull:false,
        type:Sequelize.STRING
      },
      paymentDate:{
        allowNull:false,
        type:Sequelize.DATE
      },
      paymentState:{
        allowNull:false,
        defaultValue: 'pending',
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
    await queryInterface.dropTable('Payments');
  }
};