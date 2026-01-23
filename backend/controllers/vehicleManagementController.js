import TransporterVehicle from "../models/TransporterVehicle.js";
import Order from "../models/Order.js";
import Crop from "../models/Crop.js";

// Add a new vehicle with weight slab
export const addVehicle = async (req, res) => {
    try {
        const transporterId = req.user._id;
        const {
            vehicleName,
            vehicleNumber,
            vehicleType,
            minWeight,
            maxWeight,
            weightUnit,
            yearOfManufacture,
            registrationCertificate,
            insuranceCertificate,
            pollutionCertificate,
            loadCapacity,
            loadCapacityUnit,
            baseFare,
            farePerKm,
            notes,
        } = req.body;

        // Validation
        if (!vehicleName || !vehicleNumber || !vehicleType) {
            return res.status(400).json({
                success: false,
                message: "Vehicle name, number, and type are required",
            });
        }

        if (minWeight === undefined || maxWeight === undefined || !minWeight || !maxWeight) {
            return res.status(400).json({
                success: false,
                message: "Weight slab (minWeight and maxWeight) is required",
            });
        }

        if (maxWeight <= minWeight) {
            return res.status(400).json({
                success: false,
                message: "Maximum weight must be greater than minimum weight",
            });
        }

        // Check for duplicate vehicle number
        const existingVehicle = await TransporterVehicle.findOne({ vehicleNumber });
        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: "Vehicle number already exists",
            });
        }

        const vehicle = new TransporterVehicle({
            transporterId,
            vehicleName,
            vehicleNumber,
            vehicleType,
            weightSlab: {
                minWeight: parseFloat(minWeight),
                maxWeight: parseFloat(maxWeight),
                unit: weightUnit || "kg",
            },
            yearOfManufacture,
            registrationCertificate,
            insuranceCertificate,
            pollutionCertificate,
            loadCapacity: parseFloat(loadCapacity),
            loadCapacityUnit,
            baseFare: parseFloat(baseFare),
            farePerKm: parseFloat(farePerKm),
            notes,
        });

        await vehicle.save();

        res.status(201).json({
            success: true,
            message: "Vehicle added successfully",
            vehicle,
        });
    } catch (error) {
        console.error("Add Vehicle Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add vehicle",
            error: error.message,
        });
    }
};

// Get all vehicles for a transporter
export const getMyVehicles = async (req, res) => {
    try {
        const transporterId = req.user._id;

        const vehicles = await TransporterVehicle.find({
            transporterId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: vehicles.length,
            vehicles,
        });
    } catch (error) {
        console.error("Get Vehicles Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicles",
            error: error.message,
        });
    }
};

// Get a single vehicle by ID
export const getVehicleById = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const transporterId = req.user._id;

        const vehicle = await TransporterVehicle.findOne({
            _id: vehicleId,
            transporterId,
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        res.status(200).json({
            success: true,
            vehicle,
        });
    } catch (error) {
        console.error("Get Vehicle Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicle",
            error: error.message,
        });
    }
};

// Update vehicle details
export const updateVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const transporterId = req.user._id;
        const updates = req.body;

        const vehicle = await TransporterVehicle.findOne({
            _id: vehicleId,
            transporterId,
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        // Validate weight slab if updating
        if (updates.minWeight !== undefined || updates.maxWeight !== undefined) {
            const minW = updates.minWeight !== undefined ? parseFloat(updates.minWeight) : vehicle.weightSlab.minWeight;
            const maxW = updates.maxWeight !== undefined ? parseFloat(updates.maxWeight) : vehicle.weightSlab.maxWeight;

            if (maxW <= minW) {
                return res.status(400).json({
                    success: false,
                    message: "Maximum weight must be greater than minimum weight",
                });
            }

            vehicle.weightSlab.minWeight = minW;
            vehicle.weightSlab.maxWeight = maxW;
        }

        // Update other fields
        if (updates.vehicleName) vehicle.vehicleName = updates.vehicleName;
        if (updates.vehicleType) vehicle.vehicleType = updates.vehicleType;
        if (updates.yearOfManufacture) vehicle.yearOfManufacture = updates.yearOfManufacture;
        if (updates.baseFare !== undefined) vehicle.baseFare = parseFloat(updates.baseFare);
        if (updates.farePerKm !== undefined) vehicle.farePerKm = parseFloat(updates.farePerKm);
        if (updates.availabilityStatus) vehicle.availabilityStatus = updates.availabilityStatus;
        if (updates.isActive !== undefined) vehicle.isActive = updates.isActive;
        if (updates.lastMaintenanceDate) vehicle.lastMaintenanceDate = updates.lastMaintenanceDate;
        if (updates.nextMaintenanceDate) vehicle.nextMaintenanceDate = updates.nextMaintenanceDate;
        if (updates.notes) vehicle.notes = updates.notes;

        await vehicle.save();

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            vehicle,
        });
    } catch (error) {
        console.error("Update Vehicle Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update vehicle",
            error: error.message,
        });
    }
};

