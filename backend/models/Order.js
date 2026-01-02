import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        cropId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Crop",
            required: true,
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        traderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        transportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        pricePerUnit: {
            type: Number,
            required: true,
            min: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryAddress: {
            type: String,
            required: true,
            trim: true,
        },
        paymentMethod: {
            type: String,
            enum: ["Advance", "Full", "COD"],
            default: "Advance", // Default to 30/70 split
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Advance Paid", "Full Paid", "Failed"],
            default: "Pending",
        },
        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Farmer Agreed",       // Farmer signed agreement
                "Both Agreed",         // Both parties signed
                "Awaiting Advance",    // Waiting for 30% payment
                "Advance Paid",        // 30% received
                "Accepted",            // Legacy - maps to Advance Paid
                "Rejected",
                "Ready for Pickup",
                "Transport Assigned",  // Transport selected
                "In Transit",
                "Delivered",
                "Awaiting Final Payment", // Waiting for 70% + transport
                "Cancelled",
                "Completed",
            ],
            default: "Pending",
        },
        // Agreement Tracking
        agreementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agreement",
        },
        agreementStatus: {
            type: String,
            enum: ["none", "pending_farmer", "pending_trader", "completed"],
            default: "none",
        },
        // Payment Breakdown
        advanceAmount: { type: Number, default: 0 },      // 30% of totalPrice
        advancePaid: { type: Boolean, default: false },
        finalAmount: { type: Number, default: 0 },        // 70% of totalPrice
        finalPaid: { type: Boolean, default: false },
        transportCost: { type: Number, default: 0 },      // Transport fee
        transportPaid: { type: Boolean, default: false },
        totalPayable: { type: Number, default: 0 },       // totalPrice + transportCost
        orderDate: {
            type: Date,
            default: Date.now,
        },
        deliveryDate: {
            type: Date,
            default: null,
        },
        expectedDeliveryDate: {
            type: Date,
            required: true,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        rejectionReason: {
            type: String,
            trim: true,
        },
        cancellationReason: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Note: Payment amounts (advanceAmount, finalAmount, totalPayable) are calculated
// when the order is created or updated in the controller

// Index for better query performance
orderSchema.index({ farmerId: 1, orderStatus: 1 });
orderSchema.index({ traderId: 1, orderStatus: 1 });
orderSchema.index({ transportId: 1, orderStatus: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
