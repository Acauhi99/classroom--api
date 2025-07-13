import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors/application-errors.js";
import { ValidationError as ClassValidationError } from "class-validator";

export function errorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  // Log error for debugging
  console.error(`[ERROR] ${error.stack || error.message}`);

  // Handle custom application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      details: error.details || undefined,
    });
  }

  // Handle TypeORM errors
  if (error.name === "QueryFailedError") {
    return res.status(400).json({
      status: "error",
      message: "Database operation failed",
    });
  }

  // Handle class-validator errors array
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
      details: validationErrors,
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
