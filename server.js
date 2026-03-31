import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import componentRoutes from "./routes/componentRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import recommendRoutes from "./routes/recommendRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRecommendations.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

//ping to prevent idling on Render
setInterval(() => {
  fetch('https://pc-builder-backend-1w1d.onrender.com/api/health')
}, 5 * 60 * 1000); // Every 5 minutes

// Routes
app.use("/api/components", componentRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "PC Builder API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`PC Builder API running on port ${PORT}`);
});
