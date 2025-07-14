import "reflect-metadata";
import express from "express";
import { config } from "dotenv";
import { AppDataSource } from "./@infrastructure/database/data-source.js";
import { cacheService } from "./@infrastructure/cache/memcached-service.js";
import { apiRouter } from "./@http/api.router.js";
import {
  setupMiddlewares,
  setupErrorHandlers,
} from "./@http/setup.middleware.js";
import { container } from "./shared/container/index.js";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT;

// Configure middlewares
setupMiddlewares(app);

// API routes
app.use("/api", apiRouter);

// Configure error handlers
setupErrorHandlers(app);

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("📦 Database connection established");

    container.reset();
    console.log("🧩 Dependency container initialized");

    await cacheService.set("startup_test", { success: true });
    console.log("🧠 Cache service initialized");

    if (!PORT) {
      throw new Error("PORT environment variable is not defined");
    }

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
