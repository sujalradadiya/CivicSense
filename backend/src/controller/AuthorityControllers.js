const mongoose = require("mongoose");
const Authority = require("../models/AuthorityModel");

// Create Authority
const createAuthority = async (req, res) => {
    try {
        const {
            name,
            type,
            city,
            stateId,
            email,
            phone
        } = req.body;

        // Check required fields
        if (!name || !type || !city || !stateId) {
            return res.status(400).json({
                success: false,
                message: "Name, type, city and stateId are required"
            });
        }

        // Validate stateId
        if (!mongoose.Types.ObjectId.isValid(stateId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid stateId"
            });
        }

        const authority = await Authority.create({
            name,
            type,
            city,
            stateId,
            email,
            phone
        });

        res.status(201).json({
            success: true,
            message: "Authority created successfully",
            data: authority
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create authority",
            error: error.message
        });
    }
};


// Get All Authorities
const getAllAuthorities = async (req, res) => {
    try {
        const authorities = await Authority.find()
            .populate("stateId");

        res.status(200).json({
            success: true,
            message: "Authorities fetched successfully",
            data: authorities
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch authorities",
            error: error.message
        });
    }
};


// Get Authority By ID
const getAuthorityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid authority ID"
            });
        }

        const authority = await Authority.findById(id)
            .populate("stateId");

        if (!authority) {
            return res.status(404).json({
                success: false,
                message: "Authority not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Authority fetched successfully",
            data: authority
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch authority",
            error: error.message
        });
    }
};


// Update Authority
const updateAuthority = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid authority ID"
            });
        }

        const {
            name,
            type,
            city,
            stateId,
            email,
            phone
        } = req.body;

        // Validate stateId only if provided
        if (stateId && !mongoose.Types.ObjectId.isValid(stateId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid stateId"
            });
        }

        const authority = await Authority.findByIdAndUpdate(
            id,
            {
                name,
                type,
                city,
                stateId,
                email,
                phone
            },
            {
                new: true,
                runValidators: true
            }
        ).populate("stateId");

        if (!authority) {
            return res.status(404).json({
                success: false,
                message: "Authority not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Authority updated successfully",
            data: authority
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update authority",
            error: error.message
        });
    }
};


// Delete Authority
const deleteAuthority = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid authority ID"
            });
        }

        const authority = await Authority.findByIdAndDelete(id);

        if (!authority) {
            return res.status(404).json({
                success: false,
                message: "Authority not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Authority deleted successfully",
            data: authority
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete authority",
            error: error.message
        });
    }
};


module.exports = {
    createAuthority,
    getAllAuthorities,
    getAuthorityById,
    updateAuthority,
    deleteAuthority
};