import { Router } from "express";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto.js";
import { createHandler } from "../utils/controller.util.js";
import { compose } from "../utils/middleware.util.js";

const router = Router();

router.post(
  "/",
  compose(
    validateRequest(CreateUserDto),
    createHandler("userController", "create")
  )
);

router.get("/", createHandler("userController", "findAll"));

router.get("/:id", createHandler("userController", "findById"));

router.put(
  "/:id",
  compose(
    validateRequest(UpdateUserDto),
    createHandler("userController", "update")
  )
);

router.delete("/:id", createHandler("userController", "delete"));

export const userRoutes = router;
