import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.js";
import { container } from "../../shared/container/index.js";

const userRouter = Router();
const { userController } = container.controllers;

userRouter.post(
  "/",
  validateRequest(CreateUserDto),
  userController.create.bind(userController)
);

userRouter.get("/", userController.findAll.bind(userController));

userRouter.get("/:id", userController.findById.bind(userController));

userRouter.put(
  "/:id",
  validateRequest(UpdateUserDto),
  userController.update.bind(userController)
);

userRouter.delete("/:id", userController.delete.bind(userController));

export { userRouter };
