import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const requireSignIn = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Reject common invalid values before verifying
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token (catch JWT specific errors separately)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyErr) {
      console.error("Auth Verify Error:", verifyErr.name, verifyErr.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user info
    req.user = {
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// role-based access
export const isFarmer = (req, res, next) => {
  if (req.user.role !== "farmer")
    return res
      .status(403)
      .send({ message: "Access denied, insufficient permissions" });
  next();
};

export const isTrader = (req, res, next) => {
  if (req.user.role !== "trader")
    return res
      .status(403)
      .send({ message: "Access denied, insufficient permissions" });
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .send({ message: "Access denied, insufficient permissions" });
  next();
};

export const isTransport = (req, res, next) => {
  if (req.user.role !== "transport")
    return res
      .status(403)
      .send({ message: "Access denied, insufficient permissions" });
  next();
};
