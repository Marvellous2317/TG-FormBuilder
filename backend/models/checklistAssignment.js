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
    checklistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
        active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "checklist_assignments",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    deletedAt: "deletedAt",
    indexes: [
      { fields: ["checklistId"] },
      { fields: ["companyId"] },
    ],
  }
);
