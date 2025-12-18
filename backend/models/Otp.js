// models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
