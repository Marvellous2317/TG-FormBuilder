import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistSubmission = sequelize.define(
  "checklist_submissions",
  {
    submissionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    submissionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "submitted", "pending_review", "approved", "rejected"),
      allowNull: false,
      defaultValue: "draft",
    },
    submittedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completionTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,

    },

  },
  {
    tableName: "checklist_submissions",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["assignmentId"] },
      { fields: ["status"] },
      { fields: ["submittedBy"] },
      { fields: ["companyId"] },
      { fields: ["reviewedBy", "status"] },
      { fields: ["companyId", "status"] },
      { fields: ["assignmentId", "submissionNumber"], unique: true },
    ],
  }
);
