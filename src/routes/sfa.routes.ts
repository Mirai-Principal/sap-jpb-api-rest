import { Router } from "express";

import { SfaController } from "../modules/sfa/sfa.controller";

export const SfaRouter = Router();
const sfaController = new SfaController();

SfaRouter.post("/servicelayer", sfaController.serviceLayer);
SfaRouter.post("/hanadb", sfaController.hanaDB);
