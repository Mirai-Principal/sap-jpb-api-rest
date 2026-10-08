import type { Request, Response } from "express";
import { ApikeyBusiness } from "./Apikey.business";

export class ApikeyController {
    constructor(private apikeyBusiness: ApikeyBusiness = new ApikeyBusiness()) { }

    generateApiKey = async (req: Request, res: Response) => {
        try {
            const apikey = await this.apikeyBusiness.generateApiKey();
            console.info("✅ Apikey obtenida exitosamente");
            res.status(200).json({
                message: "getApikey",
                data: apikey,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: obteniendo Apikey ", error);
            res.status(500).json({
                message: "❌ Error al obtener la Apikey",
                error: message,
            });
        }
    };

    validateApiKey = async (req: Request, res: Response) => {
        try {
            const apiKey = req.header("x-api-key");

            //temporal mientras se implementa 
            const apiSfa = "1999295F480CE1A208EC264A0C9CA82D6D1899485664EAA479360D6F2566A2D1"

            if (!apiKey) {
                res.status(400).json({
                    message: "❌ El campo x-api-key es requerido",
                });
                return;
            }

            const result = apiKey == apiSfa ? true : false;
            console.info("✅ Apikey validada exitosamente");
            return result;  
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: validando Apikey ", error);
            res.status(500).json({
                message: "❌ Error al validar la Apikey",
                error: message,
            });
        }
    };


}