"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      Payment.hasMany(models.Ticket, {
        foreignKey: "paymentID",
        as: "tickets",
      });
    }
  }

  Payment.init(
    {
      paymentID: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      paymentPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      paymentState: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      timestamps: true,
    }
  );

  return Payment;
};
