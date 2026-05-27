import type { Request, Response } from "express";

import ServiceFacade from "../../services/service.facade";


export const test = async (req: Request, res: Response) => {
  try {
    const sapResult = await ServiceFacade.serviceLayer.request(req.params.query);
    console.info("✅ Items obtenidos exitosamente");

    res.status(200).json({
      message: "test",
      data: sapResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    console.error("❌ ERROR: obteniendo items \n", error);
    res.status(500).json({
      message: "❌ Error al obtener los items",
      error: message,
    });
  }
};