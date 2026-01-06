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
      data.businessLicense = req.files?.businessLicense?.[0]?.filename || null;
      data.companyName = req.body?.companyName || null;
      data.gstNumber = req.body?.gstNumber || null;
      data.transporterId = req.body?.transporterId || null;
      data.rtoPermit = req.files?.rtoPermit?.[0]?.filename || null;
      data.commercialPermit = req.files?.commercialPermit?.[0]?.filename || null;

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
      if (!data.businessLicense) {
        console.log("❌ Missing business license:", { businessLicense: data.businessLicense });
        return res.status(400).json({
          error: "Business license is required for transporter",
        });
      }
      if (!data.companyName) {
        console.log("❌ Missing company name for transporter");
        return res.status(400).json({
          error: "Transport company name is required",
        });
      }
      if (!data.gstNumber) {
        console.log("❌ Missing GST number for transporter");
        return res.status(400).json({
          error: "GST number is required for transporter",
        });
      }
      if (!data.transporterId) {
        console.log("❌ Missing transporter ID for transporter");
        return res.status(400).json({
          error: "Transporter ID / Registration No is required",
        });
      }
      if (!data.rtoPermit) {
        console.log("❌ Missing RTO permit for transporter");
        return res.status(400).json({
          error: "RTO-issued permit is required",
        });
      }
      if (!data.commercialPermit) {
        console.log("❌ Missing commercial permit for transporter");
        return res.status(400).json({
          error: "Commercial vehicle permit is required",
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
