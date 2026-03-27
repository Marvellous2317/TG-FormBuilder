import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../config/database.js";
import { stat } from "fs";
 


export const Company = sequelize.define(
    "packing_check_company",
    {
    companyId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
        companyName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        address: {
        type: DataTypes.STRING(100),
        },

        contactEmail: {
        type: DataTypes.STRING(50),
        },

    status: {
      type: DataTypes.ENUM( "active", "suspended"),
      allowNull: false,
      defaultValue: "active",
    },
        
        
    },
    { tableName: "packing_check_company", freezeTableName: true, timestamps: true }
);
