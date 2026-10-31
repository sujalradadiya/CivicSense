const authMiddleware = require("./authMiddleware");

// Export RBAC middleware wrappers for backward compatibility
module.exports = {
  verifyAdminToken: authMiddleware("ADMIN"),
  authorizeRoles: (...roles) => authMiddleware(...roles),
};
