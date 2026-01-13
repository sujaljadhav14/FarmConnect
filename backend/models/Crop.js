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
        // NEW: Crop variety (e.g., Alphonso for Mango)
        variety: {
            type: String,
            trim: true,
        },
        // NEW: Land under cultivation for this crop (in acres)
        landUnderCultivation: {
            type: Number,
            min: 0,
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
        // NEW: Expected price per unit (farmer's expectation)
        expectedPricePerUnit: {
            type: Number,
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
        // NEW: Expected harvest date (before actual harvest)
        expectedHarvestDate: {
            type: Date,
        },
        // NEW: Cultivation start date
        cultivationDate: {
            type: Date,
        },
        // UPDATED: Structured location object
        location: {
            type: String,
            trim: true,
        },
        // NEW: Detailed structured location
        locationDetails: {
            village: { type: String, trim: true },
            tehsil: { type: String, trim: true },
            district: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
        },
        availabilityDate: {
            type: Date,
            default: Date.now,
        },
        images: {
            type: [String],
            default: [],
        },
        // NEW: Geotagged image with location metadata
        geotaggedImage: {
            url: { type: String },
            latitude: { type: Number },
            longitude: { type: Number },
            capturedAt: { type: Date },
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
