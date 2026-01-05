import KYC from "../models/kycModel.js";

// 1. Submit KYC (Farmer, Trader, or Transport)
export const submitKYC = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    console.log("=== KYC SUBMISSION ===");
    console.log("User ID:", userId);
    console.log("Role:", role);
    console.log("Files received:", Object.keys(req.files || {}));
    console.log("Body fields:", Object.keys(req.body || {}));

    if (!userId) {
      return res.status(400).json({ error: "User ID missing from token" });
    }

    // Build KYC data
    const data = {
      user: userId,
      role,
      aadhaarPan: req.files?.aadhaarPan?.[0]?.filename || null,
      selfie: req.files?.selfie?.[0]?.filename || null,
    };

    console.log("Initial data:", data);

    if (role === "farmer") {
      data.landProof = req.files?.landProof?.[0]?.filename || null;
    }

    if (role === "trader") {
      data.gst = req.files?.gst?.[0]?.filename || null;
      data.businessReg = req.files?.businessReg?.[0]?.filename || null;
    }

    if (role === "transport") {
      data.drivingLicense = req.files?.drivingLicense?.[0]?.filename || null;
      data.vehicleRC = req.files?.vehicleRC?.[0]?.filename || null;
      data.insurance = req.files?.insurance?.[0]?.filename || null;
      data.pollution = req.files?.pollution?.[0]?.filename || null;
      data.licenseNumber = req.body?.licenseNumber || null;
      data.licenseExpiry = req.body?.licenseExpiry || null;
      data.vehicleNumber = req.body?.vehicleNumber || null;
      data.vehicleType = req.body?.vehicleType || null;
      
      console.log("Transport data:", data);
    }

    // Validation
    if (!data.aadhaarPan || !data.selfie) {
      console.log("❌ Missing basic docs:", { aadhaarPan: data.aadhaarPan, selfie: data.selfie });
      return res.status(400).json({
        error: "Aadhaar/PAN and Selfie are required",
      });
    }

    if (role === "transport") {
      if (!data.drivingLicense || !data.vehicleRC) {
        console.log("❌ Missing transport docs:", { drivingLicense: data.drivingLicense, vehicleRC: data.vehicleRC });
        return res.status(400).json({
          error: "Driving License and Vehicle RC are required for transporter",
        });
      }
      if (!data.licenseNumber || !data.licenseExpiry || !data.vehicleNumber || !data.vehicleType) {
        console.log("❌ Missing transport details:", { 
          licenseNumber: data.licenseNumber,
          licenseExpiry: data.licenseExpiry,
          vehicleNumber: data.vehicleNumber,
          vehicleType: data.vehicleType
        });
        return res.status(400).json({
          error: "License number, expiry, vehicle number, and type are required",
        });
      }
    }

    console.log("✅ Validation passed");

    // Check existing KYC
    const existing = await KYC.findOne({ user: userId });

    if (existing) {
      console.log("Updating existing KYC:", existing._id);
      // Reset status to pending on resubmission
      data.status = "pending";
      await KYC.findByIdAndUpdate(existing._id, data);
      return res.json({ message: "KYC updated successfully" });
    }

    console.log("Creating new KYC with data:", data);
    const newKyc = await KYC.create(data);
    console.log("✅ KYC Created:", newKyc._id);
    
    res.json({ message: "KYC submitted successfully", kycId: newKyc._id });
  } catch (error) {
    console.error("❌ KYC Error:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      error: "KYC submission failed",
      details: error?.message,
      savedFiles: Object.keys(req.files || {}),
    });
  }
};

// 2. Admin — GET all KYC
export const getAllKYC = async (req, res) => {
  const list = await KYC.find().populate("user", "name phone role");
  res.json(list);
};

// 3. Admin — Update KYC status
export const updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemark } = req.body;

    await KYC.findByIdAndUpdate(id, { status, adminRemark });

    res.json({ message: "KYC status updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

// 4. User — Get own KYC (Farmer / Trader)
export const getMyKYC = async (req, res) => {
  try {
    // token payload uses `id`
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const kyc = await KYC.findOne({ user: userId });

    if (!kyc) {
      return res.json({
        status: "not_submitted",
        message: "KYC not submitted yet",
      });
    }

    res.json({
      status: kyc.status, // pending | approved | rejected
      role: kyc.role,
      kyc,
    });
  } catch (error) {
    console.log("Get My KYC Error:", error);
    res.status(500).json({ error: "Failed to fetch KYC data" });
  }
};