// Delete a vehicle
export const deleteVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const transporterId = req.user._id;

        const vehicle = await TransporterVehicle.findOneAndDelete({
            _id: vehicleId,
            transporterId,
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
        });
    } catch (error) {
        console.error("Delete Vehicle Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete vehicle",
            error: error.message,
        });
    }
};

// Get available orders for transport (orders with "Ready for Pickup" status from completed agreements)
export const getAvailableOrders = async (req, res) => {
    try {
        const transporterId = req.user._id;

        // Get all active/available orders that are ready for transport
        const orders = await Order.find({
            orderStatus: "Ready for Pickup",
            transportId: null, // Not yet assigned to transport
        })
            .populate("cropId", "cropName category unit quantity")
            .populate("farmerId", "name phone location")
            .populate("traderId", "name phone location")
            .populate({
                path: "agreementId",
                select: "status qualityDetails",
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Get Available Orders Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available orders",
            error: error.message,
        });
    }
};

// Suggest appropriate vehicles for an order based on weight
export const suggestVehiclesForOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const transporterId = req.user._id;

        // Find the order with crop details
        const order = await Order.findById(orderId).populate("cropId", "quantity unit");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Convert quantity to kg for comparison
        let quantityInKg = order.cropId.quantity;
        if (order.cropId.unit === "quintal") {
            quantityInKg = order.cropId.quantity * 100;
        } else if (order.cropId.unit === "ton") {
            quantityInKg = order.cropId.quantity * 1000;
        }

        // Find vehicles that can carry this weight
        const suitableVehicles = await TransporterVehicle.find({
            transporterId,
            isActive: true,
            "weightSlab.minWeight": { $lte: quantityInKg },
            "weightSlab.maxWeight": { $gte: quantityInKg },
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orderQuantity: quantityInKg,
            quantityUnit: "kg",
            suggestedVehicles: suitableVehicles,
            count: suitableVehicles.length,
        });
    } catch (error) {
        console.error("Suggest Vehicles Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to suggest vehicles",
            error: error.message,
        });
    }
};

// Get vehicles by weight range (for frontend filtering)
export const getVehiclesByWeightRange = async (req, res) => {
    try {
        const transporterId = req.user._id;
        const { minWeight, maxWeight } = req.query;

        let query = { transporterId, isActive: true };

        if (minWeight && maxWeight) {
            query["$or"] = [
                {
                    "weightSlab.minWeight": { $lte: maxWeight },
                    "weightSlab.maxWeight": { $gte: minWeight },
                },
            ];
        }

        const vehicles = await TransporterVehicle.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            vehicles,
            count: vehicles.length,
        });
    } catch (error) {
        console.error("Get Vehicles by Weight Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicles",
            error: error.message,
        });
    }
};

// Update vehicle availability status
export const updateVehicleAvailability = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { availabilityStatus } = req.body;
        const transporterId = req.user._id;

        const validStatuses = ["available", "on_delivery", "maintenance", "inactive"];
        if (!validStatuses.includes(availabilityStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid availability status",
            });
        }

        const vehicle = await TransporterVehicle.findOneAndUpdate(
            { _id: vehicleId, transporterId },
            { availabilityStatus },
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle availability updated successfully",
            vehicle,
        });
    } catch (error) {
        console.error("Update Vehicle Availability Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update vehicle availability",
            error: error.message,
        });
    }
};
