import mongoose from "mongoose";

const cropSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cropName: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["Grains", "Vegetables", "Fruits", "Pulses", "Spices", "Other"],
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            required: true,
            enum: ["kg", "quintal", "ton", "piece"],
            default: "kg",
        },
        pricePerUnit: {
            type: Number,
            required: true,
            min: 0,
        },
        quality: {
            type: String,
            enum: ["A+", "A", "B", "C"],
            default: "A",
        },
        harvestDate: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        availabilityDate: {
            type: Date,
            default: Date.now,
        },
        images: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ["Available", "Reserved", "Sold", "Unavailable"],
            default: "Available",
        },
        reservedQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true
    }
);

// Virtual field for available quantity
cropSchema.virtual("availableQuantity").get(function () {
    return this.quantity - this.reservedQuantity;
});

// Ensure virtuals are included in JSON output
cropSchema.set("toJSON", { virtuals: true });
cropSchema.set("toObject", { virtuals: true });

const Crop = mongoose.model("Crop", cropSchema);

export default Crop;
