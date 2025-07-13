import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";

export function setupMiddlewares(app: express.Application): void {
  // Security middleware
  app.use(helmet());

  // Parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS middleware
  app.use(cors());
}

export function setupErrorHandlers(app: express.Application): void {
  // 404 handler
  app.use((req, res, next) => {
    notFoundMiddleware(req, res, next);
  });

  // Global error handler
  app.use(errorHandlerMiddleware);
}
