'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CheckIn extends Model {
    static associate(models) {
      this.belongsTo(models.Passenger, { foreignKey: 'passengerID', as: 'passenger' });
      
      this.belongsTo(models.Ticket, { foreignKey: 'ticketID', as: 'ticket' });
    }
  }
  
  CheckIn.init({
    checkinID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    passengerID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ticketID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    checkinState: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'no'
    }
  }, {
    sequelize,
    modelName: 'CheckIn',
    tableName: 'checkins',
    timestamps: true,
  });
  
  return CheckIn;
};