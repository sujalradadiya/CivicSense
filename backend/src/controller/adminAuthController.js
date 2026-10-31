const UserModel = require("../models/UserModel");
const InvitationService = require("../services/invitationService");
const AuditLogService = require("../services/auditLogService");

/**
 * Create an Administrator Invitation
 * POST /api/admin/invitations
 * Protected: ADMIN only
 */
const createInvitation = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (role && role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Role must be 'ADMIN'. The MANAGER role has been removed.",
      });
    }

    const result = await InvitationService.createInvitation(
      req.user,
      email,
      "ADMIN"
    );

    await AuditLogService.recordLog({
      action: "INVITATION_CREATED",
      targetType: "INVITATION",
      targetId: result.invitationId,
      performedBy: req.user._id,
      performedByRole: req.user.role,
      performedByEmail: req.user.email,
      newValue: { email: result.email, role: "ADMIN" },
      remarks: `Created Administrator invitation for ${result.email}`,
    });

    return res.status(201).json({
      success: true,
      message: "Administrator invitation created successfully. Share this single-use token with the invitee.",
      data: {
        email: result.email,
        role: "ADMIN",
        invitationToken: result.rawToken,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create invitation",
    });
  }
};

/**
 * List all Invitations
 * GET /api/admin/invitations
 * Protected: ADMIN only
 */
const getInvitations = async (req, res) => {
  try {
    const invitations = await InvitationService.listInvitations();

    return res.status(200).json({
      success: true,
      message: "Invitations fetched successfully",
      data: invitations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invitations",
      error: error.message,
    });
  }
};

/**
 * View all Administrative Staff (Admins only)
 * GET /api/admin/staff
 * Protected: ADMIN only
 */
const getAllStaff = async (req, res) => {
  try {
    const staff = await UserModel.find(
      { role: "ADMIN" },
      "-password"
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Administrator staff fetched successfully",
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch administrative staff",
      error: error.message,
    });
  }
};

/**
 * Activate or Deactivate an Account
 * PATCH /api/admin/users/:id/status
 * Protected: ADMIN only
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, remarks } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive boolean field is required in request body.",
      });
    }

    const targetUser = await UserModel.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    // Safety check: Prevent deactivating the last active ADMIN
    if (!isActive && targetUser.role === "ADMIN") {
      const activeAdminCount = await UserModel.countDocuments({
        role: "ADMIN",
        isActive: true,
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Operation blocked: Cannot deactivate the last remaining active Administrator.",
        });
      }
    }

    const previousStatus = targetUser.isActive;
    targetUser.isActive = isActive;
    await targetUser.save();

    await AuditLogService.recordLog({
      action: "ACCOUNT_STATUS_CHANGE",
      targetType: "USER",
      targetId: targetUser._id,
      performedBy: req.user._id,
      performedByRole: req.user.role,
      performedByEmail: req.user.email,
      previousValue: { isActive: previousStatus },
      newValue: { isActive: targetUser.isActive },
      remarks: remarks || `Account status changed to ${isActive ? "Active" : "Deactivated"}`,
    });

    return res.status(200).json({
      success: true,
      message: `User account has been ${isActive ? "activated" : "deactivated"} successfully.`,
      data: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

/**
 * Get Audit Logs
 * GET /api/admin/audit-logs
 * Protected: ADMIN only
 */
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const action = req.query.action;

    const filter = {};
    if (action) filter.action = action;

    const result = await AuditLogService.getLogs(filter, page, limit);

    return res.status(200).json({
      success: true,
      message: "Audit logs fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

module.exports = {
  createInvitation,
  getInvitations,
  getAllStaff,
  updateUserStatus,
  getAuditLogs,
};
