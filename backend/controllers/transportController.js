import Transport from "../models/Transport.js";
import Order from "../models/Order.js";
import Crop from "../models/Crop.js";

// Get available deliveries (orders ready for pickup)
export const getAvailableDeliveries = async (req, res) => {
    try {
        // Find orders that are "Ready for Pickup" and not yet assigned to transport
        const orders = await Order.find({
            orderStatus: "Ready for Pickup",
            transportId: null,
        })
            .populate("cropId", "cropName category unit location")
            .populate("farmerId", "name phone location")
            .populate("traderId", "name phone location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Get Available Deliveries Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available deliveries",
            error: error.message,
        });
    }
};

// Accept delivery assignment
export const acceptDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { vehicleType, vehicleNumber, deliveryFee } = req.body;
        const transportId = req.user._id;

        // Find the order
        const order = await Order.findById(orderId)
            .populate("cropId", "location")
            .populate("farmerId", "location");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check if order is ready for pickup
        if (order.orderStatus !== "Ready for Pickup") {
            return res.status(400).json({
                success: false,
                message: "Order is not ready for pickup",
            });
        }

        // Check if already assigned
        if (order.transportId) {
            return res.status(400).json({
                success: false,
                message: "Order already assigned to another transport",
            });
        }

        // Update order with transport ID
        order.transportId = transportId;
        order.orderStatus = "In Transit";
        await order.save();

        // Create transport record
        const transport = await Transport.create({
            orderId,
            transportId,
            pickupLocation: order.cropId?.location || order.farmerId?.location || "N/A",
            deliveryLocation: order.deliveryAddress,
            deliveryFee: deliveryFee || 0,
            vehicleType: vehicleType || "Tempo",
            vehicleNumber: vehicleNumber || "",
            status: "Assigned",
        });

        const populatedTransport = await Transport.findById(transport._id)
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId", select: "cropName category unit" },
                    { path: "farmerId", select: "name phone location" },
                    { path: "traderId", select: "name phone location" },
                ],
            });

        res.status(200).json({
            success: true,
            message: "Delivery accepted successfully",
            transport: populatedTransport,
        });
    } catch (error) {
        console.error("Accept Delivery Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to accept delivery",
            error: error.message,
        });
    }
};

// Get transport's active deliveries
export const getMyDeliveries = async (req, res) => {
    try {
        const transportId = req.user._id;
        const { status } = req.query;

        let filter = { transportId };

        if (status) {
            filter.status = status;
        } else {
            // By default, show active deliveries (not delivered or failed)
            filter.status = { $in: ["Assigned", "Picked Up", "In Transit"] };
        }

        const deliveries = await Transport.find(filter)
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId", select: "cropName category unit quality" },
                    { path: "farmerId", select: "name phone location" },
                    { path: "traderId", select: "name phone location" },
                ],
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: deliveries.length,
            deliveries,
        });
    } catch (error) {
        console.error("Get My Deliveries Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch deliveries",
            error: error.message,
        });
    }
};

// Get delivery history
export const getDeliveryHistory = async (req, res) => {
    try {
        const transportId = req.user._id;

        const deliveries = await Transport.find({
            transportId,
            status: { $in: ["Delivered", "Failed"] },
        })
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId", select: "cropName category unit" },
                    { path: "farmerId", select: "name phone" },
                    { path: "traderId", select: "name phone" },
                ],
            })
            .sort({ deliveryTime: -1 });

        res.status(200).json({
            success: true,
            count: deliveries.length,
            deliveries,
        });
    } catch (error) {
        console.error("Get Delivery History Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch delivery history",
            error: error.message,
        });
    }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { status, notes } = req.body;
        const transportId = req.user._id;

        const delivery = await Transport.findById(deliveryId);

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found",
            });
        }

        // Check if current user is the assigned transport
        if (delivery.transportId.toString() !== transportId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        // Validate status progression
        const validStatuses = ["Assigned", "Picked Up", "In Transit", "Delivered", "Failed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        // Update delivery
        delivery.status = status;
        if (notes) delivery.notes = notes;

        // Set timestamps
        if (status === "Picked Up" && !delivery.pickupTime) {
            delivery.pickupTime = new Date();
        }

        if (status === "Delivered" && !delivery.deliveryTime) {
            delivery.deliveryTime = new Date();
        }

        await delivery.save();

        // Update order status
        const order = await Order.findById(delivery.orderId);
        if (order) {
            if (status === "Delivered") {
                order.orderStatus = "Delivered";
                order.deliveryDate = new Date();

                // Update crop - reduce actual quantity
                const crop = await Crop.findById(order.cropId);
                if (crop) {
                    crop.quantity -= order.quantity;
                    crop.reservedQuantity -= order.quantity;
                    if (crop.quantity <= 0) {
                        crop.status = "Sold";
                    }
                    await crop.save();
                }
            } else {
                order.orderStatus = status;
            }
            await order.save();
        }

        const updatedDelivery = await Transport.findById(deliveryId)
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId", select: "cropName category unit" },
                    { path: "farmerId", select: "name phone location" },
                    { path: "traderId", select: "name phone location" },
                ],
            });

        res.status(200).json({
            success: true,
            message: "Delivery status updated successfully",
            delivery: updatedDelivery,
        });
    } catch (error) {
        console.error("Update Delivery Status Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update delivery status",
            error: error.message,
        });
    }
};

// Get single delivery details
export const getDeliveryDetails = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const transportId = req.user._id;

        const delivery = await Transport.findById(deliveryId)
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId" },
                    { path: "farmerId", select: "name phone location" },
                    { path: "traderId", select: "name phone location" },
                ],
            })
            .populate("transportId", "name phone");

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found",
            });
        }

        // Check authorization
        if (delivery.transportId._id.toString() !== transportId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        res.status(200).json({
            success: true,
            delivery,
        });
    } catch (error) {
        console.error("Get Delivery Details Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch delivery details",
            error: error.message,
        });
    }
};
