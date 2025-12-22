import express from "express";
import {
    getWeatherByLocation,
    getUserWeatherLocations,
    getWeatherLocation,
    deleteWeatherLocation,
    toggleFavoriteWeather,
    getWeatherAlerts,
} from "../controllers/weatherController.js";
import { requireSignIn, isFarmer } from "../middlewares/auth.js";

const router = express.Router();

// Protected routes - only farmers
router.post("/get-weather", requireSignIn, isFarmer, getWeatherByLocation);
router.get("/my-locations", requireSignIn, isFarmer, getUserWeatherLocations);
router.get("/location/:weatherId", requireSignIn, isFarmer, getWeatherLocation);
router.delete("/location/:weatherId", requireSignIn, isFarmer, deleteWeatherLocation);
router.put("/favorite/:weatherId", requireSignIn, isFarmer, toggleFavoriteWeather);
router.get("/alerts/all", requireSignIn, isFarmer, getWeatherAlerts);

export default router;
