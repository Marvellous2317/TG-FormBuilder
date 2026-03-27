import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Role = sequelize.define(
  "packing_check_roles",
  {
    roleId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roleName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Role hierarchy level: higher = more authority",
    },
  },
  {
    tableName: "packing_check_roles",
    freezeTableName: true,
    timestamps: true,
  }
);

// Default roles to seed
export const DEFAULT_ROLES = [
  {
    roleName: "operator",
    description: "Basic operator with limited access",
    permissions: ["view_dashboard", "create_record", "view_record"],
    level: 1,
  },
  {
    roleName: "approval",
    description: "Can approve/reject records and requests",
    permissions: ["view_dashboard", "create_record", "view_record", "approve_record", "reject_record"],
    level: 2,
  },
  {
    roleName: "admin",
    description: "Administrator with management access",
    permissions: ["view_dashboard", "create_record", "view_record", "approve_record", "reject_record", "manage_users", "view_reports"],
    level: 3,
  },
  {
    roleName: "superAdmin",
    description: "Super Administrator with full access",
    permissions: ["*"],
    level: 4,
  },
];
