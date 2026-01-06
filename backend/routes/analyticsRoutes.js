import express from "express";
import analyticsController from "../controllers/analyticsController.js";

const router = express.Router();

// Public read endpoints (authenticated access is optional for now)
// Get price trend for a crop or all crops
router.get("/price-trend", analyticsController.getPriceTrend);

// Get top crops by volume/value
router.get("/top-crops", analyticsController.getTopCrops);

export default router;