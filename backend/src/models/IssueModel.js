const mongoose = require("mongoose")

const IssueSchema = new mongoose.Schema({
    uid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    issueTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IssueType",
      required: true,
    },

    issueTitle: {
      type: String,
      required: true,
      trim: true,
    },

    issueDetails: {
      type: String,
      required: true,
      trim: true,
    }, city: {
      type: String,
      required: true,
      trim: true,
    },

    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: [
        "PENDING",
        "VERIFIED",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    complaintId: {
      type: String,
      trim: true,
      index: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },

    assignedAuthority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Authority",
      default: null,
    },

    location: {
      type: String,
      trim: true,
    },

    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    resolutionRemarks: {
      type: String,
      trim: true,
      default: null,
    },

    evidenceImages: [
      {
        type: String,
      },
    ],

    // Architecture ready for AI Agent integration (Separate from admin-approved fields)
    aiAnalysis: {
      category: {
        type: String,
        default: null,
      },
      suggestedPriority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL", null],
        default: null,
      },
      verificationResult: {
        type: String,
        default: null,
      },
      suggestedDepartment: {
        type: String,
        default: null,
      },
      confidence: {
        type: Number,
        default: null,
      },
      analyzedAt: {
        type: Date,
        default: null,
      },
      rawAnalysis: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    history: [
      {
        action: { type: String },
        previousStatus: { type: String },
        newStatus: { type: String },
        previousPriority: { type: String },
        newPriority: { type: String },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        adminName: { type: String },
        adminEmail: { type: String },
        remarks: { type: String },
        timestamp: { type: Date, default: Date.now },
        metadata: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Issue", IssueSchema);

