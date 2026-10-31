const StatsService = require("../services/statsService");

/**
 * Get real-time dashboard statistics
 * GET /api/admin/stats
 * Roles: ADMIN only
 */
const getDashboardStats = async (req, res) => {
  try {
    const stats = await StatsService.getDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
