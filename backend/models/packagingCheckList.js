import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../config/database.js";
 
 


export const PackagingCheckList = sequelize.define(
  "packaging_check_list",
  {
        packagingchecklistId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },


    name: { type: DataTypes.STRING(100), allowNull: false },
    tittle: { type: DataTypes.STRING(100), allowNull: false },

     roleId: {
      type: DataTypes.UUID,  
      allowNull: false, 
    },

     companyId: {
      type: DataTypes.UUID,  
      allowNull: true, 
    },

    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
   
    status: {
      type: DataTypes.ENUM("active", "suspended"),
      allowNull: false,
      defaultValue: "active",
    },
    isVerifyEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    newLogin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "packaging_check_list",
    freezeTableName: true,
    timestamps: true,
     paranoid: true, 
     deletedAt: "deletedAt", 
  }
);












