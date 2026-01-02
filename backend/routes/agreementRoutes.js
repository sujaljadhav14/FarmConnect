import express from "express";
import { requireSignIn } from "../middlewares/auth.js";
import {
    farmerSignAgreement,
    traderSignAgreement,
    getAgreement,
    cancelAgreement,
} from "../controllers/agreementController.js";

const router = express.Router();

// Farmer signs agreement
router.post("/farmer-sign/:orderId", requireSignIn, farmerSignAgreement);

// Trader confirms agreement
router.post("/trader-sign/:orderId", requireSignIn, traderSignAgreement);

// Get agreement details
router.get("/:orderId", requireSignIn, getAgreement);

// Cancel agreement
router.post("/cancel/:orderId", requireSignIn, cancelAgreement);

export default router;
