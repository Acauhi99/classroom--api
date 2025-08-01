import { Router } from "express";
import { createHandler } from "../utils/controller.util.js";

const router = Router();

router.post("/", createHandler("userController", "create"));

router.get("/", createHandler("userController", "findAll"));

router.get("/:id", createHandler("userController", "findById"));

router.put("/:id", createHandler("userController", "update"));

router.delete("/:id", createHandler("userController", "delete"));

export const userRoutes = router;
