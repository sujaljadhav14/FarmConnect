import mongoose from "mongoose";

const locationUpdateSchema = new mongoose.Schema(
    {
        transportRecordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transport",
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        transportUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        accuracy: { type: Number }, // GPS accuracy in meters
        heading: { type: Number }, // Direction of movement
        speed: { type: Number }, // Speed in km/h
        status: {
            type: String,
            enum: ["picked_up", "in_transit", "near_destination", "arrived", "delivered"],
            default: "in_transit",
        },
        address: { type: String, trim: true }, // Reverse geocoded address
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
locationUpdateSchema.index({ orderId: 1, timestamp: -1 });
locationUpdateSchema.index({ transportRecordId: 1, timestamp: -1 });
locationUpdateSchema.index({ transportUserId: 1 });

// TTL index - automatically delete location updates older than 7 days
locationUpdateSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

const LocationUpdate = mongoose.model("LocationUpdate", locationUpdateSchema);

export default LocationUpdate;
