const mongoose = require("mongoose");

const VALID_STATUSES = [
  "PENDING",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

/**
 * Validate Admin Login payload
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Both email and password are required.",
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email format.",
    });
  }

  next();
};

/**
 * Validate Admin Account Creation payload
 */
const validateCreateAdmin = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required.",
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email format.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }

  if (role && role !== "ADMIN") {
    return res.status(400).json({
      success: false,
      message: "Role must be 'ADMIN'. The MANAGER role has been removed.",
    });
  }

  next();
};

/**
 * Validate Complaint Status Update payload
 */
const validateStatusUpdate = (req, res, next) => {
  const { status, remarks, authorityId } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required in request body.",
    });
  }

  const upperStatus = String(status).toUpperCase();

  if (!VALID_STATUSES.includes(upperStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  // When rejecting, reason is required
  if (upperStatus === "REJECTED" && (!remarks || !remarks.trim())) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason / remarks are required when rejecting a complaint.",
    });
  }

  // When resolving, resolution remarks are required
  if (upperStatus === "RESOLVED" && (!remarks || !remarks.trim())) {
    return res.status(400).json({
      success: false,
      message: "Resolution remarks are required when marking a complaint as RESOLVED.",
    });
  }

  // When assigning, validate authorityId if provided
  if (upperStatus === "ASSIGNED" && authorityId && !mongoose.Types.ObjectId.isValid(authorityId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid authorityId format.",
    });
  }

  req.body.status = upperStatus;
  next();
};

/**
 * Validate Complaint Priority Update payload
 */
const validatePriorityUpdate = (req, res, next) => {
  const { priority, reason } = req.body;

  if (!priority) {
    return res.status(400).json({
      success: false,
      message: "Priority is required in request body.",
    });
  }

  const upperPriority = String(priority).toUpperCase();

  if (!VALID_PRIORITIES.includes(upperPriority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`,
    });
  }

  if (reason && typeof reason !== "string") {
    return res.status(400).json({
      success: false,
      message: "Reason must be a valid text string.",
    });
  }

  req.body.priority = upperPriority;
  next();
};

module.exports = {
  validateLogin,
  validateCreateAdmin,
  validateStatusUpdate,
  validatePriorityUpdate,
  VALID_STATUSES,
  VALID_PRIORITIES,
};
