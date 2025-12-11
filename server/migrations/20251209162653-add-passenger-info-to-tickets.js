"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Sử dụng transaction để đảm bảo nếu có lỗi,
     * tất cả các cột sẽ không được thêm vào (tránh dữ liệu rác).
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "tickets",
          "contactName",
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          { transaction: t }
        ),

        queryInterface.addColumn(
          "tickets",
          "contactEmail",
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          { transaction: t }
        ),

        queryInterface.addColumn(
          "tickets",
          "contactPhone",
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          { transaction: t }
        ),

        queryInterface.addColumn(
          "tickets",
          "contactPassport",
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Logic để hoàn tác (rollback) lại migration
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("tickets", "contactName", {
          transaction: t,
        }),
        queryInterface.removeColumn("tickets", "contactEmail", {
          transaction: t,
        }),
        queryInterface.removeColumn("tickets", "contactPhone", {
          transaction: t,
        }),
        queryInterface.removeColumn("tickets", "contactPassport", {
          transaction: t,
        }),
      ]);
    });
  },
};
