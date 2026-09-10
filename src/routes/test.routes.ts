import { Router } from "express";

import { test } from "../modules/test/test.controller";

export const TestRouter = Router();

// para probar el servicelayer
TestRouter.get("/:query", test);
