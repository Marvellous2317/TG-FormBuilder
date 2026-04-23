import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistEntry = sequelize.define(
  "checklist_entries",
  {
    entryId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    checklistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("text", "number", "dropdown", "date", "time", "enum", "formular", "section"),
      allowNull: false,
      defaultValue: "text",
    },
    section: {
      type: DataTypes.STRING(255),
      allowNull: true,
      
    },
       config: {
      type: DataTypes.JSONB,
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
      type: DataTypes.JSONB,
      allowNull: true,
     
    },
    formulaExpression: {
      type: DataTypes.TEXT,
      allowNull: true,

    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,

    },
  },
  {
    tableName: "checklist_entries",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ["checklistId", "order"] },
    ],
  }
);
