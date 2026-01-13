import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

// Create a new transaction
export const createTransaction = async (req, res) => {
    try {
        const { orderId, proposalId, type, amount, paymentMethod, description, bankDetails, metadata } = req.body;
        const userId = req.user._id;

        const transaction = new Transaction({
            userId,
            orderId,
            proposalId,
            type,
            amount,
            paymentMethod,
            description,
            bankDetails,
            metadata,
        });

        await transaction.save();

        res.status(201).json({
            message: "Transaction created successfully",
            transaction,
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Error creating transaction", error: error.message });
    }
};

// Get user's transactions
export const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { type, status, startDate, endDate, page = 1, limit = 20 } = req.query;

        const query = { userId };
        if (type) query.type = type;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate("orderId", "orderNumber status")
                .populate("proposalId", "status totalAmount")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query),
        ]);

        res.json({
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Error fetching transactions", error: error.message });
    }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user._id;

        const transaction = await Transaction.findOne({ _id: transactionId, userId })
            .populate("orderId")
            .populate("proposalId");

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ message: "Error fetching transaction", error: error.message });
    }
};

// Get transaction by reference number
export const getTransactionByReference = async (req, res) => {
    try {
        const { referenceNumber } = req.params;

        const transaction = await Transaction.findOne({ referenceNumber })
            .populate("userId", "name phone")
            .populate("orderId");

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({ message: "Error fetching transaction", error: error.message });
    }
};

// Update transaction status (e.g., after Razorpay callback)
export const updateTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status, razorpayPaymentId, razorpaySignature, failureReason } = req.body;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        transaction.status = status;
        if (razorpayPaymentId) transaction.razorpayPaymentId = razorpayPaymentId;
        if (razorpaySignature) transaction.razorpaySignature = razorpaySignature;
        if (failureReason) transaction.failureReason = failureReason;
        if (status === "completed") transaction.completedAt = new Date();

        await transaction.save();

        res.json({
            message: "Transaction updated successfully",
            transaction,
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Error updating transaction", error: error.message });
    }
};

// Get transaction summary/statistics
export const getTransactionStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate } = req.query;

        const matchStage = { userId: new mongoose.Types.ObjectId(userId), status: "completed" };
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) matchStage.createdAt.$lte = new Date(endDate);
        }

        const stats = await Transaction.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" },
                },
            },
        ]);

        const overall = await Transaction.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalTransactions: { $sum: 1 },
                    totalAmount: { $sum: "$amount" },
                },
            },
        ]);

        res.json({
            byType: stats,
            overall: overall[0] || { totalTransactions: 0, totalAmount: 0 },
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Error fetching statistics", error: error.message });
    }
};

// Admin: Get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (type) query.type = type;
        if (status) query.status = status;

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate("userId", "name phone role")
                .populate("orderId", "orderNumber")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query),
        ]);

        res.json({
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Error fetching transactions", error: error.message });
    }
};
