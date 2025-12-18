import User from "../models/userModel.js";
import Crop from "../models/Crop.js";
import Order from "../models/Order.js";
import Transport from "../models/Transport.js";

// Get system statistics
export const getSystemStats = async (req, res) => {
    try {
        // User counts by role
        const totalUsers = await User.countDocuments();
        const farmers = await User.countDocuments({ role: "farmer" });
        const traders = await User.countDocuments({ role: "trader" });
        const transport = await User.countDocuments({ role: "transport" });
        const admins = await User.countDocuments({ role: "admin" });

        // Crop statistics
        const totalCrops = await Crop.countDocuments();
        const availableCrops = await Crop.countDocuments({ status: "Available" });
        const soldCrops = await Crop.countDocuments({ status: "Sold" });

        // Order statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
        const acceptedOrders = await Order.countDocuments({ orderStatus: "Accepted" });
        const deliveredOrders = await Order.countDocuments({ orderStatus: "Delivered" });

        // Calculate total revenue (delivered orders)
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: "Delivered" } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Delivery statistics
        const totalDeliveries = await Transport.countDocuments();
        const activeDeliveries = await Transport.countDocuments({
            status: { $in: ["Assigned", "Picked Up", "In Transit"] }
        });
        const completedDeliveries = await Transport.countDocuments({ status: "Delivered" });

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    farmers,
                    traders,
                    transport,
                    admins
                },
                crops: {
                    total: totalCrops,
                    available: availableCrops,
                    sold: soldCrops
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    accepted: acceptedOrders,
                    delivered: deliveredOrders
                },
                revenue: {
                    total: totalRevenue
                },
                deliveries: {
                    total: totalDeliveries,
                    active: activeDeliveries,
                    completed: completedDeliveries
                }
            }
        });
    } catch (error) {
        console.error("Get System Stats Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch system statistics",
            error: error.message,
        });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;

        let filter = {};
        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};

// Get all crops (admin view)
export const getAllCropsAdmin = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;

        let filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;

        const crops = await Crop.find(filter)
            .populate("farmerId", "name phone email location")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Crop.countDocuments(filter);

        res.status(200).json({
            success: true,
            crops,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error("Get All Crops Admin Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch crops",
            error: error.message,
        });
    }
};

// Get all orders (admin view)
export const getAllOrdersAdmin = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let filter = {};
        if (status) filter.orderStatus = status;

        const orders = await Order.find(filter)
            .populate("cropId", "cropName category")
            .populate("farmerId", "name phone")
            .populate("traderId", "name phone")
            .populate("transportId", "name phone")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error("Get All Orders Admin Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get all deliveries (admin view)
export const getAllDeliveriesAdmin = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let filter = {};
        if (status) filter.status = status;

        const deliveries = await Transport.find(filter)
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId", select: "cropName" },
                    { path: "farmerId", select: "name phone" },
                    { path: "traderId", select: "name phone" }
                ]
            })
            .populate("transportId", "name phone")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Transport.countDocuments(filter);

        res.status(200).json({
            success: true,
            deliveries,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error("Get All Deliveries Admin Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch deliveries",
            error: error.message,
        });
    }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Get recent crops
        const recentCrops = await Crop.find()
            .populate("farmerId", "name")
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("cropName farmerId createdAt");

        // Get recent orders
        const recentOrders = await Order.find()
            .populate("cropId", "cropName")
            .populate("traderId", "name")
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("cropId traderId orderStatus createdAt");

        // Get recent deliveries
        const recentDeliveries = await Transport.find()
            .populate("transportId", "name")
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("transportId status createdAt");

        // Combine and format activities
        const activities = [
            ...recentCrops.map(crop => ({
                type: "crop",
                message: `${crop.farmerId?.name || "Farmer"} added ${crop.cropName}`,
                timestamp: crop.createdAt
            })),
            ...recentOrders.map(order => ({
                type: "order",
                message: `${order.traderId?.name || "Trader"} ordered ${order.cropId?.cropName || "crop"}`,
                status: order.orderStatus,
                timestamp: order.createdAt
            })),
            ...recentDeliveries.map(delivery => ({
                type: "delivery",
                message: `${delivery.transportId?.name || "Transport"} ${delivery.status.toLowerCase()}`,
                timestamp: delivery.createdAt
            }))
        ];

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json({
            success: true,
            activities: activities.slice(0, limit)
        });
    } catch (error) {
        console.error("Get Recent Activities Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent activities",
            error: error.message,
        });
    }
};
