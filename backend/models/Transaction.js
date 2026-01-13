import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        // User associated with this transaction
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Related order (if applicable)
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },

        // Related proposal (if applicable)
        proposalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Proposal",
        },

        // Transaction type
        type: {
            type: String,
            enum: [
                "booking_payment",      // 10% booking amount
                "platform_fee",         // ₹1/kg platform charge
                "full_payment",         // 100% payment at dispatch
                "refund",               // Refund (if applicable)
                "payout",               // Payout to farmer
                "commission",           // Commission deduction
            ],
            required: true,
        },

        // Amount in INR
        amount: {
            type: Number,
            required: true,
        },

        // Transaction status
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed", "refunded"],
            default: "pending",
        },

        // Payment method
        paymentMethod: {
            type: String,
            enum: ["razorpay", "bank_transfer", "upi", "cash"],
            default: "razorpay",
        },

        // Razorpay specific fields
        razorpayOrderId: {
            type: String,
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },

        // Description of transaction
        description: {
            type: String,
            trim: true,
        },

        // Reference number for tracking
        referenceNumber: {
            type: String,
            unique: true,
            sparse: true,
        },

        // Bank transfer details (for payouts)
        bankDetails: {
            accountNumber: String,
            accountName: String,
            bankName: String,
            ifscCode: String,
        },

        // Additional metadata
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },

        // When payment was completed
        completedAt: {
            type: Date,
        },

        // Failure reason (if any)
        failureReason: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ referenceNumber: 1 });

// Generate reference number before save
transactionSchema.pre("save", function (next) {
    if (!this.referenceNumber && this.isNew) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.referenceNumber = `TXN-${timestamp}-${random}`;
    }
    next();
});

// Virtual for formatted amount
transactionSchema.virtual("formattedAmount").get(function () {
    return `₹${this.amount.toLocaleString("en-IN")}`;
});

// Ensure virtuals are included in JSON output
transactionSchema.set("toJSON", { virtuals: true });
transactionSchema.set("toObject", { virtuals: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
