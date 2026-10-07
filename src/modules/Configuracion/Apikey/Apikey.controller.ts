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

    validateApiKey = (req: Request, res: Response)=>{
        const apiKey = req.header("x-api-key");
        const apiSfa = "cc4ba44bfbb9c41002ed0c9b3d5841e4307f98398b4c55f86b9d889f339b29dd"
        if(apiKey == apiSfa)
            return true
        else
            return false
    }


}