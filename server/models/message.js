'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      
      this.belongsTo(models.Passenger, { foreignKey: 'passengerID', as: 'passenger' });
      
      this.belongsTo(models.Staff, { foreignKey: 'staffID', as: 'staff' });
    }
  }
  
  Message.init({
    messageID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    contentMessage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    messageTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    passengerID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    staffID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isBeenChecked: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'no' 
    },
    senderType: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    messageType: {
      type: DataTypes.STRING,
      defaultValue: 'text'
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
  });
  
  return Message;
};