import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// Read-only snapshot of a checklist's entries tied to a single VersionChecklist.
export const VersionChecklistEntry = sequelize.define(
  "version_checklist_entries",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    versionChecklistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    checklistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "text",
    },
    section: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    image: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    section_formular: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    formulaExpression: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "version_checklist_entries",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["versionChecklistId"] },
      { fields: ["checklistId", "version"] },
    ],
  }
);
