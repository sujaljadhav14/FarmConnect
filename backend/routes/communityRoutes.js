import express from "express";
import {
    createPost,
    getAllPosts,
    likePost,
    addComment,
} from "../controllers/communityController.js";
import { requireSignIn, isFarmer } from "../middlewares/auth.js";

const router = express.Router();

// Get all posts - Farmer only
router.get("/posts", requireSignIn, isFarmer, getAllPosts);

// Create post - Farmer only
router.post("/posts", requireSignIn, isFarmer, createPost);

// Like/Unlike post - Farmer only
router.put("/posts/:postId/like", requireSignIn, isFarmer, likePost);

// Add comment - Farmer only
router.post("/posts/:postId/comment", requireSignIn, isFarmer, addComment);

export default router;
