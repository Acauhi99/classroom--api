import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.js";
import { controllers } from "../../shared/container/index.js";

const userRouter = Router();

userRouter.post(
  "/",
  validateRequest(CreateUserDto),
  controllers.userController.create.bind(controllers.userController)
);

userRouter.get(
  "/",
  controllers.userController.findAll.bind(controllers.userController)
);

userRouter.get(
  "/:id",
  controllers.userController.findById.bind(controllers.userController)
);

userRouter.put(
  "/:id",
  validateRequest(UpdateUserDto),
  controllers.userController.update.bind(controllers.userController)
);

userRouter.delete(
  "/:id",
  controllers.userController.delete.bind(controllers.userController)
);

export { userRouter };
