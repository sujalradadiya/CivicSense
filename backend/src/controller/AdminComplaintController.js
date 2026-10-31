const ComplaintService = require("../services/complaintService");

/**
 * Get all complaints with search, filters, pagination, and sorting
 * GET /api/admin/complaints
 * Roles: ADMIN only
 */
const getAllComplaints = async (req, res) => {
  try {
    const result = await ComplaintService.getAllComplaints(req.query);

    return res.status(200).json({
      success: true,
      message: "Complaints fetched successfully",
      data: result.complaints,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

/**
 * Get complaint details by ID
 * GET /api/admin/complaints/:id
 * Roles: ADMIN only
 */
const getComplaintById = async (req, res) => {
  try {
    const complaint = await ComplaintService.getComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint details fetched successfully",
      data: complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint details",
      error: error.message,
    });
  }
};

/**
 * Get complaint status history timeline
 * GET /api/admin/complaints/:id/history
 * Roles: ADMIN only
 */
const getComplaintHistory = async (req, res) => {
  try {
    const complaint = await ComplaintService.getComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint history fetched successfully",
      data: complaint.history || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint history",
      error: error.message,
    });
  }
};

/**
 * Update complaint status (Verify, In Progress, Resolve, Reject)
 * PATCH /api/admin/complaints/:id/status
 * Roles: ADMIN only
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks, authorityId, evidenceImages } = req.body;

    const updated = await ComplaintService.updateStatus(
      req.params.id,
      status,
      remarks,
      req.user,
      { authorityId, evidenceImages }
    );

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status} successfully`,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update complaint status",
    });
  }
};

/**
 * Update complaint priority
 * PATCH /api/admin/complaints/:id/priority
 * Roles: ADMIN only
 */
const updateComplaintPriority = async (req, res) => {
  try {
    const { priority, reason } = req.body;

    const updated = await ComplaintService.updatePriority(
      req.params.id,
      priority,
      reason,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: `Complaint priority updated to ${priority} successfully`,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update complaint priority",
    });
  }
};

/**
 * Get AI Analysis recommendations for a complaint
 * GET /api/admin/complaints/:id/ai-analysis
 * Roles: ADMIN only
 */
const getComplaintAIAnalysis = async (req, res) => {
  try {
    const complaint = await ComplaintService.getComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const hasAIAnalysis = Boolean(
      complaint.aiAnalysis &&
        (complaint.aiAnalysis.category ||
          complaint.aiAnalysis.suggestedPriority ||
          complaint.aiAnalysis.verificationResult ||
          complaint.aiAnalysis.confidence)
    );

    return res.status(200).json({
      success: true,
      available: hasAIAnalysis,
      message: hasAIAnalysis
        ? "AI analysis retrieved successfully"
        : "AI analysis not available yet",
      data: hasAIAnalysis ? complaint.aiAnalysis : null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI analysis",
      error: error.message,
    });
  }
};

module.exports = {
  getAllComplaints,
  getComplaintById,
  getComplaintHistory,
  updateComplaintStatus,
  updateComplaintPriority,
  getComplaintAIAnalysis,
};
