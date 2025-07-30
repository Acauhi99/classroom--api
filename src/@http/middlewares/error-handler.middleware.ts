import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors/application-errors.js";
import { ValidationError as ClassValidationError } from "class-validator";

export function errorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error(`[ERROR] ${error.stack || error.message}`);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      details: error.details || undefined,
    });
  }

  if (error.name === "QueryFailedError") {
    return res.status(400).json({
      status: "error",
      message: "Database operation failed",
      code: "DB_ERROR",
    });
  }

  if (
    Array.isArray(error) &&
    error.length > 0 &&
    error[0] instanceof ClassValidationError
  ) {
    const validationErrors = error.map((e) => ({
      property: e.property,
      constraints: e.constraints,
    }));

    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: validationErrors,
    });
  }

  return res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message || "Unknown error occurred",
    code: "INTERNAL_SERVER_ERROR",
  });
}
