const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

// Controllers
const adminAuthController = require("../controller/adminAuthController");
const AdminComplaintController = require("../controller/AdminComplaintController");
const AdminCitizenController = require("../controller/AdminCitizenController");
const AdminStatsController = require("../controller/AdminStatsController");

// Validators
const { validateCreateInvitation } = require("../validators/authValidator");
const {
  validateStatusUpdate,
  validatePriorityUpdate,
} = require("../validators/AdminValidator");

// ==========================================
// 1. DASHBOARD STATISTICS
// Accessible by: ADMIN only
// ==========================================
router.get("/stats", authMiddleware("ADMIN"), AdminStatsController.getDashboardStats);
router.get("/dashboard", authMiddleware("ADMIN"), AdminStatsController.getDashboardStats);

// ==========================================
// 2. CITIZEN MANAGEMENT
// Accessible by: ADMIN only
// ==========================================
router.get("/users", authMiddleware("ADMIN"), AdminCitizenController.getAllCitizens);
router.get("/users/:id", authMiddleware("ADMIN"), AdminCitizenController.getCitizenById);
router.get("/users/:id/complaints", authMiddleware("ADMIN"), AdminCitizenController.getCitizenComplaints);
router.patch("/users/:id/status", authMiddleware("ADMIN"), adminAuthController.updateUserStatus);

// ==========================================
// 3. COMPLAINTS MANAGEMENT
// Accessible by: ADMIN only
// ==========================================
router.get("/complaints", authMiddleware("ADMIN"), AdminComplaintController.getAllComplaints);
router.get("/complaints/:id", authMiddleware("ADMIN"), AdminComplaintController.getComplaintById);
router.get("/complaints/:id/history", authMiddleware("ADMIN"), AdminComplaintController.getComplaintHistory);
router.get("/complaints/:id/ai-analysis", authMiddleware("ADMIN"), AdminComplaintController.getComplaintAIAnalysis);
router.patch(
  "/complaints/:id/status",
  authMiddleware("ADMIN"),
  validateStatusUpdate,
  AdminComplaintController.updateComplaintStatus
);
router.patch(
  "/complaints/:id/priority",
  authMiddleware("ADMIN"),
  validatePriorityUpdate,
  AdminComplaintController.updateComplaintPriority
);

// ==========================================
// 4. INVITATIONS & STAFF MANAGEMENT
// Accessible by: ADMIN only
// ==========================================
router.post(
  "/invitations",
  authMiddleware("ADMIN"),
  validateCreateInvitation,
  adminAuthController.createInvitation
);
router.get("/invitations", authMiddleware("ADMIN"), adminAuthController.getInvitations);
router.get("/staff", authMiddleware("ADMIN"), adminAuthController.getAllStaff);
router.get("/audit-logs", authMiddleware("ADMIN"), adminAuthController.getAuditLogs);

module.exports = router;
