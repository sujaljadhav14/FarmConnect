import Crop from "../models/Crop.js";
import User from "../models/userModel.js";

// Add new crop
export const addCrop = async (req, res) => {
    try {
        const {
            cropName,
            category,
            quantity,
            unit,
            pricePerUnit,
            quality,
            harvestDate,
            location,
            availabilityDate,
            description,
        } = req.body;

        // Validate required fields
        if (!cropName || !category || !quantity || !unit || !pricePerUnit || !harvestDate || !location) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // DEBUG: Log farmerId
        console.log("[ADD CROP] Farmer ID:", req.user?._id);
        console.log("[ADD CROP] User object:", req.user);

        // Create new crop
        const crop = await Crop.create({
            farmerId: req.user._id, // From auth middleware
            cropName,
            category,
            quantity,
            unit,
            pricePerUnit,
            quality: quality || "A",
            harvestDate,
            location,
            availabilityDate: availabilityDate || Date.now(),
            description,
            images: req.body.images || [],
            status: "Available",
        });

        res.status(201).json({
            success: true,
            message: "Crop added successfully",
            crop,
        });
    } catch (error) {
        console.error("Add Crop Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add crop",
            error: error.message,
        });
    }
};

// Get all crops for a specific farmer
export const getFarmerCrops = async (req, res) => {
    try {
        const farmerId = req.user._id; // From auth middleware

        const crops = await Crop.find({ farmerId })
            .populate("farmerId", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: crops.length,
            crops,
        });
    } catch (error) {
        console.error("Get Farmer Crops Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch crops",
            error: error.message,
        });
    }
};

// Get all available crops (for traders)
export const getAllAvailableCrops = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, location, quality } = req.query;

        // Build filter query
        let filter = { status: "Available" };

        if (category) {
            filter.category = category;
        }

        if (quality) {
            filter.quality = quality;
        }

        if (location) {
            filter.location = { $regex: location, $options: "i" }; // Case-insensitive search
        }

        if (minPrice || maxPrice) {
            filter.pricePerUnit = {};
            if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
            if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
        }

        const crops = await Crop.find(filter)
            .populate("farmerId", "name phone location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: crops.length,
            crops,
        });
    } catch (error) {
        console.error("Get Available Crops Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch crops",
            error: error.message,
        });
    }
};

// Get single crop details
export const getCropDetails = async (req, res) => {
    try {
        const { cropId } = req.params;

        const crop = await Crop.findById(cropId).populate("farmerId", "name phone location");

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        res.status(200).json({
            success: true,
            crop,
        });
    } catch (error) {
        console.error("Get Crop Details Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch crop details",
            error: error.message,
        });
    }
};

// Update crop
export const updateCrop = async (req, res) => {
    try {
        const { cropId } = req.params;
        const farmerId = req.user._id;

        // Find crop and verify ownership
        const crop = await Crop.findById(cropId);

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        // Check if current user is the owner
        if (crop.farmerId.toString() !== farmerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this crop",
            });
        }

        // Update crop
        const updatedCrop = await Crop.findByIdAndUpdate(
            cropId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Crop updated successfully",
            crop: updatedCrop,
        });
    } catch (error) {
        console.error("Update Crop Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update crop",
            error: error.message,
        });
    }
};

// Delete crop
export const deleteCrop = async (req, res) => {
    try {
        const { cropId } = req.params;
        const farmerId = req.user._id;

        // Find crop and verify ownership
        const crop = await Crop.findById(cropId);

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        // Check if current user is the owner
        if (crop.farmerId.toString() !== farmerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this crop",
            });
        }

        // Check if crop has reserved quantity (active orders)
        if (crop.reservedQuantity > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete crop with active orders",
            });
        }

        await Crop.findByIdAndDelete(cropId);

        res.status(200).json({
            success: true,
            message: "Crop deleted successfully",
        });
    } catch (error) {
        console.error("Delete Crop Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete crop",
            error: error.message,
        });
    }
};

// Update crop status
export const updateCropStatus = async (req, res) => {
    try {
        const { cropId } = req.params;
        const { status } = req.body;
        const farmerId = req.user._id;

        // Validate status
        if (!["Available", "Reserved", "Sold", "Unavailable"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        // Find crop and verify ownership
        const crop = await Crop.findById(cropId);

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        if (crop.farmerId.toString() !== farmerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        crop.status = status;
        await crop.save();

        res.status(200).json({
            success: true,
            message: "Crop status updated successfully",
            crop,
        });
    } catch (error) {
        console.error("Update Crop Status Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message,
        });
    }
};
