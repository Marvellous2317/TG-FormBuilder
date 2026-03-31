import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistSection = sequelize.define(
  "checklist_sections",
  {
    sectionId: {
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
      comment: "Version of template this section belongs to (for immutability)",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isRepeatable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Can user add multiple instances of this section",
    },
    minInstances: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    maxInstances: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "null = unlimited",
    },
  },
  {
    tableName: "checklist_sections",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    // indexes: [
    //   { fields: ["templateId", "templateVersion"] },
    //   { fields: ["templateId", "templateVersion", "order"] },
    // ],
  }
);
