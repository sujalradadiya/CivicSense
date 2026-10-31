const AuditLog = require("../models/AuditLog");

class AuditLogService {
  /**
   * Record an audit log entry
   */
  static async recordLog({
    action,
    targetType,
    targetId,
    performedBy,
    performedByRole = "",
    performedByEmail = "",
    previousValue = null,
    newValue = null,
    remarks = "",
    metadata = {},
  }) {
    try {
      const log = await AuditLog.create({
        action,
        targetType,
        targetId: String(targetId),
        performedBy,
        performedByRole,
        performedByEmail,
        details: {
          previousValue,
          newValue,
          remarks,
          metadata,
        },
        timestamp: new Date(),
      });
      return log;
    } catch (error) {
      console.error("Audit log write error:", error.message);
      return null;
    }
  }

  /**
   * Get all audit logs with optional filtering
   */
  static async getLogs(filter = {}, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("performedBy", "name email role")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}

module.exports = AuditLogService;
