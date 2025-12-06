"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Dùng transaction để đảm bảo cả 2 cột đều được sửa, hoặc không cột nào được sửa nếu lỗi
    return queryInterface.sequelize.transaction(async (t) => {
      // 1. Sửa cột arriveDay thành NOT NULL
      await queryInterface.changeColumn(
        "flightinformations",
        "arriveDay",
        {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        { transaction: t }
      );

      await queryInterface.changeColumn(
        "flightinformations",
        "arriveTime",
        {
          type: Sequelize.TIME,
          allowNull: false,
        },
        { transaction: t }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.changeColumn(
        "flightinformations",
        "arriveDay",
        {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        { transaction: t }
      );

      await queryInterface.changeColumn(
        "flightinformations",
        "arriveTime",
        {
          type: Sequelize.TIME,
          allowNull: true,
        },
        { transaction: t }
      );
    });
  },
};
