"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      this.belongsTo(models.Passenger, {
        foreignKey: "passengerID",
        as: "passengerInfo",
      });

      this.belongsTo(models.Seat, {
        foreignKey: "seatNumber",
        as: "seatInfo",
      });

      this.belongsTo(models.FlightInformation, {
        foreignKey: "flightNumber",
        as: "flightInfo",
      });

      this.belongsTo(models.Payment, {
        foreignKey: "paymentID",
        as: "paymentInfo",
      });
    }
  }

  Ticket.init(
    {
      ticketID: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      passengerID: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      seatNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flightNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ticketBookTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      ticketState: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "valid",
      },
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      paymentID: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactPassport: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Ticket",
      tableName: "tickets",
      timestamps: true,
    }
  );

  return Ticket;
};
