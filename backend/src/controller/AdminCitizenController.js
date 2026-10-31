const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const Issue = require("../models/IssueModel");

/**
 * Get all registered citizens with complaint statistics
 * GET /api/admin/users
 * Protected: ADMIN only
 */
const getAllCitizens = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Filter only USER role (citizens)
    const filter = { role: "USER" };

    if (city && city !== "ALL") {
      filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { contact: searchRegex },
        { city: searchRegex },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [citizens, totalCount] = await Promise.all([
      UserModel.find(filter, "-password")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      UserModel.countDocuments(filter),
    ]);

    // For each citizen, calculate total complaints submitted
    const citizensWithStats = await Promise.all(
      citizens.map(async (user) => {
        const totalComplaints = await Issue.countDocuments({ uid: user._id });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          contact: user.contact || "N/A",
          city: user.city || "N/A",
          registrationDate: user.createdAt,
          accountStatus: user.isActive ? "ACTIVE" : "INACTIVE",
          totalComplaints,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Citizens fetched successfully",
      data: citizensWithStats,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch citizens",
      error: error.message,
    });
  }
};

/**
 * View individual citizen details
 * GET /api/admin/users/:id
 * Protected: ADMIN only
 */
const getCitizenById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid citizen ID format",
      });
    }

    const citizen = await UserModel.findOne({ _id: id, role: "USER" }, "-password");

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    const totalComplaints = await Issue.countDocuments({ uid: citizen._id });
    const resolvedComplaints = await Issue.countDocuments({
      uid: citizen._id,
      status: "RESOLVED",
    });
    const pendingComplaints = await Issue.countDocuments({
      uid: citizen._id,
      status: "PENDING",
    });

    return res.status(200).json({
      success: true,
      message: "Citizen details fetched successfully",
      data: {
        id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        contact: citizen.contact,
        city: citizen.city,
        registrationDate: citizen.createdAt,
        accountStatus: citizen.isActive ? "ACTIVE" : "INACTIVE",
        statistics: {
          totalComplaints,
          resolvedComplaints,
          pendingComplaints,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch citizen details",
      error: error.message,
    });
  }
};

/**
 * View all complaints submitted by a particular citizen
 * GET /api/admin/users/:id/complaints
 * Protected: ADMIN only
 */
const getCitizenComplaints = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid citizen ID format",
      });
    }

    const citizen = await UserModel.findById(id);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    const complaints = await Issue.find({ uid: id })
      .populate("issueTypeId", "category subProblem")
      .populate("assignedAuthority", "name type city")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Citizen complaints fetched successfully",
      data: complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch citizen complaints",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCitizens,
  getCitizenById,
  getCitizenComplaints,
};
