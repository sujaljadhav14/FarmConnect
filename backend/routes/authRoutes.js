// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, getProfile, updateBankDetails } from "../controllers/authController.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import {
  isAdmin,
  isFarmer,
  isTrader,
  isTransport,
  requireSignIn,
} from "../middlewares/auth.js";
import {
  getAllKYC,
  getMyKYC,
  submitKYC,
  updateKYCStatus,
} from "../controllers/kycController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Email + password
router.post("/register", registerUser);
router.post("/login", loginUser);

// Phone + OTP (Twilio)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// User Profile
router.get("/profile", requireSignIn, getProfile);
router.put("/update-bank-details", requireSignIn, updateBankDetails);

// Farmer Dashboard
router.get("/farmer/dashboard", requireSignIn, isFarmer, (req, res) => {
  res.send({ message: "Farmer Dashboard Data" });
});

// Trader Dashboard
router.get("/trader/dashboard", requireSignIn, isTrader, (req, res) => {
  res.send({ message: "Trader Dashboard Data" });
});

// Transport Dashboard
router.get("/transport/dashboard", requireSignIn, isTransport, (req, res) => {
  res.send({ message: "Transport Dashboard Data" });
});

// Admin Dashboard
router.get("/admin/dashboard", requireSignIn, isAdmin, (req, res) => {
  res.send({ message: "Admin Dashboard Data" });
});

// Upload fields based on role
const uploadFields = upload.fields([
  { name: "aadhaarPan", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
  { name: "landProof", maxCount: 1 },
  { name: "gst", maxCount: 1 },
  { name: "businessReg", maxCount: 1 },
  { name: "businessLicense", maxCount: 1 },
  { name: "rtoPermit", maxCount: 1 },
  { name: "commercialPermit", maxCount: 1 },
]);

// USER — Submit KYC
router.post("/submit-kyc", requireSignIn, uploadFields, submitKYC);

router.get("/my-kyc", requireSignIn, getMyKYC);

// ADMIN — View all KYC
router.get("/get-all-kyc", requireSignIn, isAdmin, getAllKYC);

// ADMIN — Approve / Reject KYC
router.put("/kyc-status/:id", requireSignIn, isAdmin, updateKYCStatus);

export default router;
