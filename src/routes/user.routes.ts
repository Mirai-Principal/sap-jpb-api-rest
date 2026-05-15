import { Router } from "express";

import { getUsers } from "../controllers/user.controller";

export const userRouter = Router();

// GET /api/v1/users - Obtener todos los usuarios
userRouter.get("/", getUsers);

// GET /api/v1/users/:id - Obtener un usuario por ID
// userRouter.get("/:id", getUserById);
