"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Passenger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Passenger.init(
    {
      passengerID: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      passengerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passengerGender: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      passengerNationality: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passengerPassport: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passengerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passengerMobile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passengerImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passengerAccountName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passengerPassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passengerState: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Passenger",
      tableName: "passengers",
      timestamps: true,
    }
  );

  return Passenger;
};
