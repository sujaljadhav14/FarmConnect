import Proposal from "../models/Proposal.js";
import Crop from "../models/Crop.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// Create a new proposal (Trader)
export const createProposal = async (req, res) => {
    try {
        const traderId = req.user._id;
        const { cropId, proposedPrice, quantity, unit, message, expectedDeliveryDate, validUntil } = req.body;

        console.log("[CREATE PROPOSAL] Request:", { traderId, cropId, proposedPrice, quantity });

        // Validate crop exists and is available
        const crop = await Crop.findById(cropId).populate("farmerId");
        if (!crop) {
            console.log("[CREATE PROPOSAL] Crop not found:", cropId);
            return res.status(404).json({ message: "Crop not found" });
        }

        console.log("[CREATE PROPOSAL] Crop found:", {
            cropName: crop.cropName,
            farmerId: crop.farmerId?._id || crop.farmerId,
            status: crop.status
        });

        if (crop.status !== "Available") {
            return res.status(400).json({ message: "Crop is not available for proposals" });
        }
        if (quantity > crop.availableQuantity) {
            return res.status(400).json({ message: "Requested quantity exceeds available quantity" });
        }

        // Calculate total amount
        const totalAmount = proposedPrice * quantity;

        // Extract farmerId properly
        const farmerId = crop.farmerId?._id || crop.farmerId;

        console.log("[CREATE PROPOSAL] Creating proposal with farmerId:", farmerId);

        // Create proposal
        const proposal = new Proposal({
            cropId,
            traderId,
            farmerId,
            proposedPrice,
            quantity,
            unit: unit || crop.unit,
            totalAmount,
            message,
            expectedDeliveryDate,
            validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        });

        await proposal.save();

        console.log("[CREATE PROPOSAL] Proposal created successfully:", proposal._id);

        res.status(201).json({
            message: "Proposal submitted successfully",
            proposal,
        });
    } catch (error) {
        console.error("[CREATE PROPOSAL] Error:", error);
        console.error("[CREATE PROPOSAL] Error stack:", error.stack);
        res.status(500).json({
            message: "Error creating proposal",
            error: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : null
        });
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

        // Fetch ALL proposals for this crop (pending, accepted, rejected)
        const proposals = await Proposal.find({ cropId })
            .populate("traderId", "name phone rating creditScore totalRatings")
            .sort({ createdAt: -1 });

        // Smart sorting: Rank by credit score + price + rating
        // 40% credit score + 35% price + 25% rating
        if (proposals.length > 0) {
            // Find max price for normalization
            const maxPrice = Math.max(...proposals.map(p => p.proposedPrice));

            proposals.sort((a, b) => {
                const scoreA = calculateBidScore(a, maxPrice);
                const scoreB = calculateBidScore(b, maxPrice);
                return scoreB - scoreA; // Higher score first
            });
        }

        res.json(proposals);
    } catch (error) {
        console.error("Error fetching proposals:", error);
        res.status(500).json({ message: "Error fetching proposals", error: error.message });
    }
};

// Helper function to calculate bid ranking score
function calculateBidScore(proposal, maxPrice) {
    const trader = proposal.traderId;

    // Weights
    const creditWeight = 0.40;  // 40% weight
    const priceWeight = 0.35;   // 35% weight
    const ratingWeight = 0.25;  // 25% weight

    // Normalize credit score (0-1000+ to 0-100 scale)
    const creditScore = Math.min((trader.creditScore / 1000) * 100, 100);

    // Normalize price (0 to maxPrice scale to 0-100)
    const priceScore = maxPrice > 0 ? (proposal.proposedPrice / maxPrice) * 100 : 0;

    // Normalize rating (0-5 to 0-100 scale)
    const ratingScore = (trader.rating / 5) * 100;

    const finalScore = (
        creditScore * creditWeight +
        priceScore * priceWeight +
        ratingScore * ratingWeight
    );

    return finalScore;
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

        // Get crop details for order creation
        const crop = await Crop.findById(proposal.cropId);

        // Auto-create an order when proposal is accepted
        const newOrder = new Order({
            cropId: proposal.cropId,
            farmerId: proposal.farmerId,
            traderId: proposal.traderId,
            quantity: proposal.quantity,
            pricePerUnit: proposal.proposedPrice,
            totalPrice: proposal.totalAmount,
            deliveryAddress: req.body.deliveryAddress || "To be confirmed", // Can be updated later
            paymentMethod: "Advance", // Default to 30/70 split
            paymentStatus: "Pending",
            orderStatus: "Pending",
            expectedDeliveryDate: proposal.expectedDeliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            notes: `Auto-created from accepted proposal. Trader message: ${proposal.message || 'None'}`,
            // Calculate payment breakdown
            advanceAmount: proposal.totalAmount * 0.3,
            finalAmount: proposal.totalAmount * 0.7,
            totalPayable: proposal.totalAmount,
        });

        await newOrder.save();

        // Link order to proposal
        proposal.orderId = newOrder._id;
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
            message: "Proposal accepted successfully. Order created!",
            proposal,
            order: newOrder,
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
