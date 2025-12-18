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
            default: "Full",
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
                "Accepted",
                "Rejected",
                "Ready for Pickup",
                "In Transit",
                "Delivered",
                "Cancelled",
                "Completed",
            ],
            default: "Pending",
        },
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

// Index for better query performance
orderSchema.index({ farmerId: 1, orderStatus: 1 });
orderSchema.index({ traderId: 1, orderStatus: 1 });
orderSchema.index({ transportId: 1, orderStatus: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
