/**
 * Input Validators for Authentication and RBAC endpoints
 */

const emailRegex = /^\S+@\S+\.\S+$/;

const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Full name is required.",
    });
  }

  if (!email || !emailRegex.test(String(email).trim())) {
    return res.status(400).json({
      success: false,
      message: "A valid email address is required.",
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }

  // Allow selected role: ADMIN or USER (default to USER)
  if (req.body.role && String(req.body.role).toUpperCase() === "ADMIN") {
    req.body.role = "ADMIN";
  } else {
    req.body.role = "USER";
  }
  req.body.email = String(email).trim().toLowerCase();
  next();
};

const validateAdminSignup = (req, res, next) => {
  const { name, email, password, invitationToken } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Full name is required.",
    });
  }

  if (!email || !emailRegex.test(String(email).trim())) {
    return res.status(400).json({
      success: false,
      message: "A valid email address is required.",
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }

  if (!invitationToken || !String(invitationToken).trim()) {
    return res.status(400).json({
      success: false,
      message: "A valid invitation token is required for administrator registration.",
    });
  }

  req.body.email = String(email).trim().toLowerCase();
  req.body.invitationToken = String(invitationToken).trim();
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Both email and password are required.",
    });
  }

  req.body.email = String(email).trim().toLowerCase();
  next();
};

const validateProfileUpdate = (req, res, next) => {
  // Disallow modifying role, email, or isActive through profile API
  if (req.body.role !== undefined) {
    return res.status(400).json({
      success: false,
      message: "Modifying account role through profile update is strictly forbidden.",
    });
  }

  if (req.body.isActive !== undefined) {
    return res.status(400).json({
      success: false,
      message: "Modifying account status through profile update is not permitted.",
    });
  }

  if (req.body.email !== undefined && req.body.email !== req.user.email) {
    return res.status(400).json({
      success: false,
      message: "Email modification is not permitted via this endpoint.",
    });
  }

  next();
};

const validateCreateInvitation = (req, res, next) => {
  const { email, role } = req.body;

  if (!email || !emailRegex.test(String(email).trim())) {
    return res.status(400).json({
      success: false,
      message: "A valid invitee email address is required.",
    });
  }

  // Disallow MANAGER and restrict to ADMIN only
  if (role && role !== "ADMIN") {
    return res.status(400).json({
      success: false,
      message: "Role must be 'ADMIN'. The MANAGER role has been removed and is no longer supported.",
    });
  }

  req.body.role = "ADMIN";
  req.body.email = String(email).trim().toLowerCase();
  next();
};

module.exports = {
  validateSignup,
  validateAdminSignup,
  validateLogin,
  validateProfileUpdate,
  validateCreateInvitation,
};
