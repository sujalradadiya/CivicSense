const crypto = require("crypto");
const AdminInvitation = require("../models/AdminInvitation");
const UserModel = require("../models/UserModel");

class InvitationService {
  /**
   * Hash a raw invitation token with SHA-256
   */
  static hashToken(rawToken) {
    return crypto.createHash("sha256").update(String(rawToken).trim()).digest("hex");
  }

  /**
   * Create an administrator invitation
   * @param {Object} creatorAdmin Authenticated admin user
   * @param {string} email Invitee email
   * @param {string} role Always 'ADMIN'
   * @param {number} expiresInHours Expiry in hours (default 48)
   */
  static async createInvitation(creatorAdmin, email, role = "ADMIN", expiresInHours = 48) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const assignedRole = (role && role === "ADMIN") ? "ADMIN" : "ADMIN";

    if (role && role !== "ADMIN") {
      throw new Error("Only ADMIN invitations can be created. The MANAGER role has been removed.");
    }

    // Check if an active account with this email already has an ADMIN role
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.role === "ADMIN") {
      throw new Error(`A user with email ${normalizedEmail} is already registered as an Administrator.`);
    }

    // Invalidate any previous unused invitations for this email
    await AdminInvitation.updateMany(
      { email: normalizedEmail, isUsed: false },
      { $set: { isUsed: true, usedAt: new Date() } }
    );

    // Generate cryptographically secure random token (64 hex characters)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const invitation = await AdminInvitation.create({
      email: normalizedEmail,
      role: assignedRole,
      tokenHash,
      expiresAt,
      createdBy: creatorAdmin._id || creatorAdmin.id,
    });

    return {
      rawToken,
      invitationId: invitation._id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * Validate an invitation token
   */
  static async validateToken(rawToken, email) {
    if (!rawToken) {
      throw new Error("Invitation token is required.");
    }

    const tokenHash = this.hashToken(rawToken);
    const invitation = await AdminInvitation.findOne({ tokenHash });

    if (!invitation) {
      throw new Error("Invalid invitation token.");
    }

    if (invitation.isUsed) {
      throw new Error("This invitation token has already been used.");
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error("This invitation token has expired.");
    }

    if (email && invitation.email.toLowerCase() !== String(email).trim().toLowerCase()) {
      throw new Error(`Email mismatch. This invitation is valid only for ${invitation.email}.`);
    }

    return invitation;
  }

  /**
   * Consume an invitation after successful signup
   */
  static async consumeInvitation(invitationId, newUserId) {
    return await AdminInvitation.findByIdAndUpdate(
      invitationId,
      {
        $set: {
          isUsed: true,
          usedAt: new Date(),
          usedBy: newUserId,
        },
      },
      { returnDocument: "after" }
    );
  }

  /**
   * List all invitations with status
   */
  static async listInvitations() {
    return await AdminInvitation.find()
      .populate("createdBy", "name email role")
      .populate("usedBy", "name email role")
      .sort({ createdAt: -1 });
  }
}

module.exports = InvitationService;
