import "reflect-metadata";
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { AppDataSource } from "./@infrastructure/database/data-source.js";
import { cacheService } from "./@infrastructure/cache/memcached-service.js";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

app.get("/api/docs", (req, res) => {
  res.json({
    message: "API documentation",
    documentationUrl: "https://example.com/api-docs",
  });
});

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("📦 Database connection established");

    await cacheService.set("startup_test", { success: true });
    console.log("🧠 Cache service initialized");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
