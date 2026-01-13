import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
    {
        // The crop being bid on
        cropId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Crop",
            required: true,
        },

        // Trader making the proposal
        traderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Farmer who owns the crop
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Proposed price per unit
        proposedPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        // Quantity trader wants to purchase
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },

        // Unit for quantity
        unit: {
            type: String,
            enum: ["kg", "quintal", "ton", "piece"],
            default: "kg",
        },

        // Total value of proposal
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Platform fees (₹1 per kg)
        platformFees: {
            type: Number,
            default: 0,
        },

        // Booking amount (10% non-refundable)
        bookingAmount: {
            type: Number,
            default: 0,
        },

        // Proposal status
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "withdrawn", "expired"],
            default: "pending",
        },

        // Message from trader to farmer
        message: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        // Expected delivery date proposed by trader
        expectedDeliveryDate: {
            type: Date,
        },

        // Validity of proposal
        validUntil: {
            type: Date,
            required: true,
        },

        // When farmer responded
        respondedAt: {
            type: Date,
        },

        // Farmer's response message
        farmerResponse: {
            type: String,
            trim: true,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
proposalSchema.index({ cropId: 1, status: 1 });
proposalSchema.index({ traderId: 1, status: 1 });
proposalSchema.index({ farmerId: 1, status: 1 });

// Virtual for checking if proposal is expired
proposalSchema.virtual("isExpired").get(function () {
    return this.validUntil < new Date() && this.status === "pending";
});

// Calculate platform fees before save (₹1 per kg)
proposalSchema.pre("save", function (next) {
    if (this.isModified("quantity") || this.isNew) {
        // Convert quantity to kg for fee calculation
        let quantityInKg = this.quantity;
        if (this.unit === "quintal") quantityInKg = this.quantity * 100;
        if (this.unit === "ton") quantityInKg = this.quantity * 1000;

        this.platformFees = quantityInKg * 1; // ₹1 per kg
        this.bookingAmount = this.totalAmount * 0.10; // 10% booking
    }
    next();
});

const Proposal = mongoose.model("Proposal", proposalSchema);

export default Proposal;
