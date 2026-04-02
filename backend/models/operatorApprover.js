import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OperatorApprover = sequelize.define(
  "operator_approvers",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    operatorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "operator_approvers",
    freezeTableName: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ["operatorId", "approverId"] },
    ],
  }
);
