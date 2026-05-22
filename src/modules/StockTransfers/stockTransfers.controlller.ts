import type { Request, Response } from "express";
import { TransferenciaStockService } from "./business/transferenciaStockService";

const transferenciaStockService = new TransferenciaStockService();

export const transferFromPesajeToMat = async (req: Request, res: Response) => {
    try {
        const result = await transferenciaStockService.transferFromPesajeToMat(req.body);
        res.status(200).json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: "Error al transferir desde pesaje a mat",
            error: error.message,
        });
    }
};

export const transferToUbicaciones = async (req: Request, res: Response) => {
    try {
        const result = await transferenciaStockService.transferToUbicaciones(req.body);
        res.status(200).json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: "Error al transferir entre ubicaciones",
            error: error.message,
        });
    }
};
