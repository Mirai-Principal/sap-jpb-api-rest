import { Router } from "express";

import { transferFromPesajeToMat } from "../modules/StockTransfers/stockTransfers.controlller";

export const sap = Router();

// POST /api/v1/sap/stock-transfers - Transfer from pesaje to mat
sap.post("/stock-transfers", async (req, res) => {
    await transferFromPesajeToMat(req, res);
});