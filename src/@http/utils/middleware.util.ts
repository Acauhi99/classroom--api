import { Request, Response, NextFunction } from "express";

type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export const compose = (...middlewares: Middleware[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const runMiddleware = (index: number): Promise<void> => {
      if (index >= middlewares.length) {
        return Promise.resolve(next());
      }

      return new Promise<void>((resolve) => {
        middlewares[index](req, res, (err?: any) => {
          if (err) {
            return next(err);
          }
          resolve(runMiddleware(index + 1));
        });
      }).catch(next);
    };

    return runMiddleware(0);
  };
};

export const requireRoles = (_roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Será implementado quando adicionar autenticação
    next();
  };
};
