import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../config/database.js";
 
 


export const PackagingCheckListEntry = sequelize.define(
  "packaging_check_list_entry",
  {
      packagingchecklistId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },


    name: { type: DataTypes.STRING(100), allowNull: false },
    tittle: { type: DataTypes.STRING(100), allowNull: false },
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
      createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },

  },
  {
    tableName: "packaging_check_list_entry",
    freezeTableName: true,
    timestamps: true,
     paranoid: true, 
     deletedAt: "deletedAt", 
  }
);












