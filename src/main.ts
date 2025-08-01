import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./@infrastructure/database/data-source.js";
import { MemcachedService } from "./@infrastructure/cache/memcached-service.js";
import { setupMiddlewares } from "./@http/utils/setup-middlewares.util.js";
import { container } from "./shared/container/dependency-container.js";
import { registerRoutes } from "./@http/utils/routes.util.js";

const app = express();
const PORT = process.env.PORT;
let cacheService: MemcachedService;

setupMiddlewares(app);

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("📦 Database connection established");

    await AppDataSource.runMigrations();
    console.log("📜 Migrations executed");

    return true;
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);

    return false;
  }
}

async function initializeCache() {
  const cacheResult = MemcachedService.create();

  if (cacheResult.isLeft()) {
    console.error(
      "❌ Failed to initialize cache service:",
      cacheResult.value.message
    );

    return false;
  }

  cacheService = cacheResult.value;
  await cacheService.set("startup_test", { success: true });
  console.log("🧠 Cache service initialized");

  return true;
}

async function initializeDependencies() {
  container.reset();
  console.log("🧩 Dependency container initialized");
}

function startHttpServer() {
  if (!PORT) {
    console.error("❌ PORT environment variable is not defined");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

async function bootstrap() {
  if (!(await initializeDatabase())) process.exit(1);
  if (!(await initializeCache())) process.exit(1);

  await initializeDependencies();

  registerRoutes(app);
  startHttpServer();

  console.log("✅ Application startup complete");
}

bootstrap();
