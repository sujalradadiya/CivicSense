const mongoose = require("mongoose");

const ComplaintHistorySchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      index: true,
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
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
        "NOTE_ADDED",
      ],
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      default: null,
    },
    previousPriority: {
      type: String,
      default: null,
    },
    newPriority: {
      type: String,
      default: null,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    adminName: {
      type: String,
      default: "",
    },
    adminEmail: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    evidenceImages: [
      {
        type: String,
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

const ComplaintHistory =
  mongoose.models.ComplaintHistory ||
  mongoose.model("ComplaintHistory", ComplaintHistorySchema);

module.exports = ComplaintHistory;
