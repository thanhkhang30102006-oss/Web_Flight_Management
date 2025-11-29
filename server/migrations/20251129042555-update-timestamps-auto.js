"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      "Passengers",
      "FlightInformations",
      "Seats",
      "Tickets",
      "Payments",
      "Staffs",
      "Messages",
      "CheckIns",
    ];
    const transaction = await queryInterface.sequelize.transaction();

    try {
      for (const tableName of tables) {
        // 1. Sửa cột createdAt: Tự động lấy giờ hiện tại khi INSERT
        await queryInterface.sequelize.query(
          `ALTER TABLE ${tableName} MODIFY createdAt DATETIME DEFAULT CURRENT_TIMESTAMP;`,
          { transaction }
        );

        // 2. Sửa cột updatedAt: Tự động lấy giờ hiện tại khi INSERT + Tự nhảy giờ khi UPDATE
        await queryInterface.sequelize.query(
          `ALTER TABLE ${tableName} MODIFY updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`,
          { transaction }
        );
      }

      await transaction.commit();
      console.log("Đã cập nhật xong tính năng tự động thời gian cho các bảng!");
    } catch (err) {
      await transaction.rollback();
      console.error("Lỗi, đang hoàn tác lại:", err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      "Passengers",
      "FlightInformations",
      "Seats",
      "Tickets",
      "Payments",
      "Staffs",
      "Messages",
      "CheckIns",
    ];

    const transaction = await queryInterface.sequelize.transaction();

    try {
      for (const tableName of tables) {
        // Trả về trạng thái bình thường (không tự động)
        await queryInterface.sequelize.query(
          `ALTER TABLE ${tableName} MODIFY createdAt DATETIME;`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TABLE ${tableName} MODIFY updatedAt DATETIME;`,
          { transaction }
        );
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
