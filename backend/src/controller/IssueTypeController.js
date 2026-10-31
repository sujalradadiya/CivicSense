const mongoose = require("mongoose");
const IssueType = require("../models/IssueTypeModel");

// Create Issue Type (Now handles full complaint)
const createIssueType = async (req, res) => {
    try {
        const newIssueType = await IssueType.create(req.body);

        res.status(201).json({
            success: true,
            message: "Complaint registered successfully in issue_types",
            data: newIssueType
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create complaint",
            error: error.message
        });
    }
};


// Get All Issue Types
const getAllIssueTypes = async (req, res) => {
    try {
        const issueTypes = await IssueType.find();

        res.status(200).json({
            success: true,
            message: "Complaints fetched successfully",
            data: issueTypes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch complaints",
            error: error.message
        });
    }
};


// Get Issue Type By ID
const getIssueTypeById = async (req, res) => {
    try {
        const id = req.params.id;
        let issueType = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            issueType = await IssueType.findById(id);
        }
        if (!issueType) {
            issueType = await IssueType.findOne({ id: id });
        }

        if (!issueType) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Complaint fetched successfully",
            data: issueType
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch complaint",
            error: error.message
        });
    }
};


// Update Issue Type
const updateIssueType = async (req, res) => {
    try {
        const id = req.params.id;
        let updatedIssueType = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            updatedIssueType = await IssueType.findByIdAndUpdate(
                id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );
        }
        if (!updatedIssueType) {
            updatedIssueType = await IssueType.findOneAndUpdate(
                { id: id },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );
        }

        if (!updatedIssueType) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Complaint updated successfully",
            data: updatedIssueType
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update complaint",
            error: error.message
        });
    }
};


// Delete Issue Type
const deleteIssueType = async (req, res) => {
    try {
        const id = req.params.id;
        let deletedIssueType = null;

        // Try deleting by MongoDB _id first
        if (mongoose.Types.ObjectId.isValid(id)) {
            deletedIssueType = await IssueType.findByIdAndDelete(id);
        }

        // If not found or not a valid ObjectId, delete by custom id (e.g. CIV-546971)
        if (!deletedIssueType) {
            deletedIssueType = await IssueType.findOneAndDelete({ id: id });
        }

        if (!deletedIssueType) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Complaint deleted successfully",
            data: deletedIssueType
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete complaint",
            error: error.message
        });
    }
};


module.exports = {
    createIssueType,
    getAllIssueTypes,
    getIssueTypeById,
    updateIssueType,
    deleteIssueType
};
