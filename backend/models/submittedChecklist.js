import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const SubmittedChecklist = sequelize.define(
  "submitted_checklists",
  {
    submittedChecklistId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    submittedBy: {
      type: DataTypes.UUID,
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
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },


  },
  {
    tableName: "submitted_checklists",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ["assignmentId"] },
      { fields: ["submittedBy"] },
      { fields: ["status"] },
    ],
  }
);
