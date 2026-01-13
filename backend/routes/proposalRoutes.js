import express from "express";
import {
    createProposal,
    getProposalsForCrop,
    getTraderProposals,
    getFarmerProposals,
    acceptProposal,
    rejectProposal,
    withdrawProposal,
    getProposalStats,
} from "../controllers/proposalController.js";
import { requireSignIn } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Trader routes
router.post("/", createProposal);                              // Create proposal
router.get("/trader", getTraderProposals);                     // Get trader's proposals
router.patch("/:proposalId/withdraw", withdrawProposal);       // Withdraw proposal

// Farmer routes
router.get("/crop/:cropId", getProposalsForCrop);              // Get proposals for a crop
router.get("/farmer", getFarmerProposals);                     // Get farmer's received proposals
router.patch("/:proposalId/accept", acceptProposal);           // Accept proposal
router.patch("/:proposalId/reject", rejectProposal);           // Reject proposal

// Statistics
router.get("/stats", getProposalStats);

export default router;
