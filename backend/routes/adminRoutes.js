import express from "express";
import {
    getSystemStats,
    getAllUsers,
    getAllCropsAdmin,
    getAllOrdersAdmin,
    getAllDeliveriesAdmin,
    getRecentActivities,
} from "../controllers/adminController.js";
import { requireSignIn, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// All routes require admin role
router.get("/stats", requireSignIn, isAdmin, getSystemStats);
router.get("/users", requireSignIn, isAdmin, getAllUsers);
router.get("/crops", requireSignIn, isAdmin, getAllCropsAdmin);
router.get("/orders", requireSignIn, isAdmin, getAllOrdersAdmin);
router.get("/deliveries", requireSignIn, isAdmin, getAllDeliveriesAdmin);
router.get("/activities", requireSignIn, isAdmin, getRecentActivities);

export default router;
