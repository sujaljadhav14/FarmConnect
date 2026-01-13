import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["farmer", "trader", "transport"], required: true },

    // Common - Aadhaar and PAN (required for all)
    aadhaarNumber: { type: String, trim: true },
    aadhaarDocument: { type: String }, // uploaded file path
    panNumber: { type: String, trim: true },
    panDocument: { type: String }, // uploaded file path
    selfie: { type: String },

    // Farmer-only
    landProof: { type: String }, // DEPRECATED - kept for backward compatibility
    // NEW: Geotagged photo of farm (replaces landProof)
    farmGeotagPhoto: {
      url: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
      capturedAt: { type: Date },
    },

    // Trader-only
    gst: { type: String },
    businessReg: { type: String },
    // NEW: Geotagged photo of trader office
    officeGeotagPhoto: {
      url: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
      capturedAt: { type: Date },
    },
    // NEW: Electricity bill of office
    electricityBill: { type: String },
    // NEW: Rent agreement
    rentAgreement: { type: String },

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
