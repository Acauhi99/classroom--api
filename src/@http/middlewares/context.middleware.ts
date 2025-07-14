import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      context: {
        userId?: string;
        roles?: string[];
        requestId: string;
        startTime: number;
      };
    }
  }
}

export function contextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.context = {
    requestId: crypto.randomUUID(),
    startTime: Date.now(),
  };

  next();
}
