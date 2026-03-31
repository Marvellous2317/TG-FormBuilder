import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistField = sequelize.define(
  "checklist_fields",
  {
    fieldId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "text",
        "textarea",
        "number",
        "decimal",
        "date",
        "datetime",
        "time",
        "select",
        "multiselect",
        "radio",
        "checkbox",
        "file",
        "image",
        "signature",
        "location",
        "barcode",
        "qrcode",
        "calculated",
        "lookup"
      ),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    placeholder: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    helpText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // JSON fields for flexibility
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'For select/radio/checkbox: [{value, label}]',
    },
    validation: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Rules: {min, max, minLength, maxLength, pattern, customRegex, customMessage}',
    },
    conditionalLogic: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Show/hide rules: {show: {when: fieldId, operator, value}}',
    },
    defaultValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Extra config (file types, max size, etc.)',
    },
  },
  {
    tableName: "checklist_fields",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { fields: ["sectionId"] },
      { fields: ["sectionId", "order"] },
    ],
  }
);
