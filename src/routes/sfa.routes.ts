import { Router } from "express";

import { test } from "../modules/test/test.controller";

export const SfaRouter = Router();

// para probar el servicelayer
SfaRouter.post("/", test);
