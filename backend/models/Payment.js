import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        type: {
            type: String,
            enum: ["advance", "final", "transport"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        percentage: {
            type: Number,
            enum: [30, 70, 100], // 30% advance, 70% final, or 100% for transport
        },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed", "refunded"],
            default: "pending",
        },
        // Razorpay Details
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        // Payment Parties
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        paidTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        paidAt: { type: Date },
        // Additional Details
        description: { type: String, trim: true },
        failureReason: { type: String, trim: true },
        refundedAt: { type: Date },
        refundReason: { type: String, trim: true },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
paymentSchema.index({ orderId: 1, type: 1 });
paymentSchema.index({ paidBy: 1 });
paymentSchema.index({ paidTo: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
