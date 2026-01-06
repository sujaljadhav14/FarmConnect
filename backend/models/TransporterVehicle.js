import mongoose from "mongoose";

const transporterVehicleSchema = new mongoose.Schema(
    {
        transporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        vehicleName: {
            type: String,
            required: true,
            trim: true,
        },
        vehicleNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        vehicleType: {
            type: String,
            enum: ["Bike", "Auto", "Tempo", "Truck", "Mini Truck", "Other"],
            required: true,
        },
        // Weight Slab Categories
        weightSlab: {
            minWeight: {
                type: Number,
                required: true,
                min: 0,
            },
            maxWeight: {
                type: Number,
                required: true,
                min: 1,
            },
            unit: {
                type: String,
                enum: ["kg", "quintal", "ton"],
                default: "kg",
            },
        },
        // Vehicle Specifications
        yearOfManufacture: {
            type: Number,
            required: true,
        },
        registrationCertificate: {
            type: String,
            trim: true,
        },
        insuranceCertificate: {
            type: String,
            trim: true,
        },
        pollutionCertificate: {
            type: String,
            trim: true,
        },
        vehicleImage: {
            type: String,
            trim: true,
        },
        // Capacity Details
        loadCapacity: {
            type: Number,
            min: 0,
        },
        loadCapacityUnit: {
            type: String,
            enum: ["kg", "quintal", "ton"],
            default: "kg",
        },
        // Availability
        isActive: {
            type: Boolean,
            default: true,
        },
        availabilityStatus: {
            type: String,
            enum: ["available", "on_delivery", "maintenance", "inactive"],
            default: "available",
        },
        // Maintenance Records
        lastMaintenanceDate: {
            type: Date,
        },
        nextMaintenanceDate: {
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

// // Indexes for better performance
// transporterVehicleSchema.index({ transporterId: 1 });
// transporterVehicleSchema.index({ vehicleNumber: 1 });
// transporterVehicleSchema.index({ transporterId: 1, isActive: 1 });
// transporterVehicleSchema.index({ "weightSlab.minWeight": 1, "weightSlab.maxWeight": 1 });

const TransporterVehicle = mongoose.model("TransporterVehicle", transporterVehicleSchema);

export default TransporterVehicle;
