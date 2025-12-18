import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["farmer", "trader"], required: true },

    // Common
    aadhaarPan: { type: String },
    selfie: { type: String },

    // Farmer-only
    landProof: { type: String },

    // Trader-only
    gst: { type: String },
    businessReg: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminRemark: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("KYC", kycSchema);
