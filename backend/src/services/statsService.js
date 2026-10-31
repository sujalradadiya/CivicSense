const Issue = require("../models/IssueModel");
const UserModel = require("../models/UserModel");

class StatsService {
  /**
   * Calculate real-time dashboard statistics using MongoDB aggregation
   */
  static async getDashboardStats() {
    // 1. Count registered citizens (role === 'USER')
    const totalUsers = await UserModel.countDocuments({ role: "USER" });

    // 2. Aggregate complaint statistics by status and priority in Issue collection
    const statusCounts = await Issue.aggregate([
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: { $toUpper: "$status" },
                count: { $sum: 1 },
              },
            },
          ],
          byPriority: [
            {
              $group: {
                _id: { $toUpper: "$priority" },
                count: { $sum: 1 },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const facet = statusCounts[0] || { byStatus: [], byPriority: [], total: [] };

    const totalComplaints = facet.total[0] ? facet.total[0].count : 0;

    const statusMap = {};
    facet.byStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    const priorityMap = {};
    facet.byPriority.forEach((item) => {
      priorityMap[item._id] = item.count;
    });

    // Extract status counts
    const pending = statusMap["PENDING"] || 0;
    const verified = statusMap["VERIFIED"] || 0;
    const assigned = statusMap["ASSIGNED"] || 0;
    const underReview = statusMap["UNDER_REVIEW"] || assigned;
    const inProgress = statusMap["IN_PROGRESS"] || 0;
    const resolved = statusMap["RESOLVED"] || 0;
    const rejected = statusMap["REJECTED"] || 0;

    // High priority includes HIGH and CRITICAL
    const highPriority =
      (priorityMap["HIGH"] || 0) + (priorityMap["CRITICAL"] || 0);

    return {
      totalUsers,
      totalComplaints,
      pending,
      verified,
      underReview,
      inProgress,
      resolved,
      rejected,
      highPriority,
    };
  }
}

module.exports = StatsService;
