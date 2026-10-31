const mongoose = require("mongoose");
const Issue = require("../models/IssueModel");
const IssueType = require("../models/IssueTypeModel");
const UserModel = require("../models/UserModel");
const AuditLogService = require("./auditLogService");
const PriorityService = require("./PriorityService");

class ComplaintService {
  /**
   * Helper to generate a unique CivicSense Complaint ID
   */
  static generateComplaintId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `CIV-${randomNum}`;
  }

  /**
   * Fetch all complaints with advanced filtering, searching, and pagination
   */
  static async getAllComplaints(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      city,
      priority,
      search,
      citizenName,
      complaintId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Filter by status
    if (status && status !== "ALL") {
      query.status = String(status).toUpperCase();
    }

    // Filter by city
    if (city && city !== "ALL") {
      query.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    // Filter by priority
    if (priority && priority !== "ALL") {
      query.priority = String(priority).toUpperCase();
    }

    // Filter by complaint ID
    if (complaintId) {
      query.$or = [
        { complaintId: { $regex: complaintId, $options: "i" } },
        ...(mongoose.Types.ObjectId.isValid(complaintId)
          ? [{ _id: complaintId }]
          : []),
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // General text search (title, details, city, complaintId)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { issueTitle: searchRegex },
        { issueDetails: searchRegex },
        { city: searchRegex },
        { complaintId: searchRegex },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with population
    const [issues, totalCount] = await Promise.all([
      Issue.find(query)
        .populate("uid", "name email contact city")
        .populate("issueTypeId", "category subProblem")
        .populate("stateId", "name")
        .populate("assignedAuthority", "name type city phone email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Issue.countDocuments(query),
    ]);

    // Also check if citizenName filter was provided
    let filteredIssues = issues;
    if (citizenName && citizenName.trim()) {
      const regex = new RegExp(citizenName.trim(), "i");
      filteredIssues = issues.filter(
        (issue) => issue.uid && regex.test(issue.uid.name)
      );
    }

    // Format complaints for admin view
    const formattedComplaints = filteredIssues.map((issue) => {
      const citizen = issue.uid || {};
      const issueType = issue.issueTypeId || {};

      return {
        id: issue._id,
        complaintId: issue.complaintId || `CIV-${String(issue._id).slice(-6).toUpperCase()}`,
        citizenName: citizen.name || "Anonymous Citizen",
        citizenEmail: citizen.email || "N/A",
        citizenContact: citizen.contact || "N/A",
        city: issue.city || citizen.city || "Unknown",
        category: issueType.category || "General Civic",
        subProblem: issueType.subProblem || "",
        complaintTitle: issue.issueTitle,
        complaintDescription: issue.issueDetails,
        images: issue.images || [],
        location: issue.location || issue.city,
        coordinates: issue.coordinates || null,
        submissionDate: issue.createdAt,
        currentStatus: issue.status,
        verified: issue.verified,
        priority: issue.priority || PriorityService.evaluatePriority(issue),
        assignedAuthority: issue.assignedAuthority || null,
        rejectionReason: issue.rejectionReason || null,
        resolutionRemarks: issue.resolutionRemarks || null,
        evidenceImages: issue.evidenceImages || [],
        aiAnalysis: issue.aiAnalysis || null,
        historyCount: issue.history ? issue.history.length : 0,
      };
    });

    return {
      complaints: formattedComplaints,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    };
  }

  /**
   * Get single complaint by ID with full details and history
   */
  static async getComplaintById(complaintId) {
    let issue = null;

    if (mongoose.Types.ObjectId.isValid(complaintId)) {
      issue = await Issue.findById(complaintId)
        .populate("uid", "name email contact city createdAt")
        .populate("issueTypeId")
        .populate("stateId", "name")
        .populate("assignedAuthority");
    }

    if (!issue) {
      issue = await Issue.findOne({ complaintId: complaintId })
        .populate("uid", "name email contact city createdAt")
        .populate("issueTypeId")
        .populate("stateId", "name")
        .populate("assignedAuthority");
    }

    // If not found in Issue, check IssueType collection for fallback
    if (!issue) {
      const issueType = await IssueType.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(complaintId) ? [{ _id: complaintId }] : []),
          { id: complaintId },
        ],
      });

      if (!issueType) {
        return null;
      }

      return {
        id: issueType._id,
        complaintId: issueType.id || `CIV-${String(issueType._id).slice(-6).toUpperCase()}`,
        citizenName: issueType.reportedBy || "Citizen",
        citizenEmail: issueType.userEmail || "N/A",
        citizenContact: issueType.userContact || "N/A",
        city: issueType.city || "Unknown",
        category: issueType.category || "General",
        subProblem: issueType.subProblem || "",
        complaintTitle: `${issueType.category} - ${issueType.subProblem || "Issue"}`,
        complaintDescription: issueType.description || "",
        images: [],
        location: issueType.location || issueType.landmark || issueType.city,
        submissionDate: issueType.createdAt,
        currentStatus: issueType.status || "PENDING",
        priority: issueType.priority || PriorityService.evaluatePriority(issueType),
        assignedAuthority: null,
        history: issueType.history || [],
      };
    }

    const citizen = issue.uid || {};
    const cat = issue.issueTypeId || {};

    return {
      id: issue._id,
      complaintId: issue.complaintId || `CIV-${String(issue._id).slice(-6).toUpperCase()}`,
      citizenName: citizen.name || "Anonymous",
      citizenEmail: citizen.email || "N/A",
      citizenContact: citizen.contact || "N/A",
      city: issue.city || citizen.city,
      category: cat.category || "General",
      subProblem: cat.subProblem || "",
      complaintTitle: issue.issueTitle,
      complaintDescription: issue.issueDetails,
      images: issue.images || [],
      location: issue.location || issue.city,
      coordinates: issue.coordinates || null,
      submissionDate: issue.createdAt,
      currentStatus: issue.status,
      verified: issue.verified,
      priority: issue.priority || PriorityService.evaluatePriority(issue),
      assignedAuthority: issue.assignedAuthority || null,
      rejectionReason: issue.rejectionReason,
      resolutionRemarks: issue.resolutionRemarks,
      evidenceImages: issue.evidenceImages || [],
      aiAnalysis: issue.aiAnalysis || null,
      history: issue.history || [],
    };
  }

  /**
   * Update Complaint Status with Audit Trail
   */
  static async updateStatus(complaintId, status, remarks, adminUser, options = {}) {
    let issue = null;
    if (mongoose.Types.ObjectId.isValid(complaintId)) {
      issue = await Issue.findById(complaintId);
    }
    if (!issue) {
      issue = await Issue.findOne({ complaintId });
    }

    if (!issue) {
      // Check IssueType collection
      const issueType = await IssueType.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(complaintId) ? [{ _id: complaintId }] : []),
          { id: complaintId },
        ],
      });

      if (!issueType) {
        throw new Error("Complaint not found.");
      }

      const previousStatus = issueType.status || "PENDING";
      issueType.status = status;
      if (remarks) issueType.resolutionRemarks = remarks;
      issueType.history = issueType.history || [];
      issueType.history.push({
        action: "STATUS_CHANGE",
        previousStatus,
        newStatus: status,
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        remarks: remarks || "",
        timestamp: new Date(),
      });
      await issueType.save();

      await AuditLogService.recordLog({
        action: "STATUS_CHANGE",
        targetType: "ISSUE",
        targetId: issueType._id,
        performedBy: adminUser._id,
        performedByRole: adminUser.role,
        performedByEmail: adminUser.email,
        previousValue: { status: previousStatus },
        newValue: { status },
        remarks,
      });

      return issueType;
    }

    const previousStatus = issue.status;
    issue.status = status;

    if (status === "VERIFIED") {
      issue.verified = true;
    } else if (status === "REJECTED") {
      issue.rejectionReason = remarks;
    } else if (status === "RESOLVED") {
      issue.resolutionRemarks = remarks;
      if (options.evidenceImages && Array.isArray(options.evidenceImages)) {
        issue.evidenceImages = options.evidenceImages;
      }
    } else if (status === "ASSIGNED" && options.authorityId) {
      issue.assignedAuthority = options.authorityId;
    }

    // Append to internal history
    issue.history = issue.history || [];
    issue.history.push({
      action: "STATUS_CHANGE",
      previousStatus,
      newStatus: status,
      adminId: adminUser._id,
      adminName: adminUser.name,
      adminEmail: adminUser.email,
      remarks: remarks || "",
      timestamp: new Date(),
    });

    await issue.save();

    // Also synchronize status in corresponding IssueType if linked
    if (issue.issueTypeId) {
      try {
        await IssueType.findByIdAndUpdate(issue.issueTypeId, {
          $set: { status },
        });
      } catch (e) {
        // Non-critical sync
      }
    }

    // Record audit log entry
    await AuditLogService.recordLog({
      action: "STATUS_CHANGE",
      targetType: "ISSUE",
      targetId: issue._id,
      performedBy: adminUser._id,
      performedByRole: adminUser.role,
      performedByEmail: adminUser.email,
      previousValue: { status: previousStatus },
      newValue: { status },
      remarks,
    });

    return issue;
  }

  /**
   * Update Complaint Priority with Audit Trail
   */
  static async updatePriority(complaintId, priority, reason, adminUser) {
    let issue = null;
    if (mongoose.Types.ObjectId.isValid(complaintId)) {
      issue = await Issue.findById(complaintId);
    }
    if (!issue) {
      issue = await Issue.findOne({ complaintId });
    }

    if (!issue) {
      throw new Error("Complaint not found.");
    }

    const previousPriority = issue.priority || "MEDIUM";
    issue.priority = priority;

    issue.history = issue.history || [];
    issue.history.push({
      action: "PRIORITY_CHANGE",
      previousPriority,
      newPriority: priority,
      adminId: adminUser._id,
      adminName: adminUser.name,
      adminEmail: adminUser.email,
      remarks: reason || `Priority changed to ${priority}`,
      timestamp: new Date(),
    });

    await issue.save();

    await AuditLogService.recordLog({
      action: "PRIORITY_CHANGE",
      targetType: "ISSUE",
      targetId: issue._id,
      performedBy: adminUser._id,
      performedByRole: adminUser.role,
      performedByEmail: adminUser.email,
      previousValue: { priority: previousPriority },
      newValue: { priority },
      remarks: reason,
    });

    return issue;
  }
}

module.exports = ComplaintService;
