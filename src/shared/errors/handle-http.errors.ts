import { Response } from "express";

type ErrorConfig = {
  status: number;
  message: string;
};

type ErrorMap = Record<string, ErrorConfig>;

const BASE_ERROR_MAP: ErrorMap = {
  UserNotFoundError: { status: 404, message: "User not found" },
  EmailAlreadyInUseError: { status: 409, message: "Email already in use" },
  InvalidEmailError: { status: 400, message: "Invalid email format" },
  InvalidPasswordError: { status: 400, message: "Invalid password format" },
  ValidationError: { status: 400, message: "Validation failed" },
  MissingEnvVarError: { status: 500, message: "Server configuration error" },
  InvalidEnvVarError: { status: 500, message: "Server configuration error" },
  ConfigFileNotFoundError: {
    status: 500,
    message: "Server configuration error",
  },
  ConfigValidationError: { status: 500, message: "Server configuration error" },
};

export function handleHttpError(
  res: Response,
  error: Error,
  customErrorMap?: ErrorMap
): Response {
  const errorMap: ErrorMap = {
    ...BASE_ERROR_MAP,
    ...customErrorMap,
  };

  const errorConfig = errorMap[error.constructor.name] || {
    status: 500,
    message: "Internal server error",
  };

  return res.status(errorConfig.status).json({
    status: "error",
    message: errorConfig.message,
  });
}

export function createErrorHandler(customErrorMap?: ErrorMap) {
  return (res: Response, error: Error): Response => {
    return handleHttpError(res, error, customErrorMap);
  };
}
