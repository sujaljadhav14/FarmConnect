import mongoose from "mongoose";

const transportSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
        },
        transportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        pickupLocation: {
            type: String,
            required: true,
            trim: true,
        },
        deliveryLocation: {
            type: String,
            required: true,
            trim: true,
        },
        distance: {
            type: Number,
            min: 0,
        },
        estimatedTime: {
            type: String,
        },
        deliveryFee: {
            type: Number,
            required: true,
            min: 0,
        },
        vehicleType: {
            type: String,
            enum: ["Bike", "Auto", "Tempo", "Truck", "Other"],
            default: "Tempo",
        },
        vehicleNumber: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Assigned", "Picked Up", "In Transit", "Delivered", "Failed"],
            default: "Assigned",
        },
        pickupTime: {
            type: Date,
        },
        deliveryTime: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Index for better query performance
transportSchema.index({ transportId: 1, status: 1 });
transportSchema.index({ orderId: 1 });

const Transport = mongoose.model("Transport", transportSchema);

export default Transport;
