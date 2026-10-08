import type { Request, Response } from "express";

import serviceFacade from "../../services/service.facade";

export class SfaController {
  serviceLayer = async (req: Request, res: Response) => {
    try {

      const endpoint = req.body.query;
      const method = req.body.method;
      const body = req.body.body;
      const headers = req.body.headers;

      const sapResult = await serviceFacade.serviceLayer.request(endpoint, method, body, headers);
      console.info("✅ Petición realizada correctamente");

      res.status(200).json({
        message: "serviceLayer",
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


  hanaDB = async (req: Request, res: Response) => {
    try {
      const { query, params = [] } = req.body;

      if (!query) {
        res.status(400).json({
          message: "❌ El campo query es requerido",
        });
        return;
      }

      //solo q permita select 
      if (!query.toLowerCase().startsWith("select") || !query.toUpperCase().startsWith("SELECT")) {
        res.status(400).json({
          message: "❌ Solo se permiten consultas SELECT",
        });
        return;
      }

      const sapResult = await serviceFacade.hanaDb.query(query, params);
      console.info("✅ Consulta HANA ejecutada exitosamente");

      res.status(200).json({
        message: "hanaDB",
        data: sapResult,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";

      console.error("❌ ERROR: ejecutando consulta HANA DB \n", error);
      res.status(500).json({
        message: "❌ Error al ejecutar la consulta en HANA DB",
        error: message,
      });
    }
  };
}