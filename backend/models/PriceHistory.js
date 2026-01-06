import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema(
    {
        cropId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Crop",
            required: false, // optional - if source uses symbol only
        },
        source: { type: String, required: true }, // e.g., alpha_vantage or rapidapi/<name>
        sourceSymbol: { type: String }, // symbol used by provider
        date: { type: Date, required: true },
        avgPrice: { type: Number, required: true },
        minPrice: { type: Number },
        maxPrice: { type: Number },
        fetchedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

priceHistorySchema.index({ cropId: 1, source: 1, date: 1 });

const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
export default PriceHistory;