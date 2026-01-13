// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const createToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role }, // 👈 Ensure ID is string
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
// body: { name, password, phone, role }
export const registerUser = async (req, res) => {
  try {
    const { name, password, phone, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role if provided
    const validRoles = ["farmer", "trader", "transport"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: "User already registered" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      password: hashedPassword,
      phone: phone,
      role: role || "farmer", // Use provided role or default to farmer
    });

    return res.status(201).json({
      message: "User registered successfully",

      user,
    });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// POST /api/auth/login
// body: { phone, password }
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    console.log("🔐 Login attempt:");
    console.log("   Phone received:", phone);
    console.log("   Password length:", password?.length);

    if (!phone || !password) {
      return res
        .status(400)
        .json({ message: "Phone and password are required" });
    }

    // Try to find user
    const user = await User.findOne({ phone });
    console.log("   User found:", user ? `Yes (${user.name})` : "No");

    if (!user) {
      return res.status(400).json({ message: "User Not Exists" });
    }

    // Test password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("   Password match:", isMatch ? "✅ Yes" : "❌ No");

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = createToken(user);

    console.log("   ✅ Login successful for:", user.name);

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/profile
// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/auth/update-bank-details
// Update user's bank details
export const updateBankDetails = async (req, res) => {
  try {
    const { bankDetails } = req.body;

    if (!bankDetails) {
      return res.status(400).json({ success: false, message: "Bank details are required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bankDetails },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      user
    });
  } catch (err) {
    console.error("updateBankDetails error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
