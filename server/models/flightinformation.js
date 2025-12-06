"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FlightInformation extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {}
  }

  FlightInformation.init(
    {
      flightNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      departurePoint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      arrivePoint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departureDay: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      departureTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      planeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flightTotalSeat: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      flightState: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      arriveDay: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      arriveTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "FlightInformation",
      tableName: "flightinformations",
      timestamps: true,
    }
  );

  return FlightInformation;
};
