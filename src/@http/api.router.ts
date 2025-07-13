import { Router } from "express";
import { userRouter } from "./routes/user.route.js";

const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// API documentation endpoint
apiRouter.get("/docs", (req, res) => {
  res.json({
    message: "API documentation",
    documentationUrl: "https://example.com/api-docs",
  });
});

// Resource routes
apiRouter.use("/users", userRouter);

export { apiRouter };
