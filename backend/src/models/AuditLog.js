const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "STATUS_CHANGE",
        "PRIORITY_CHANGE",
        "VERIFICATION",
        "ASSIGNMENT",
        "REJECTION",
        "RESOLUTION",
        "REOPENED",
        "ACCOUNT_STATUS_CHANGE",
        "INVITATION_CREATED",
        "ADMIN_REGISTERED",
      ],
      index: true,
    },
    targetType: {
      type: String,
      enum: ["ISSUE", "USER", "INVITATION"],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    performedByRole: {
      type: String,
      default: "",
    },
    performedByEmail: {
      type: String,
      default: "",
    },
    details: {
      previousValue: { type: Schema.Types.Mixed, default: null },
      newValue: { type: Schema.Types.Mixed, default: null },
      remarks: { type: String, default: "" },
      metadata: { type: Schema.Types.Mixed, default: {} },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

module.exports = AuditLog;
