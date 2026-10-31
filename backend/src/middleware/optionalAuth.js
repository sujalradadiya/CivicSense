const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const JWT_SECRET = process.env.JWT_SECRET || "civicsence_jwt_secret_key_2026";

/**
 * Optional Authentication Middleware
 * If token is present, populates req.user. If absent, proceeds without failing.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.id) {
      const user = await UserModel.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    // Proceed unauthenticated if token verification fails
    next();
  }
};

module.exports = optionalAuth;
