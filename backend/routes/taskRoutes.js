import express from "express";
import {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} from "../controllers/taskController.js";
import { requireSignIn, isFarmer } from "../middlewares/auth.js";

const router = express.Router();

// Create Task
router.post("/create", requireSignIn, isFarmer, createTask);

// Get All Tasks
router.get("/my-tasks", requireSignIn, isFarmer, getTasks);

// Update Task
router.put("/update/:id", requireSignIn, isFarmer, updateTask);

// Delete Task
router.delete("/delete/:id", requireSignIn, isFarmer, deleteTask);

export default router;
