import { Router } from "express";

import { test } from "../modules/test/test.controller";

export const testRouter = Router();

// GET /api/v1/test - Obtener todos los usuarios
testRouter.get("/:query", test);
testRouter.post("/StockTransfers", test);


// GET /api/v1/test/:id - Obtener un usuario por ID
// userRouter.get("/:id", getUserById);
