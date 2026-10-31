const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const InvitationService = require("../services/invitationService");
const AuditLogService = require("../services/auditLogService");

const JWT_SECRET = process.env.JWT_SECRET || "civicsence_jwt_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate JWT for authenticated user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Citizen Registration
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, contact, city } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Hash password with bcrypt
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Allow role selection: USER or ADMIN (default to USER)
    const assignedRole =
      req.body.role && String(req.body.role).toUpperCase() === "ADMIN"
        ? "ADMIN"
        : "USER";

    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      contact: contact && String(contact).trim() ? String(contact).trim() : undefined,
      city: city ? String(city).trim() : "",
      role: assignedRole,
      isActive: true,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Citizen registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        contact: newUser.contact,
        city: newUser.city,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "email";
      return res.status(400).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to register account",
      error: error.message,
    });
  }
};

/**
 * Administrator Signup via Single-Use Invitation Token
 * POST /api/auth/admin-signup
 */
const adminSignup = async (req, res) => {
  try {
    const { name, email, password, contact, city, invitationToken } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Validate the invitation token against MongoDB
    const invitation = await InvitationService.validateToken(
      invitationToken,
      normalizedEmail
    );

    // Check duplicate user
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create administrator with ADMIN role assigned in the invitation
    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      contact: contact && String(contact).trim() ? String(contact).trim() : undefined,
      city: city ? String(city).trim() : "",
      role: "ADMIN",
      isActive: true,
    });

    // Mark invitation as single-use consumed
    await InvitationService.consumeInvitation(invitation._id, newUser._id);

    // Record audit log
    await AuditLogService.recordLog({
      action: "ADMIN_REGISTERED",
      targetType: "USER",
      targetId: newUser._id,
      performedBy: newUser._id,
      performedByRole: newUser.role,
      performedByEmail: newUser.email,
      newValue: { role: newUser.role, email: newUser.email },
      remarks: "Administrator account created via verified invitation",
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Administrator registered successfully via invitation",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        contact: newUser.contact,
        city: newUser.city,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to complete administrator registration",
    });
  }
};

/**
 * Common Login API for all active roles (USER, ADMIN)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email).toLowerCase().trim();

    // Find user by email
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password with bcrypt
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact an administrator.",
      });
    }

    // Retrieve actual role from MongoDB
    const role = user.role || "USER";

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        city: user.city,
        role: role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login processing failed",
      error: error.message,
    });
  }
};

/**
 * Get Profile of Authenticated User
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        city: user.city,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
};

/**
 * Update Permitted Profile Information
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, contact, city } = req.body;
    const userId = req.user._id;

    const updateFields = {};
    if (name && name.trim()) updateFields.name = name.trim();
    if (contact !== undefined) updateFields.contact = String(contact).trim();
    if (city !== undefined) updateFields.city = String(city).trim();

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { returnDocument: "after", runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        contact: updatedUser.contact,
        city: updatedUser.city,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  signup,
  adminSignup,
  login,
  getProfile,
  updateProfile,
};
