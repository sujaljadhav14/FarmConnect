import Order from "../models/Order.js";
import Crop from "../models/Crop.js";
import User from "../models/userModel.js";

// Create new order (Trader)
export const createOrder = async (req, res) => {
    try {
        const {
            cropId,
            quantity,
            deliveryAddress,
            paymentMethod,
            expectedDeliveryDate,
            notes,
        } = req.body;

        const traderId = req.user._id;

        // Validate required fields
        if (!cropId || !quantity || !deliveryAddress || !expectedDeliveryDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // Get crop details
        const crop = await Crop.findById(cropId).populate("farmerId", "name phone");

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        // Check if crop is available
        if (crop.status !== "Available") {
            return res.status(400).json({
                success: false,
                message: "Crop is not available for ordering",
            });
        }

        // Check if sufficient quantity available
        const availableQuantity = crop.quantity - crop.reservedQuantity;
        if (quantity > availableQuantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableQuantity} ${crop.unit} available`,
            });
        }

        // Calculate total price
        const totalPrice = quantity * crop.pricePerUnit;

        // Create order
        const order = await Order.create({
            cropId,
            farmerId: crop.farmerId._id,
            traderId,
            quantity,
            pricePerUnit: crop.pricePerUnit,
            totalPrice,
            deliveryAddress,
            paymentMethod: paymentMethod || "Full",
            expectedDeliveryDate,
            notes: notes || "",
            orderStatus: "Pending",
            paymentStatus: "Pending",
        });

        // Update crop reserved quantity
        crop.reservedQuantity += quantity;
        await crop.save();

        // Populate order details
        const populatedOrder = await Order.findById(order._id)
            .populate("cropId", "cropName category unit")
            .populate("farmerId", "name phone location")
            .populate("traderId", "name phone");

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: populatedOrder,
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message,
        });
    }
};

// Get trader's orders
export const getTraderOrders = async (req, res) => {
    try {
        const traderId = req.user._id;

        const orders = await Order.find({ traderId })
            .populate("cropId", "cropName category unit quality images")
            .populate("farmerId", "name phone location")
            .populate("transportId", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Get Trader Orders Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get farmer's orders (orders received)
export const getFarmerOrders = async (req, res) => {
    try {
        const farmerId = req.user._id;

        const orders = await Order.find({ farmerId })
            .populate("cropId", "cropName category unit quality images")
            .populate("traderId", "name phone location")
            .populate("transportId", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Get Farmer Orders Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get single order details
export const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findById(orderId)
            .populate("cropId")
            .populate("farmerId", "name phone location")
            .populate("traderId", "name phone location")
            .populate("transportId", "name phone");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check if user has access to this order
        const hasAccess =
            order.farmerId._id.toString() === userId.toString() ||
            order.traderId._id.toString() === userId.toString() ||
            (order.transportId && order.transportId._id.toString() === userId.toString()) ||
            req.user.role === "admin";

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this order",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Get Order Details Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order details",
            error: error.message,
        });
    }
};

// Accept order (Farmer)
export const acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const farmerId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check if current user is the farmer
        if (order.farmerId.toString() !== farmerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to accept this order",
            });
        }

        // Check if order is in pending state
        if (order.orderStatus !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be accepted",
            });
        }

        order.orderStatus = "Accepted";
        await order.save();

        const populatedOrder = await Order.findById(orderId)
    .populate("cropId", "cropName category unit")
    .populate("farmerId", "name phone")
    .populate("traderId", "name phone");

res.status(200).json({
    success: true,
    message: "Order accepted successfully",
    order: populatedOrder,   // 👈 THIS IS WHAT FRONTEND NEEDS
});
    } catch (error) {
        console.error("Accept Order Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to accept order",
            error: error.message,
        });
    }
};

// Reject order (Farmer)
export const rejectOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rejectionReason } = req.body;
        const farmerId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check if current user is the farmer
        if (order.farmerId.toString() !== farmerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reject this order",
            });
        }

        // Check if order is in pending state
        if (order.orderStatus !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be rejected",
            });
        }

        order.orderStatus = "Rejected";
        order.rejectionReason = rejectionReason || "No reason provided";
        await order.save();

        // Release reserved quantity
        const crop = await Crop.findById(order.cropId);
        if (crop) {
            crop.reservedQuantity -= order.quantity;
            await crop.save();
        }

        res.status(200).json({
            success: true,
            message: "Order rejected",
            order,
        });
    } catch (error) {
        console.error("Reject Order Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject order",
            error: error.message,
        });
    }
};

// Mark order ready for pickup (Farmer)
export const markOrderReady = async (req, res) => {
    try {
        const { orderId } = req.params;
        const farmerId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check authorization
        if (order.farmerId.toString() !== farmerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        // Check if order is accepted
        if (order.orderStatus !== "Accepted") {
            return res.status(400).json({
                success: false,
                message: "Only accepted orders can be marked ready",
            });
        }

        order.orderStatus = "Ready for Pickup";
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order marked ready for pickup",
            order,
        });
    } catch (error) {
        console.error("Mark Order Ready Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message,
        });
    }
};

// Cancel order (Trader)
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { cancellationReason } = req.body;
        const traderId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check authorization
        if (order.traderId.toString() !== traderId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        // Can only cancel pending orders
        if (order.orderStatus !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending orders can be cancelled",
            });
        }

        order.orderStatus = "Cancelled";
        order.cancellationReason = cancellationReason || "Cancelled by trader";
        await order.save();

        // Release reserved quantity
        const crop = await Crop.findById(order.cropId);
        if (crop) {
            crop.reservedQuantity -= order.quantity;
            await crop.save();
        }

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        console.error("Cancel Order Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel order",
            error: error.message,
        });
    }
};
