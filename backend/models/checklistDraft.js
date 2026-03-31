import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistDraft = sequelize.define(
  "checklist_drafts",
  {
    draftId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    submissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      comment: "Links to draft submission",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    draftData: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: "Full form state { fieldId: value }",
    },
    lastSavedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "checklist_drafts",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["submissionId"], unique: true },
      { fields: ["userId"] },
    ],
  }
);
