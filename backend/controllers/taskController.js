import FarmTask from "../models/FarmTask.js";

// Create Task
export const createTask = async (req, res) => {
    try {
        const { title, description, date, category } = req.body;
        if (!title || !date) {
            return res.status(400).send({ message: "Title and Date are required" });
        }

        const task = new FarmTask({
            user: req.user.id || req.user._id,
            title,
            description,
            date,
            category,
        });

        await task.save();

        res.status(201).send({
            success: true,
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error creating task",
            error,
        });
    }
};

// Get All Tasks for Farmer
export const getTasks = async (req, res) => {
    try {
        const tasks = await FarmTask.find({ user: req.user.id || req.user._id }).sort({
            date: 1,
        });

        res.status(200).send({
            success: true,
            countTotal: tasks.length,
            tasks,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error getting tasks",
            error,
        });
    }
};

// Update Task
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, category, status } = req.body;

        const task = await FarmTask.findByIdAndUpdate(
            id,
            { title, description, date, category, status },
            { new: true }
        );

        res.status(200).send({
            success: true,
            message: "Task updated successfully",
            task,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error updating task",
            error,
        });
    }
};

// Delete Task
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await FarmTask.findByIdAndDelete(id);

        res.status(200).send({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error deleting task",
            error,
        });
    }
};
