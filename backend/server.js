import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import transportRoutes from "./routes/transportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dbConnect from "./config/db.js";
import path from "path";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.status(200).send("Farmer Trader Platform ");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});

dbConnect();
