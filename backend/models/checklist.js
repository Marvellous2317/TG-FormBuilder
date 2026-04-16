import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Checklist = sequelize.define(
  "checklists",
  {
    checklistId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    documentNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.ENUM("hourly", "daily", "weekly", "monthly"),
      allowNull: true,
      defaultValue: null,
    },
    frequencyInterval: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "checklists",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    deletedAt: "deletedAt",
    indexes: [
      { unique: true, fields: ["documentNumber", "companyId"], where: { deletedAt: null } },
    ],
  }
);
