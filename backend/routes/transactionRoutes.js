import express from "express";
import {
    createTransaction,
    getUserTransactions,
    getTransactionById,
    getTransactionByReference,
    updateTransactionStatus,
    getTransactionStats,
    getAllTransactions,
} from "../controllers/transactionController.js";
import { requireSignIn } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// User routes
router.post("/", createTransaction);                              // Create transaction
router.get("/", getUserTransactions);                             // Get user's transactions
router.get("/stats", getTransactionStats);                        // Get statistics
router.get("/reference/:referenceNumber", getTransactionByReference); // Find by reference
router.get("/:transactionId", getTransactionById);                // Get by ID

// Update routes
router.patch("/:transactionId/status", updateTransactionStatus);  // Update status (Razorpay callback)

// Admin routes
router.get("/admin/all", getAllTransactions);                     // Admin: Get all transactions

export default router;
