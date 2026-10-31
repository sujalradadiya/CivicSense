const State = require("../models/StateModel");



const createState = async (req, res) => {
    try {
        const { name } = req.body;

        const state = await State.create({
            name
        });

        res.status(201).json({
            success: true,
            message: "State created successfully",
            data: state
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create state",
            error: error.message
        });
    }
};


// Get All States
const getAllStates = async (req, res) => {
    try {
        const states = await State.find();

        res.status(200).json({
            success: true,
            message: "States fetched successfully",
            data: states
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch states",
            error: error.message
        });
    }
};


// Get State By ID
const getStateById = async (req, res) => {
    try {
        const state = await State.findById(req.params.id);

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "State fetched successfully",
            data: state
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch state",
            error: error.message
        });
    }
};


// Update State
const updateState = async (req, res) => {
    try {
        const state = await State.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            {
                new: true,
                runValidators: true
            }
        );

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "State updated successfully",
            data: state
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update state",
            error: error.message
        });
    }
};


// Delete State
const deleteState = async (req, res) => {
    try {
        const state = await State.findByIdAndDelete(req.params.id);

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "State not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "State deleted successfully",
            data: state
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete state",
            error: error.message
        });
    }
};


module.exports = {
    getAllStates,
    getStateById,
    updateState,
    deleteState,
    createState,
};