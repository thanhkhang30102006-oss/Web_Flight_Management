'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Seat extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      this.belongsTo(models.FlightInformation, { 
        foreignKey: 'flightNumber', 
        targetKey: 'flightNumber',
      });
    }
  }
  
  Seat.init({
    seatNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    seatType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    seatState: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'available'
    },
    flightNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Seat',
    tableName: 'seats', 
    timestamps: true,
  });
  
  return Seat;
};