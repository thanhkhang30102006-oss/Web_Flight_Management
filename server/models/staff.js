'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
    }
    
    //check isAdmin
    isAdmin() {
      return this.staffPosition === 'admin';
    }
  }
  
  Staff.init({
    staffID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    staffName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    staffAccountName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    staffPassword: {
      type: DataTypes.STRING,
      allowNull: false
    },
    staffPosition: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'staff',
      validate: {
        isIn: [['staff', 'admin', 'manager']] 
      }
    },
    emailPrivate: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        checkAdminEmail(value) {
          if (this.staffPosition === 'admin' && !value) {
            throw new Error('');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Staff',
    tableName: 'staffs',
    timestamps: true,
  });
  
  return Staff;
};