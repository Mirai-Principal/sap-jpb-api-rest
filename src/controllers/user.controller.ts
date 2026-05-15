import type { Request, Response } from "express";
import sessionManager from "../services/session-manager.service";


export const getUsers = async (_req: Request, res: Response) => {
  await sessionManager.request("Items?$top=5").then((data: any) => {
    console.info("✅ Items obtenidos exitosamente");
    res.status(200).json({
      message: "Users",
      data: data,
    })
  }).catch((error: any) => {
    console.error("❌ ERROR: obteniendo items \n", error);
    res.status(500).json({
      message: "Error al obtener los items",
      error: error,
    });
  });
};
