const Issue = require("../models/IssueModel");
const PriorityService = require("../services/PriorityService");

const addIssue = async (req, res) => {
  try {
    const issueData = { ...req.body };

    // Automatically associate with authenticated citizen's userId if available
    if (req.user && req.user._id) {
      issueData.uid = req.user._id;
    }

    // Auto-generate complaint ID if missing
    if (!issueData.complaintId) {
      issueData.complaintId = `CIV-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Rule-based priority evaluation
    if (!issueData.priority) {
      issueData.priority = PriorityService.evaluatePriority(issueData);
    }

    // Force default pending status and unverified for citizens
    if (!req.user || req.user.role === "USER") {
      issueData.status = "PENDING";
      issueData.verified = false;
    }

    const issue = await Issue.create(issueData);
    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: issue,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getIssues = async (req, res) => {
  try {
    const filter = {};

    // Role-based visibility:
    // If ADMIN, view all complaints
    if (req.user && req.user.role === "USER") {
      filter.uid = req.user._id;
    }

    const issues = await Issue.find(filter)
      .populate("uid", "name email contact city")
      .populate("issueTypeId")
      .populate("stateId", "name")
      .populate("assignedAuthority", "name type city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Complaints fetched successfully",
      data: issues,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Normal citizens can only edit their own complaints and cannot modify administrative fields
    if (req.user && req.user.role === "USER") {
      if (issue.uid && String(issue.uid) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only edit your own complaints.",
        });
      }
      delete req.body.status;
      delete req.body.verified;
      delete req.body.priority;
      delete req.body.assignedAuthority;
      delete req.body.rejectionReason;
      delete req.body.resolutionRemarks;
    }

    const updated = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      issue: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating issue",
      error: error.message,
    });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Citizens can only delete their own pending complaints
    if (req.user && req.user.role === "USER") {
      if (issue.uid && String(issue.uid) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You cannot delete another citizen's complaint.",
        });
      }
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting issue",
      error: error.message,
    });
  }
};

module.exports = {
  addIssue,
  getIssues,
  updateIssue,
  deleteIssue,
};