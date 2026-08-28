import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// Membership join table: which companies a user belongs to.
// The user's ACTIVE workspace stays on packing_check_users.companyId.
export const UserCompany = sequelize.define(
  "packing_check_user_companies",
  {
    userCompanyId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "packing_check_user_companies",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ["userId", "companyId"] },
      { fields: ["userId"] },
    ],
  }
);
