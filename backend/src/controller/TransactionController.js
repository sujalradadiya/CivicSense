const mongoose = require("mongoose");
const Transaction = require("../models/TransactionModel");


const createTransaction = async (req, res) => {
    try {
        const {
            issueId,
            userId,
            authorityId
        } = req.body;

        const transaction = await Transaction.create({
            issueId,
            userId,
            authorityId
        });

        res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create transaction",
            error: error.message
        });
    }
};

// Get All Transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate("issueId")
            .populate("userId")
            .populate("authorityId");

        res.status(200).json({
            success: true,
            message: "Transactions fetched successfully",
            data: transactions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions",
            error: error.message
        });
    }
};


// Get Transaction By ID
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID"
            });
        }

        const transaction = await Transaction.findById(id)
            .populate("issueId")
            .populate("userId")
            .populate("authorityId");

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction fetched successfully",
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction",
            error: error.message
        });
    }
};


// Update Transaction Status
const updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID"
            });
        }

        const transaction = await Transaction.findByIdAndUpdate(
            id,
            { status },
            {
                new: true,
                runValidators: true
            }
        )
        .populate("issueId")
        .populate("userId")
        .populate("authorityId");

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction status updated successfully",
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update transaction status",
            error: error.message
        });
    }
};


// Delete Transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID"
            });
        }

        const transaction = await Transaction.findByIdAndDelete(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete transaction",
            error: error.message
        });
    }
};


module.exports = {
    getAllTransactions,
    getTransactionById,
    updateTransactionStatus,
    deleteTransaction,
    createTransaction,  
};