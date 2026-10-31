const router = require("express").Router();
const authController = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  validateSignup,
  validateAdminSignup,
  validateLogin,
  validateProfileUpdate,
} = require("../validators/authValidator");
const { rateLimiter } = require("../middleware/RateLimiterMiddleware");

// Public Citizen Signup
router.post("/signup", rateLimiter(20, 15 * 60 * 1000), validateSignup, authController.signup);

// Administrator Signup via Single-Use Invitation Token
router.post(
  "/admin-signup",
  rateLimiter(20, 15 * 60 * 1000),
  validateAdminSignup,
  authController.adminSignup
);

// Common Login for all roles (USER, ADMIN)
router.post("/login", rateLimiter(15, 15 * 60 * 1000), validateLogin, authController.login);

// Profile API (Role-aware)
router.get("/profile", authMiddleware(), authController.getProfile);
router.put(
  "/profile",
  authMiddleware(),
  validateProfileUpdate,
  authController.updateProfile
);

module.exports = router;
