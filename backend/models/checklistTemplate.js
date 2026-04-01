import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ChecklistTemplate = sequelize.define(
  "checklist_templates",
  {
    templateId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      allowNull: false,
      defaultValue: "draft",
    },
    // Company-specific (SaaS multi-tenancy)
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Department-specific within company
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Department this template belongs to (null = company-wide)",
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "checklist_templates",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    deletedAt: "deletedAt",
    // indexes: [
    //   { fields: ["status"] },
    //   { fields: ["companyId"] },
    //   { fields: ["companyId", "department"] },
    //   { fields: ["createdBy"] },
    //   { fields: ["companyId", "status"] },
    // ],
  }
);
