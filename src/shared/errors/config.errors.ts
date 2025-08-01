export class MissingEnvVarError extends Error {
  constructor(variable: string) {
    super(`Missing required environment variable: ${variable}`);
    this.name = "MissingEnvVarError";
  }
}

export class InvalidEnvVarError extends Error {
  constructor(variable: string, reason?: string) {
    super(
      `Invalid value for environment variable: ${variable}${
        reason ? ` (${reason})` : ""
      }`
    );
    this.name = "InvalidEnvVarError";
  }
}

export class ConfigFileNotFoundError extends Error {
  constructor(path: string) {
    super(`Configuration file not found at path: ${path}`);
    this.name = "ConfigFileNotFoundError";
  }
}

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(`Configuration validation error: ${message}`);
    this.name = "ConfigValidationError";
  }
}
