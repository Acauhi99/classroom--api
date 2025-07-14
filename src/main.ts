import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./@infrastructure/database/data-source.js";
import { cacheService } from "./@infrastructure/cache/memcached-service.js";
import { setupMiddlewares } from "./@http/utils/setup-middlewares.util.js";
import { container } from "./shared/container/dependency-container.js";
import { registerRoutes } from "./@http/utils/routes.util.js";
import { notFoundMiddleware } from "./@http/middlewares/not-found.middleware.js";
import { errorHandlerMiddleware } from "./@http/middlewares/error-handler.middleware.js";
import {
  ConfigurationError,
  DatabaseError,
} from "./shared/errors/application-errors.js";

const app = express();
const PORT = process.env.PORT;

setupMiddlewares(app);

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("📦 Database connection established");
  } catch (error) {
    throw new DatabaseError("Failed to initialize database", [
      { cause: error },
    ]);
  }
}

async function initializeServices() {
  container.reset();
  console.log("🧩 Dependency container initialized");

  await cacheService.set("startup_test", { success: true });
  console.log("🧠 Cache service initialized");
}

function configureRouting() {
  registerRoutes(app);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);
}

function startHttpServer() {
  if (!PORT) {
    throw new ConfigurationError("PORT environment variable is not defined");
  }

  return app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

async function bootstrap() {
  try {
    await initializeDatabase();
    await initializeServices();
    configureRouting();
    startHttpServer();

    console.log("✅ Application startup complete");
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
