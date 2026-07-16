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

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // Marks a role as an admin-type role — such roles pass the admin route guards.
    // What an admin user can actually do (read vs read+write) is a per-user
    // permission on the User model (User.accessLevel), not on the role.
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

  },
  {
    tableName: "packing_check_roles",
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
  }
);



