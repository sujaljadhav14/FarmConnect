import KYC from "../models/kycModel.js";

// 1. Submit KYC (Farmer or Trader)
export const submitKYC = async (req, res) => {
  try {
    // FIX 1: Read "id" not "_id" from token
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(400).json({ error: "User ID missing from token" });
    }

    // FIX 2: Build KYC data only with available files
    const data = {
      user: userId,
      role,
      aadhaarPan: req.files?.aadhaarPan?.[0]?.filename || null,
      selfie: req.files?.selfie?.[0]?.filename || null,
    };

    if (role === "farmer") {
      data.landProof = req.files?.landProof?.[0]?.filename || null;
    }

    if (role === "trader") {
      data.gst = req.files?.gst?.[0]?.filename || null;
      data.businessReg = req.files?.businessReg?.[0]?.filename || null;
    }

    // FIX 3: Prevent saving all-null file data
    if (!data.aadhaarPan || !data.selfie) {
      return res.status(400).json({
        error: "Aadhaar/PAN and Selfie are required",
      });
    }

    // Check existing KYC
    const existing = await KYC.findOne({ user: userId });

    if (existing) {
      await KYC.findByIdAndUpdate(existing._id, data);
      return res.json({ message: "KYC updated successfully" });
    }

    await KYC.create(data);
    res.json({ message: "KYC submitted successfully" });
  } catch (error) {
    console.log("KYC Error:", error);

    // FIX 4: Return which documents failed saving
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
