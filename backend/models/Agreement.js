import mongoose from "mongoose";

const agreementSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
        },
        // Farmer Agreement Details
        farmerAgreement: {
            signed: { type: Boolean, default: false },
            signedAt: { type: Date },
            qualityCommitment: {
                type: String,
                default: "I commit to supply the produce as per the agreed quality and quantity.",
            },
            termsAccepted: { type: Boolean, default: false },
        },
        // Trader Agreement Details
        traderAgreement: {
            signed: { type: Boolean, default: false },
            signedAt: { type: Date },
            paymentTermsAccepted: { type: Boolean, default: false },
            // Trader acknowledges 30% advance, 70% on delivery
        },
        // Agreement Status
        status: {
            type: String,
            enum: ["pending_farmer", "pending_trader", "completed", "cancelled"],
            default: "pending_farmer",
        },
        // Quality Details from Farmer
        qualityDetails: {
            grade: { type: String, enum: ["A+", "A", "B", "C", "Standard"], default: "Standard" },
            description: { type: String, trim: true, maxlength: 500 },
            certifications: { type: String, trim: true },
        },
        // Payment Terms Summary
        paymentTerms: {
            advancePercentage: { type: Number, default: 30 },
            finalPercentage: { type: Number, default: 70 },
            advanceAmount: { type: Number, default: 0 },
            finalAmount: { type: Number, default: 0 },
        },
        // Cancellation Details
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        cancellationReason: { type: String, trim: true },
        cancelledAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Index for better query performance
agreementSchema.index({ orderId: 1 });
agreementSchema.index({ status: 1 });

const Agreement = mongoose.model("Agreement", agreementSchema);

export default Agreement;
