import Proposal from "../models/Proposal.js";
import Crop from "../models/Crop.js";
import mongoose from "mongoose";

// Create a new proposal (Trader)
export const createProposal = async (req, res) => {
    try {
        const traderId = req.user._id;
        const { cropId, proposedPrice, quantity, unit, message, expectedDeliveryDate, validUntil } = req.body;

        // Validate crop exists and is available
        const crop = await Crop.findById(cropId).populate("farmerId");
        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }
        if (crop.status !== "Available") {
            return res.status(400).json({ message: "Crop is not available for proposals" });
        }
        if (quantity > crop.availableQuantity) {
            return res.status(400).json({ message: "Requested quantity exceeds available quantity" });
        }

        // Calculate total amount
        const totalAmount = proposedPrice * quantity;

        // Create proposal
        const proposal = new Proposal({
            cropId,
            traderId,
            farmerId: crop.farmerId._id,
            proposedPrice,
            quantity,
            unit: unit || crop.unit,
            totalAmount,
            message,
            expectedDeliveryDate,
            validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        });

        await proposal.save();

        res.status(201).json({
            message: "Proposal submitted successfully",
            proposal,
        });
    } catch (error) {
        console.error("Error creating proposal:", error);
        res.status(500).json({ message: "Error creating proposal", error: error.message });
    }
};

// Get proposals for a crop (Farmer)
export const getProposalsForCrop = async (req, res) => {
    try {
        const { cropId } = req.params;
        const farmerId = req.user._id;

        // Verify crop belongs to farmer
        const crop = await Crop.findOne({ _id: cropId, farmerId });
        if (!crop) {
            return res.status(404).json({ message: "Crop not found or unauthorized" });
        }

        const proposals = await Proposal.find({ cropId, status: "pending" })
            .populate("traderId", "name phone rating")
            .sort({ createdAt: -1 });

        res.json(proposals);
    } catch (error) {
        console.error("Error fetching proposals:", error);
        res.status(500).json({ message: "Error fetching proposals", error: error.message });
    }
};

// Get trader's proposals
export const getTraderProposals = async (req, res) => {
    try {
        const traderId = req.user._id;
        const { status } = req.query;

        const query = { traderId };
        if (status) query.status = status;

        const proposals = await Proposal.find(query)
            .populate("cropId", "cropName category pricePerUnit images")
            .populate("farmerId", "name")
            .sort({ createdAt: -1 });

        res.json(proposals);
    } catch (error) {
        console.error("Error fetching proposals:", error);
        res.status(500).json({ message: "Error fetching proposals", error: error.message });
    }
};

// Get farmer's received proposals
export const getFarmerProposals = async (req, res) => {
    try {
        const farmerId = req.user._id;
        const { status } = req.query;

        const query = { farmerId };
        if (status) query.status = status;

        const proposals = await Proposal.find(query)
            .populate("cropId", "cropName category pricePerUnit images")
            .populate("traderId", "name rating")
            .sort({ createdAt: -1 });

        res.json(proposals);
    } catch (error) {
        console.error("Error fetching proposals:", error);
        res.status(500).json({ message: "Error fetching proposals", error: error.message });
    }
};

// Accept proposal (Farmer)
export const acceptProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const farmerId = req.user._id;
        const { farmerResponse } = req.body;

        const proposal = await Proposal.findOne({ _id: proposalId, farmerId, status: "pending" });
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found or already processed" });
        }

        // Check if proposal is expired
        if (proposal.validUntil < new Date()) {
            proposal.status = "expired";
            await proposal.save();
            return res.status(400).json({ message: "Proposal has expired" });
        }

        proposal.status = "accepted";
        proposal.respondedAt = new Date();
        proposal.farmerResponse = farmerResponse;
        await proposal.save();

        // Update crop reserved quantity
        await Crop.findByIdAndUpdate(proposal.cropId, {
            $inc: { reservedQuantity: proposal.quantity },
        });

        // Reject other pending proposals for same crop (optional - can be enabled)
        // await Proposal.updateMany(
        //   { cropId: proposal.cropId, status: "pending", _id: { $ne: proposalId } },
        //   { status: "rejected", farmerResponse: "Another proposal was accepted" }
        // );

        res.json({
            message: "Proposal accepted successfully",
            proposal,
            platformFees: proposal.platformFees,
            bookingAmount: proposal.bookingAmount,
        });
    } catch (error) {
        console.error("Error accepting proposal:", error);
        res.status(500).json({ message: "Error accepting proposal", error: error.message });
    }
};

// Reject proposal (Farmer)
export const rejectProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const farmerId = req.user._id;
        const { farmerResponse } = req.body;

        const proposal = await Proposal.findOne({ _id: proposalId, farmerId, status: "pending" });
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found or already processed" });
        }

        proposal.status = "rejected";
        proposal.respondedAt = new Date();
        proposal.farmerResponse = farmerResponse || "Proposal rejected";
        await proposal.save();

        res.json({
            message: "Proposal rejected",
            proposal,
        });
    } catch (error) {
        console.error("Error rejecting proposal:", error);
        res.status(500).json({ message: "Error rejecting proposal", error: error.message });
    }
};

// Withdraw proposal (Trader)
export const withdrawProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const traderId = req.user._id;

        const proposal = await Proposal.findOne({ _id: proposalId, traderId, status: "pending" });
        if (!proposal) {
            return res.status(404).json({ message: "Proposal not found or already processed" });
        }

        proposal.status = "withdrawn";
        await proposal.save();

        res.json({
            message: "Proposal withdrawn successfully",
            proposal,
        });
    } catch (error) {
        console.error("Error withdrawing proposal:", error);
        res.status(500).json({ message: "Error withdrawing proposal", error: error.message });
    }
};

// Get proposal statistics
export const getProposalStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        const matchField = role === "farmer" ? "farmerId" : "traderId";

        const stats = await Proposal.aggregate([
            { $match: { [matchField]: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalValue: { $sum: "$totalAmount" },
                },
            },
        ]);

        res.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Error fetching statistics", error: error.message });
    }
};
