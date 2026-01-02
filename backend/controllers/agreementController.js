import Agreement from "../models/Agreement.js";
import Order from "../models/Order.js";
import User from "../models/userModel.js";

// Farmer signs agreement
export const farmerSignAgreement = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { qualityCommitment, qualityGrade, qualityDescription, certifications } = req.body;
        const farmerId = req.user._id;

        // Find the order
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
                message: "Only the farmer can sign this agreement",
            });
        }

        // Check if order is in pending state
        if (order.orderStatus !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Can only sign agreement for pending orders",
            });
        }

        // Check if agreement already exists
        let agreement = await Agreement.findOne({ orderId });

        if (agreement && agreement.farmerAgreement.signed) {
            return res.status(400).json({
                success: false,
                message: "Agreement already signed by farmer",
            });
        }

        // Calculate payment amounts
        const advanceAmount = Math.round(order.totalPrice * 0.30);
        const finalAmount = order.totalPrice - advanceAmount;

        // Create or update agreement
        if (!agreement) {
            agreement = await Agreement.create({
                orderId,
                farmerAgreement: {
                    signed: true,
                    signedAt: new Date(),
                    qualityCommitment: qualityCommitment || "I commit to supply the produce as per the agreed quality and quantity.",
                    termsAccepted: true,
                },
                qualityDetails: {
                    grade: qualityGrade || "Standard",
                    description: qualityDescription || "",
                    certifications: certifications || "",
                },
                paymentTerms: {
                    advancePercentage: 30,
                    finalPercentage: 70,
                    advanceAmount,
                    finalAmount,
                },
                status: "pending_trader",
            });
        } else {
            agreement.farmerAgreement = {
                signed: true,
                signedAt: new Date(),
                qualityCommitment: qualityCommitment || agreement.farmerAgreement.qualityCommitment,
                termsAccepted: true,
            };
            agreement.qualityDetails = {
                grade: qualityGrade || "Standard",
                description: qualityDescription || "",
                certifications: certifications || "",
            };
            agreement.status = "pending_trader";
            await agreement.save();
        }

        // Update order status
        order.orderStatus = "Farmer Agreed";
        order.agreementId = agreement._id;
        order.agreementStatus = "pending_trader";
        order.advanceAmount = advanceAmount;
        order.finalAmount = finalAmount;
        order.totalPayable = order.totalPrice;
        await order.save();

        // Populate and return
        const populatedAgreement = await Agreement.findById(agreement._id)
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId", select: "cropName category unit quality" },
                    { path: "farmerId", select: "name phone" },
                    { path: "traderId", select: "name phone" },
                ],
            });

        res.status(200).json({
            success: true,
            message: "Agreement signed successfully. Waiting for trader confirmation.",
            agreement: populatedAgreement,
        });
    } catch (error) {
        console.error("Farmer Sign Agreement Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to sign agreement",
            error: error.message,
        });
    }
};

// Trader confirms/signs agreement
export const traderSignAgreement = async (req, res) => {
    try {
        const { orderId } = req.params;
        const traderId = req.user._id;

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check if current user is the trader
        if (order.traderId.toString() !== traderId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the trader can confirm this agreement",
            });
        }

        // Check if order is waiting for trader agreement
        if (order.orderStatus !== "Farmer Agreed") {
            return res.status(400).json({
                success: false,
                message: "Farmer must sign the agreement first",
            });
        }

        // Find the agreement
        const agreement = await Agreement.findOne({ orderId });

        if (!agreement) {
            return res.status(404).json({
                success: false,
                message: "Agreement not found",
            });
        }

        if (!agreement.farmerAgreement.signed) {
            return res.status(400).json({
                success: false,
                message: "Farmer has not signed the agreement yet",
            });
        }

        if (agreement.traderAgreement.signed) {
            return res.status(400).json({
                success: false,
                message: "You have already confirmed this agreement",
            });
        }

        // Update trader agreement
        agreement.traderAgreement = {
            signed: true,
            signedAt: new Date(),
            paymentTermsAccepted: true,
        };
        agreement.status = "completed";
        await agreement.save();

        // Update order status
        order.orderStatus = "Both Agreed";
        order.agreementStatus = "completed";
        await order.save();

        // Populate and return
        const populatedAgreement = await Agreement.findById(agreement._id)
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId", select: "cropName category unit quality" },
                    { path: "farmerId", select: "name phone" },
                    { path: "traderId", select: "name phone" },
                ],
            });

        res.status(200).json({
            success: true,
            message: "Agreement confirmed! Please proceed with 30% advance payment.",
            agreement: populatedAgreement,
        });
    } catch (error) {
        console.error("Trader Sign Agreement Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to confirm agreement",
            error: error.message,
        });
    }
};

// Get agreement details
export const getAgreement = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check authorization
        const isAuthorized =
            order.farmerId.toString() === userId.toString() ||
            order.traderId.toString() === userId.toString() ||
            req.user.role === "admin";

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this agreement",
            });
        }

        const agreement = await Agreement.findOne({ orderId })
            .populate({
                path: "orderId",
                populate: [
                    { path: "cropId", select: "cropName category unit quality images" },
                    { path: "farmerId", select: "name phone" },
                    { path: "traderId", select: "name phone" },
                ],
            });

        if (!agreement) {
            return res.status(404).json({
                success: false,
                message: "No agreement found for this order",
            });
        }

        res.status(200).json({
            success: true,
            agreement,
        });
    } catch (error) {
        console.error("Get Agreement Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch agreement",
            error: error.message,
        });
    }
};

// Cancel agreement
export const cancelAgreement = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { cancellationReason } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Check authorization (only farmer or trader can cancel)
        const isFarmer = order.farmerId.toString() === userId.toString();
        const isTrader = order.traderId.toString() === userId.toString();

        if (!isFarmer && !isTrader) {
            return res.status(403).json({
                success: false,
                message: "Only farmer or trader can cancel the agreement",
            });
        }

        // Can only cancel before advance payment
        const cancellableStatuses = ["Pending", "Farmer Agreed", "Both Agreed"];
        if (!cancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel agreement after advance payment is made",
            });
        }

        // Update agreement if exists
        const agreement = await Agreement.findOne({ orderId });
        if (agreement) {
            agreement.status = "cancelled";
            agreement.cancelledBy = userId;
            agreement.cancellationReason = cancellationReason || "No reason provided";
            agreement.cancelledAt = new Date();
            await agreement.save();
        }

        // Update order
        order.orderStatus = "Cancelled";
        order.agreementStatus = "none";
        order.cancellationReason = cancellationReason || "Agreement cancelled";
        await order.save();

        // Release reserved quantity if crop has reservedQuantity field
        // (This was already being done in the original cancelOrder function)

        res.status(200).json({
            success: true,
            message: "Agreement cancelled successfully",
        });
    } catch (error) {
        console.error("Cancel Agreement Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel agreement",
            error: error.message,
        });
    }
};
