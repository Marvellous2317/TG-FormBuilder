import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// Read-only snapshot of a checklist's master data, captured before the live
// checklist is updated. `version` auto-increments per checklistId.
export const VersionChecklist = sequelize.define(
  "version_checklists",
  {
    versionChecklistId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    checklistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    approvalMode: {
      type: DataTypes.ENUM("sequential", "parallel"),
      allowNull: false,
      defaultValue: "sequential",
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    versionedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "version_checklists",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ["checklistId", "version"] },
      { fields: ["checklistId"] },
      { fields: ["departmentId"] },
    ],
  }
);
