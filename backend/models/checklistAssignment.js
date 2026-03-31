import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistAssignment = sequelize.define(
  "checklist_assignments",
  {
    assignmentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    templateVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Locked version at assignment time - never changes",
    },
    // Who fills the form
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Who created the assignment
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Who approves submissions from this assignment
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Company for multi-tenancy
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "paused", "revoked"),
      allowNull: false,
      defaultValue: "active",
    },
    allowMultipleSubmissions: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    maxSubmissions: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "null = unlimited submissions",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Assignment instructions for the user",
    },
    validFrom: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "When assignment becomes active",
    },
    validUntil: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "When assignment expires",
    },
  },
  {
    tableName: "checklist_assignments",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    deletedAt: "deletedAt",
    indexes: [
      { fields: ["assignedTo", "status"] },
      { fields: ["approverId"] },
      { fields: ["templateId"] },
      { fields: ["companyId"] },
      { fields: ["validFrom", "validUntil"] },
      { fields: ["companyId", "assignedTo", "status"] },
    ],
  }
);
