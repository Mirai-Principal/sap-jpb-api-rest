import type { Request, Response } from "express";

import ServiceFacade from "../../services/service.facade";


export const test = async (req: Request, res: Response) => {
  try {

    const endpoint = req.body.query;
    const method = req.body.method;
    const body = req.body.body;
    const headers = req.body.headers;

    const sapResult = await ServiceFacade.serviceLayer.request(endpoint, method, body, headers);
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