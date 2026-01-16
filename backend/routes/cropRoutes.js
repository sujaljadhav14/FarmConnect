import express from "express";
import {
    addCrop,
    getFarmerCrops,
    getAllAvailableCrops,
    getCropDetails,
    updateCrop,
    deleteCrop,
    updateCropStatus,
} from "../controllers/cropController.js";
import { requireSignIn, isFarmer, isTrader } from "../middlewares/auth.js";

const router = express.Router();

// Farmer routes (protected)
router.post("/add", requireSignIn, isFarmer, addCrop);
router.get("/my-crops", requireSignIn, isFarmer, getFarmerCrops);
router.put("/update/:cropId", requireSignIn, isFarmer, updateCrop);
router.delete("/delete/:cropId", requireSignIn, isFarmer, deleteCrop);
router.put("/status/:cropId", requireSignIn, isFarmer, updateCropStatus);

// Public/Trader routes
router.get("/available", requireSignIn, getAllAvailableCrops);
router.get("/details/:cropId", requireSignIn, getCropDetails);
router.get("/:cropId", requireSignIn, getCropDetails); // Alternative route

export default router;
