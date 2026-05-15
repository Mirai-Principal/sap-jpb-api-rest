import type { Request, Response } from "express";
import sessionManager from "../services/session-manager.service";

export const loginSap = async (_req: Request, res: Response) => {
    try {
        const data = await sessionManager.login();
        res.status(200).json({
            message: "Login SAP",
            data,
        });
    } catch (error: any) {
        console.error("❌ ERROR: autenticando con SAP \n", error);
        res.status(500).json({
            message: "Error al autenticar con SAP",
            error: error.message,
        });
    }
};