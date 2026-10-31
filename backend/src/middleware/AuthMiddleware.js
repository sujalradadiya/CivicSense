const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const JWT_SECRET = process.env.JWT_SECRET || "civicsence_jwt_secret_key_2026";

/**
 * Reusable JWT and Role-Based Access Control (RBAC) middleware
 *
 * Usage:
 *   authMiddleware()           // Any authenticated active user
 *   authMiddleware("USER")     // Citizen only
 *   authMiddleware("ADMIN")    // Admin only
 *
 * @param  {...string} allowedRoles Allowed account roles ("USER", "ADMIN")
 */
const authMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Bearer token missing.",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Invalid authorization format. Expected 'Bearer <token>'.",
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Authentication token has expired. Please log in again.",
          });
        }
        return res.status(401).json({
          success: false,
          message: "Invalid or malformed authentication token.",
        });
      }

      if (!decoded || !decoded.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload.",
        });
      }

      // Crucial: Always retrieve fresh user record from MongoDB
      // Never blindly trust an outdated role stored in an old token!
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User account no longer exists.",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account is deactivated. Access denied.",
        });
      }

      const actualRole = user.role || "USER";

      // Verify role authorization if specific roles were specified
      if (allowedRoles.length > 0 && !allowedRoles.includes(actualRole)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access restricted to [${allowedRoles.join(", ")}]. Your current role is '${actualRole}'.`,
        });
      }

      // Attach fresh user document to req.user
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal authentication error",
        error: error.message,
      });
    }
  };
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
