import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const SubmittedChecklistEntry = sequelize.define(
  "submitted_checklist_entries",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    submittedChecklistId: {
      type: DataTypes.UUID,
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
      comment: "Snapshot of entry type",
    },
        status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    section: {
      type: DataTypes.STRING(255),
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
      type: DataTypes.JSON,
      allowNull: true,
    },
    formulaExpression: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "submitted_checklist_entries",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ["submittedChecklistId"] },
      { fields: ["entryId"] },
    ],
  }
);

