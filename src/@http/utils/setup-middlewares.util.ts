import express from "express";
import cors from "cors";
import helmet from "helmet";

export function setupMiddlewares(app: express.Application): void {
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
}
