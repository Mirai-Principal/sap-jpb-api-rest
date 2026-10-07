import { Router } from "express";
import { ApikeyController } from "../modules/Configuracion/Apikey/Apikey.controller";

export const ConfiguracionRouter = Router();
const apikeyController = new ApikeyController();

ConfiguracionRouter.get("/generate-api-key", apikeyController.generateApiKey);