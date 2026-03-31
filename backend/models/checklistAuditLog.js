import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class ChecklistAuditLog extends Model {}

ChecklistAuditLog.init(
  {
    logId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    entityType: {
      type: DataTypes.ENUM("template", "section", "field", "assignment", "submission"),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM(
        "created",
        "updated",
        "deleted",
        "published",
        "archived",
        "assigned",
        "submitted",
        "approved",
        "rejected",
        "revision_requested"
      ),
      allowNull: false,
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    previousState: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    newState: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional context (IP, user agent, etc.)",
    },
  },
  {
    sequelize,
    modelName: "ChecklistAuditLog",
    tableName: "checklist_audit_logs",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["entityType", "entityId"] },
      { fields: ["performedBy"] },
      { fields: ["companyId"] },
      { fields: ["createdAt"] },
    ],
  }
);
