import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistResponse = sequelize.define(
  "checklist_responses",
  {
    responseId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    submissionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fieldId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Points to the EXACT field version when submitted",
    },
    sectionInstanceIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "For repeatable sections (0-based index)",
    },
    value: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "The answer - flexible JSON for all field types",
    },
    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "For file/image uploads - URL to stored file",
    },
  },
  {
    tableName: "checklist_responses",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["submissionId"] },
      { fields: ["fieldId"] },
      { fields: ["submissionId", "fieldId", "sectionInstanceIndex"] },
    ],
  }
);
