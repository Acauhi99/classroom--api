import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandlerMiddleware } from "../middlewares/error-handler.middleware.js";
import { notFoundMiddleware } from "../middlewares/not-found.middleware.js";

export function setupMiddlewares(app: express.Application): void {
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
}

export function setupErrorHandlers(
  app: express.Application,
  includeNotFound = true
): void {
  if (includeNotFound) {
    app.use(notFoundMiddleware);
  }

  app.use(errorHandlerMiddleware);
}
