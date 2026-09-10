import { Router } from "express";

import { transferFromPesajeToMat, transferToUbicaciones } from "../modules/StockTransfers/stockTransfers.controller";

export const Sap = Router();

// POST /api/v1/sap/tsFromPesajeToMat - Transfer from pesaje to mat
Sap.post("/tsFromPesajeToMat", async (req, res) => {
    await transferFromPesajeToMat(req, res);
});

// POST /api/v1/sap/tsToUbicaciones - Transfer to ubicaciones
Sap.post("/tsToUbicaciones", async (req, res) => {
    await transferToUbicaciones(req, res);
});