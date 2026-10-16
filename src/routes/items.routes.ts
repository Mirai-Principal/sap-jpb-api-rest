import { Router } from "express";
import { ItemsController } from "../modules/Items/items.controller";

export const ItemsRouter = Router();
const itemsController = new ItemsController();

ItemsRouter.get("/", itemsController.searchItems);
ItemsRouter.get("/:itemCode", itemsController.getItemByCode);
