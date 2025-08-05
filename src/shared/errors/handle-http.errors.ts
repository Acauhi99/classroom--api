import { Response } from "express";

type HttpErrorConfig = {
  status: number;
  message: string;
};

type HttpErrorMap = Record<string, HttpErrorConfig>;

const DOMAIN_TO_HTTP_ERROR_MAP: HttpErrorMap = {
  // User errors
  UserNotFoundError: { status: 404, message: "User not found" },
  EmailAlreadyInUseError: { status: 409, message: "Email already in use" },
  InvalidEmailError: { status: 400, message: "Invalid email format" },
  InvalidPasswordError: { status: 400, message: "Invalid password format" },

  // Config errors
  MissingEnvVarError: { status: 500, message: "Server configuration error" },
  InvalidEnvVarError: { status: 500, message: "Server configuration error" },
  ConfigFileNotFoundError: {
    status: 500,
    message: "Server configuration error",
  },
  ConfigValidationError: { status: 500, message: "Server configuration error" },

  // Validation errors
  ValidationError: { status: 400, message: "Validation failed" },
};

export function mapDomainErrorToHttp(
  res: Response,
  domainError: Error,
  customErrorMap?: HttpErrorMap
): Response {
  const errorMap: HttpErrorMap = {
    ...DOMAIN_TO_HTTP_ERROR_MAP,
    ...customErrorMap,
  };

  const errorConfig = errorMap[domainError.constructor.name] || {
    status: 500,
    message: "Internal server error",
  };

  return res.status(errorConfig.status).json({
    status: "error",
    message: errorConfig.message,
  });
}

export function createHttpErrorMapper(customErrorMap?: HttpErrorMap) {
  return (res: Response, domainError: Error): Response => {
    return mapDomainErrorToHttp(res, domainError, customErrorMap);
  };
}
