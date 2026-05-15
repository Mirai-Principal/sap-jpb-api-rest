import { Router } from "express";

import { loginSap } from "../controllers/sap.controlller";

export const sapRouter = Router();

// GET /api/v1/sap/login - Login SAP
sapRouter.get("/login", loginSap);