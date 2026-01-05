import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import transportRoutes from "./routes/transportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import agreementRoutes from "./routes/agreementRoutes.js";
import vehicleManagementRoutes from "./routes/vehicleManagementRoutes.js";
import dbConnect from "./config/db.js";
import path from "path";
import { scheduleWeatherUpdates } from "./utils/weatherScheduler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Log incoming weather API requests for debugging
app.use("/api/weather", (req, res, next) => {
  try {
    console.log("[Weather API] Incoming request:", req.method, req.originalUrl);
    if (req.method === "POST" || req.method === "PUT") {
      console.log("[Weather API] Body:", JSON.stringify(req.body));
    }
  } catch (err) {
    console.error("[Weather API] Logging error:", err);
  }
  next();
});

// Set socketio to app instance
app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.status(200).send("Farmer Trader Platform ");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/vehicles", vehicleManagementRoutes);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});

dbConnect();

// Start weather update scheduler
scheduleWeatherUpdates(io);
console.log("Weather scheduler initialized");

