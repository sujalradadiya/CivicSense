const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminInvitationSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Invitation email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    role: {
      type: String,
      enum: ["ADMIN"],
      default: "ADMIN",
      required: [true, "Intended role is required"],
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if invitation is valid
AdminInvitationSchema.methods.isValid = function () {
  return !this.isUsed && new Date() < this.expiresAt;
};

const AdminInvitation =
  mongoose.models.AdminInvitation ||
  mongoose.model("AdminInvitation", AdminInvitationSchema);

module.exports = AdminInvitation;
