export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any[];

  constructor(message: string, statusCode = 500, details?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any[]) {
    super(message, 400, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 500);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any[]) {
    super(message, 500, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class DependencyError extends AppError {
  constructor(message: string) {
    super(message, 500);
    Object.setPrototypeOf(this, DependencyError.prototype);
  }
}

export class CacheError extends AppError {
  constructor(message: string) {
    super(message, 500);
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
