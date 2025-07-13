import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ValidationError as AppValidationError } from "../../shared/errors/application-errors.js";

export function validateRequest<T extends object>(dtoClass: new () => T) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dtoInstance = plainToInstance(dtoClass, req.body);

      const errors = await validate(dtoInstance, {
        skipMissingProperties: false,
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        const formattedErrors = errors.map((error: ValidationError) => ({
          property: error.property,
          constraints: error.constraints,
        }));

        throw new AppValidationError(
          "Request validation failed",
          formattedErrors
        );
      }

      req.body = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
}
