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
import dbConnect from "./config/db.js";
import path from "path";

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

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});

dbConnect();
