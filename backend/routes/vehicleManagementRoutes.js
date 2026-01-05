import express from "express";
import {
    addVehicle,
    getMyVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    getAvailableOrders,
    suggestVehiclesForOrder,
    getVehiclesByWeightRange,
    updateVehicleAvailability,
} from "../controllers/vehicleManagementController.js";
import { requireSignIn, isTransport } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication and transport role
router.use(requireSignIn);
router.use(isTransport);

// Vehicle Management Routes
router.post("/add", addVehicle);
router.get("/my-vehicles", getMyVehicles);
router.get("/:vehicleId", getVehicleById);
router.put("/:vehicleId/update", updateVehicle);
router.delete("/:vehicleId/delete", deleteVehicle);
router.put("/:vehicleId/availability", updateVehicleAvailability);

// Order & Matching Routes
router.get("/orders/available", getAvailableOrders);
router.get("/suggest/:orderId", suggestVehiclesForOrder);
router.get("/weight-range/filter", getVehiclesByWeightRange);

export default router;
