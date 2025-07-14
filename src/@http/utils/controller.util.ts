import { Request, Response, NextFunction } from "express";
import { container } from "../../shared/container/dependency-container.js";
import { UserController } from "../controllers/user.controller.js";

type ControllerMethod = (req: Request, res: Response) => Promise<Response>;

type ControllerMap = {
  userController: UserController;
};

export const createHandler = <T extends keyof ControllerMap>(
  controller: T,
  method: keyof ControllerMap[T]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controllerInstance = container.get<ControllerMap[T]>(controller);

      const handler = controllerInstance[method] as unknown as ControllerMethod;

      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
};
