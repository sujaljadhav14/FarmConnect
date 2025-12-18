// controllers/otpController.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Otp from "../models/Otp.js";
import twilioClient from "../utils/twilioClient.js";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Normalize phone
const normalizePhone = (phone) => {
  if (!phone) return null;
  const trimmed = phone.trim();
  return trimmed.startsWith("+") ? trimmed : "+91" + trimmed;
};

// Generate 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ========================
// SEND OTP
// ========================
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user with this phone. Please register first." });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ phone: normalizedPhone });
    await Otp.create({ phone: normalizedPhone, otp, expiresAt });

    try {
      // Try real SMS
      const msg = await twilioClient.messages.create({
        to: normalizedPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      });
      console.log("Twilio message SID:", msg.sid);

      return res.json({ message: "OTP sent successfully" });
    } catch (smsErr) {
      console.error("Twilio SMS error:", smsErr.message);

      // Dev fallback: still succeed and show OTP in response
      return res.status(200).json({
        message:
          "OTP generated but SMS could not be sent (probably trial/unverified). Use this OTP for testing.",
        debugOtp: otp,
      });
    }
  } catch (err) {
    console.error("sendOtp error:", err.message || err);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: err.message || "Unknown error",
    });
  }
};

// ========================
// VERIFY OTP
// ========================
export const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code)
      return res.status(400).json({
        message: "Phone and OTP are required",
      });

    const normalizedPhone = normalizePhone(phone);
    const record = await Otp.findOne({ phone: normalizedPhone });

    if (!record) {
      return res.status(400).json({ message: "No OTP requested or expired" });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ phone: normalizedPhone });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== code) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP valid → delete it
    await Otp.deleteMany({ phone: normalizedPhone });

    const user = await User.findOne({ phone: normalizedPhone });

    const token = createToken(user._id);

    return res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};
