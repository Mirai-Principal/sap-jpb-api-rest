import type { Request, Response } from "express";

import { hanaDbConnection } from "../services/hana-db.service";
import sessionManager from "../services/session-manager.service";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const hanaResult = await hanaDbConnection.query(
      `SELECT TOP 1 * FROM OBTN`,
    );
    console.log(hanaResult);

    const sapResult = await sessionManager.request("/StockTransfers(32537)");
    console.info("Items obtenidos exitosamente");

    res.status(200).json({
      message: "Users",
      data: sapResult,
      hana: hanaResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    console.error("ERROR: obteniendo items \n", error);
    res.status(500).json({
      message: "Error al obtener los items",
      error: message,
    });
  }
};
