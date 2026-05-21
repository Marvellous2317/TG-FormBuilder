import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "../config/database.js";
 


export const Verification = sequelize.define(
    "packing_check_verification",
    {
        verificationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
        otp: { type: DataTypes.INTEGER, allowNull: false },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        email: {
        type: DataTypes.STRING(50),
        },
        
        expiry: { type: DataTypes.DATE, allowNull: false },
    },
    { tableName: "packing_check_verification", freezeTableName: true, timestamps: true, paranoid: true }
);
