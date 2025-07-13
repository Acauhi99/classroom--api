import { Request, Response, NextFunction } from "express";

export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  return res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}
