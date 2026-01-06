import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["farmer", "trader", "transport"], required: true },

    // Common
    aadhaarPan: { type: String },
    selfie: { type: String },

    // Farmer-only
    landProof: { type: String },

    // Trader-only
    gst: { type: String },
    businessReg: { type: String },

    // Transporter-only (business verification only)
    businessLicense: { type: String },
    companyName: { type: String },
    gstNumber: { type: String },
    transporterId: { type: String },
    rtoPermit: { type: String },
    commercialPermit: { type: String },

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
