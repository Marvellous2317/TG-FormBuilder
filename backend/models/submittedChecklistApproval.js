import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const SubmittedChecklistApproval = sequelize.define(
  "submitted_checklist_approvals",
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
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    decidedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "submitted_checklist_approvals",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["submittedChecklistId"] },
      { unique: true, fields: ["submittedChecklistId", "approverId"] },
    ],
  }
);
