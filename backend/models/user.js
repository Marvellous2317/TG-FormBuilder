import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../config/database.js";
 
 


export const User = sequelize.define(
  "packing_check_users",
  {
        userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },


    firstName: { type: DataTypes.STRING(100), allowNull: false },
    lastName: { type: DataTypes.STRING(100), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(150), unique: true },
	signature : { type: DataTypes.TEXT, allowNull: true },


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
    tableName: "packing_check_users",
    freezeTableName: true,
    timestamps: true,
	 paranoid: true, 
	 deletedAt: "deletedAt", 
  }
);











