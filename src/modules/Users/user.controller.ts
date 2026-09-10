import type { Request, Response } from "express";
import ServiceFacade from "../../services/service.facade";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    const endpoint = `Users?$select=InternalKey,UserCode,UserName,Locked,LastLogoutDate&$filter=LastLogoutDate ne null and LastLogoutDate ge '${currentYear}-${currentMonth}-01'`;

    const sapResult = await ServiceFacade.serviceLayer.request(
      endpoint,
      "GET",
      undefined,
      { "Prefer": "odata.maxpagesize=500" }
    );
    console.info("✅ Usuarios obtenidos exitosamente");

    res.status(200).json({
      message: "getUsers",
      data: sapResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";

    console.error("❌ ERROR: obteniendo usuarios \n", error);
    res.status(500).json({
      message: "❌ Error al obtener los usuarios",
      error: message,
    });
  }
}