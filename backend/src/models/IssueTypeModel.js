const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IssueTypeSchema = new Schema({
    id: { 
        type: String 
    },
    category: { 
        type: String 
    },
    subProblem: { type: String },
    location: { type: String },
    landmark: { type: String },
    urgency: { type: String },
    description: { type: String },
    status: { type: String },
    reportedBy: { type: String },
    userContact: { type: String },
    userEmail: { type: String },
    city: { type: String },
    createdAt: { type: Date },
    upvotes: { type: Number },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    assignedAuthority: { type: Schema.Types.ObjectId, ref: "Authority", default: null },
    rejectionReason: { type: String, default: null },
    resolutionRemarks: { type: String, default: null },
    evidenceImages: [{ type: String }],
    history: [{ type: Schema.Types.Mixed }]
}, { timestamps: true });

module.exports = mongoose.model("IssueType", IssueTypeSchema);
