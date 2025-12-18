import express from "express";
import {
    createOrder,
    getTraderOrders,
    getFarmerOrders,
    getOrderDetails,
    acceptOrder,
    rejectOrder,
    markOrderReady,
    cancelOrder,
} from "../controllers/orderController.js";
import { requireSignIn, isFarmer, isTrader } from "../middlewares/auth.js";

const router = express.Router();

// Trader routes
router.post("/create", requireSignIn, isTrader, createOrder);
router.get("/trader/my-orders", requireSignIn, isTrader, getTraderOrders);
router.put("/cancel/:orderId", requireSignIn, isTrader, cancelOrder);

// Farmer routes
router.get("/farmer/my-orders", requireSignIn, isFarmer, getFarmerOrders);
router.put("/accept/:orderId", requireSignIn, isFarmer, acceptOrder);
router.put("/reject/:orderId", requireSignIn, isFarmer, rejectOrder);
router.put("/ready/:orderId", requireSignIn, isFarmer, markOrderReady);

// Common routes (accessible by both farmer and trader)
router.get("/details/:orderId", requireSignIn, getOrderDetails);

export default router;
