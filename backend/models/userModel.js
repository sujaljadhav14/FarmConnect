import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      sparse: true, // optional; only required if using phone login
      trim: true,
    },
    password: {
      type: String,
      required: true, // hashed password
    },
    role: {
      type: String,
      enum: ["farmer", "trader", "transport", "admin"],
      default: "farmer",
    },
    // NEW: Rating for trust system (affects agreement visibility)
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    // NEW: Farm location for farmers (used for weather auto-fetch)
    farmLocation: {
      village: { type: String, trim: true },
      tehsil: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    // NEW: Bank details for payments
    bankDetails: {
      accountNumber: { type: String, trim: true },
      accountName: { type: String, trim: true },
      bankName: { type: String, trim: true },
      branch: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      branchAddress: { type: String, trim: true },
    },
    // NEW: Office location for traders
    officeLocation: {
      address: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
