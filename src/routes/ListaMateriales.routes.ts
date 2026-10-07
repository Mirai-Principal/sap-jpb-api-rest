import { Router } from "express";

import { ListaMaterialesController } from "../modules/ListaMateriales/listaMateriales.controller";

export const ListaMateriales = Router();
const listaMaterialesController = new ListaMaterialesController();

ListaMateriales.get("/buscar-producto", listaMaterialesController.buscarProducto);
ListaMateriales.get("/:TreeCode", listaMaterialesController.getListaMaterialesPorProducto);
ListaMateriales.patch("/:TreeCode", listaMaterialesController.updateQuantity);
ListaMateriales.delete("/:TreeCode/:ChildNum", listaMaterialesController.deleteProductTreeLine);