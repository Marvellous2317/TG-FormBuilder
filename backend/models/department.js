import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Department = sequelize.define(
  "packing_check_department",
  {
    departmentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    departmentName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "suspended"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    tableName: "packing_check_department",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
  }
);
