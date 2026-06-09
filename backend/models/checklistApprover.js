import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistApprover = sequelize.define(
  "checklist_approvers",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    checklistId: {
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
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "checklist_approvers",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ["checklistId", "approverId"] },
      { fields: ["checklistId"] },
    ],
  }
);
