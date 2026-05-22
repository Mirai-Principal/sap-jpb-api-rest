import { Router } from "express";

import { transferFromPesajeToMat, transferToUbicaciones } from "../modules/StockTransfers/stockTransfers.controlller";

export const sap = Router();

// POST /api/v1/sap/tsFromPesajeToMat - Transfer from pesaje to mat
sap.post("/tsFromPesajeToMat", async (req, res) => {
    await transferFromPesajeToMat(req, res);
});

// POST /api/v1/sap/tsToUbicaciones - Transfer to ubicaciones
sap.post("/tsToUbicaciones", async (req, res) => {
    await transferToUbicaciones(req, res);
});