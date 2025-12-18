import express from "express";
import {
    getAvailableDeliveries,
    acceptDelivery,
    getMyDeliveries,
    getDeliveryHistory,
    updateDeliveryStatus,
    getDeliveryDetails,
} from "../controllers/transportController.js";
import { requireSignIn, isTransport } from "../middlewares/auth.js";

const router = express.Router();

// All routes require transport role
router.get("/available", requireSignIn, isTransport, getAvailableDeliveries);
router.post("/accept/:orderId", requireSignIn, isTransport, acceptDelivery);
router.get("/my-deliveries", requireSignIn, isTransport, getMyDeliveries);
router.get("/history", requireSignIn, isTransport, getDeliveryHistory);
router.put("/status/:deliveryId", requireSignIn, isTransport, updateDeliveryStatus);
router.get("/details/:deliveryId", requireSignIn, isTransport, getDeliveryDetails);

export default router;
