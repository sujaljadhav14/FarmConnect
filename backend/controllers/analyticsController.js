import Order from "../models/Order.js";
import Crop from "../models/Crop.js";
import mongoose from "mongoose";

// Helper to parse ISO date strings or default ranges
const parseDateRange = (startStr, endStr, defaultDays = 90) => {
    const end = endStr ? new Date(endStr) : new Date();
    const start = startStr ? new Date(startStr) : new Date(end.getTime() - defaultDays * 24 * 60 * 60 * 1000);
    // Normalize times
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

import PriceHistory from "../models/PriceHistory.js";

export const getPriceTrend = async (req, res) => {
    try {
        const { cropId, start, end, interval = "daily" } = req.query;
        const { start: startDate, end: endDate } = parseDateRange(start, end);

        // If crop has provider symbol and PriceHistory exists, use that data
        if (cropId && mongoose.Types.ObjectId.isValid(cropId)) {
            const crop = await Crop.findById(cropId).lean();
            if (crop && crop.symbol) {
                // Attempt to fetch price history for this crop
                const histMatch = {
                    cropId: mongoose.Types.ObjectId(cropId),
                    date: { $gte: startDate, $lte: endDate },
                };
                const hist = await PriceHistory.find(histMatch).sort({ date: 1 }).lean();
                if (hist && hist.length > 0) {
                    // Aggregate into requested interval
                    const buckets = {}; // key -> { label, avgPriceArr }
                    for (const h of hist) {
                        const d = new Date(h.date);
                        let key = "";
                        if (interval === "monthly") key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
                        else if (interval === "weekly") {
                            // get ISO week
                            const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
                            const dayNum = tmp.getUTCDay() || 7;
                            tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
                            const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
                            const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
                            key = `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
                        } else {
                            key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
                        }
                        if (!buckets[key]) buckets[key] = { label: key, avgArr: [], minArr: [], maxArr: [] };
                        if (h.avgPrice != null) buckets[key].avgArr.push(h.avgPrice);
                        if (h.minPrice != null) buckets[key].minArr.push(h.minPrice);
                        if (h.maxPrice != null) buckets[key].maxArr.push(h.maxPrice);
                    }
                    const data = Object.values(buckets).map((b) => {
                        const avgPrice = b.avgArr.length ? Number((b.avgArr.reduce((s, v) => s + v, 0) / b.avgArr.length).toFixed(2)) : null;
                        const minPrice = b.minArr.length ? Number(Math.min(...b.minArr).toFixed(2)) : null;
                        const maxPrice = b.maxArr.length ? Number(Math.max(...b.maxArr).toFixed(2)) : null;
                        return { label: b.label, avgPrice, minPrice, maxPrice, totalQty: null };
                    }).sort((a, b) => a.label.localeCompare(b.label));

                    const payload = { data, start: startDate, end: endDate };

                    return res.json(payload);
                }
            }
        }

        // Fallback to orders aggregation if no price history
        const match = {
            orderDate: { $gte: startDate, $lte: endDate },
        };
        if (cropId) {
            if (!mongoose.Types.ObjectId.isValid(cropId)) return res.status(400).json({ message: "Invalid cropId" });
            match.cropId = mongoose.Types.ObjectId(cropId);
        }

        // Grouping key depends on interval
        const groupId = {};
        if (interval === "monthly") {
            groupId.year = { $year: "$orderDate" };
            groupId.month = { $month: "$orderDate" };
        } else if (interval === "weekly") {
            // ISO week grouping approximation: year + week number
            groupId.year = { $year: "$orderDate" };
            groupId.week = { $isoWeek: "$orderDate" };
        } else {
            // daily
            groupId.year = { $year: "$orderDate" };
            groupId.month = { $month: "$orderDate" };
            groupId.day = { $dayOfMonth: "$orderDate" };
        }

        const pipeline = [
            { $match: match },
            {
                $group: {
                    _id: groupId,
                    avgPrice: { $avg: "$pricePerUnit" },
                    minPrice: { $min: "$pricePerUnit" },
                    maxPrice: { $max: "$pricePerUnit" },
                    totalQty: { $sum: "$quantity" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } },
        ];

        const results = await Order.aggregate(pipeline);

        // Map to date labels
        const data = results.map((r) => {
            const id = r._id;
            let label = "";
            if (id.week !== undefined) {
                label = `${id.year}-W${String(id.week).padStart(2, "0")}`;
            } else if (id.day !== undefined) {
                label = `${id.year}-${String(id.month).padStart(2, "0")}-${String(id.day).padStart(2, "0")}`;
            } else {
                label = `${id.year}-${String(id.month).padStart(2, "0")}`;
            }
            return {
                label,
                avgPrice: Number(r.avgPrice.toFixed(2)),
                minPrice: Number(r.minPrice.toFixed(2)),
                maxPrice: Number(r.maxPrice.toFixed(2)),
                totalQty: r.totalQty,
            };
        });

        const payload = { data, start: startDate, end: endDate };

        return res.json(payload);
    } catch (err) {
        console.error("[Analytics] getPriceTrend error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getTopCrops = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 5;
        const { start, end } = parseDateRange(req.query.start, req.query.end, 365);

        const pipeline = [
            { $match: { orderDate: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: "$cropId",
                    totalQty: { $sum: "$quantity" },
                    totalValue: { $sum: { $multiply: ["$quantity", "$pricePerUnit"] } },
                },
            },
            { $sort: { totalQty: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "crops",
                    localField: "_id",
                    foreignField: "_id",
                    as: "crop",
                },
            },
            { $unwind: { path: "$crop", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    cropId: "$_id",
                    totalQty: 1,
                    totalValue: 1,
                    cropName: "$crop.name",
                    cropImage: "$crop.images",
                },
            },
        ];

        const results = await Order.aggregate(pipeline);
        return res.json({ data: results, start, end });
    } catch (err) {
        console.error("[Analytics] getTopCrops error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export default {
    getPriceTrend,
    getTopCrops,
};