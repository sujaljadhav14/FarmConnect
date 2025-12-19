import mongoose from "mongoose";

const farmTaskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        category: {
            type: String,
            enum: ["Sowing", "Irrigation", "Fertilizing", "Harvesting", "Maintenance", "Other"],
            default: "Other",
        },
        status: {
            type: String,
            enum: ["Pending", "Completed"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

const FarmTask = mongoose.model("FarmTask", farmTaskSchema);

export default FarmTask;
