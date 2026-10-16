import type { Request, Response } from "express";
import { ItemsBusiness } from "./items.business";

export class ItemsController {
    constructor(private itemsBusiness: ItemsBusiness = new ItemsBusiness()) { }

    searchItems = async (req: Request, res: Response) => {
        try {
            const search = (req.query.search ?? req.query.q ?? req.query.query)?.toString();
            const limit = req.query.limit ? Number(req.query.limit) : 20;

            const items = await this.itemsBusiness.searchItems(search, limit);
            console.info(`✅ ${items.length} artículos obtenidos exitosamente`);
            res.status(200).json({
                message: "searchItems",
                total: items.length,
                data: items,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: buscando artículos en SAP Service Layer \n", error);
            res.status(500).json({
                message: "❌ Error al buscar artículos",
                error: message,
            });
        }
    };

    getItemByCode = async (req: Request, res: Response) => {
        try {
            const itemCode = req.params.itemCode?.toString();
            if (!itemCode) {
                res.status(400).json({
                    message: "❌ El parámetro itemCode es requerido",
                });
                return;
            }

            const item = await this.itemsBusiness.getItemByCode(itemCode);
            if (!item) {
                res.status(404).json({
                    message: `❌ Artículo '${itemCode}' no encontrado`,
                });
                return;
            }

            console.info(`✅ Artículo '${itemCode}' obtenido exitosamente`);
            res.status(200).json({
                message: "getItemByCode",
                data: item,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: obteniendo artículo por código \n", error);
            res.status(500).json({
                message: "❌ Error al obtener el artículo",
                error: message,
            });
        }
    };
}
