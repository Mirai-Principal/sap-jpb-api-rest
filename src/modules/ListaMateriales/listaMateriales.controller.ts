import type { Request, Response } from "express";
import { ListaMaterialesBusiness } from "./listaMateriales.business";

export class ListaMaterialesController {
    constructor(private listaMaterialesBusiness: ListaMaterialesBusiness = new ListaMaterialesBusiness()) { }

    buscarProducto = async (req: Request, res: Response) => {
        try {
            const productDescription = req.query.producto?.toString().toUpperCase();
            if (!productDescription) {
                res.status(400).json({
                    message: "❌ El campo producto es requerido",
                });
                return;
            }
            const result = await this.listaMaterialesBusiness.buscarProducto(productDescription);
            console.info("✅ Lista de materiales obtenida exitosamente");
            res.status(200).json({
                message: "buscarProducto",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: obteniendo Items \n", error);
            res.status(500).json({
                message: "❌ Error al obtener los Items",
                error: message,
            });
        }
    };

    getListaMaterialesPorProducto = async (req: Request, res: Response) => {
        try {
            const TreeCode = (req.params.TreeCode)?.toString();
            if (!TreeCode) {
                res.status(400).json({
                    message: "❌ El campo TreeCode es requerido",
                });
                return;
            }
            const result = await this.listaMaterialesBusiness.getListaMaterialesPorProducto(TreeCode);
            console.info("✅ Lista de materiales obtenida exitosamente");
            res.status(200).json({
                message: "getListaMaterialesPorProducto",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: obteniendo Lista de materiales ", error);
            res.status(500).json({
                message: "❌ Error al obtener la Lista de materiales",
                error: message,
            });
        }
    };

    // update Quantity of a ProductTreeLine
    updateQuantity = async (req: Request, res: Response) => {
        try {
            const TreeCode = (req.params.TreeCode)?.toString();
            const { ChildNum, Quantity } = req.body;
            if (!TreeCode || ChildNum === undefined || ChildNum === null || Quantity === undefined || Quantity === null) {
                res.status(400).json({
                    message: "❌ El campo TreeCode, ChildNum y Quantity es requerido",
                });
                return;
            }
            const result = await this.listaMaterialesBusiness.updateQuantity(TreeCode, Number(ChildNum), Number(Quantity));
            console.info("✅ Cantidad actualizada exitosamente");
            res.status(200).json({
                message: "Cantidad actualizada exitosamente",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: actualizando cantidad en la Lista de materiales ", error);
            res.status(500).json({
                message: "❌ Error al actualizar la cantidad en la Lista de materiales",
                error: message,
            });
        }
    };

    // delete a ProductTreeLine
    deleteProductTreeLine = async (req: Request, res: Response) => {
        try {
            const TreeCode = (req.params.TreeCode)?.toString();
            const rawChildNum = req.params.ChildNum ?? req.body?.ChildNum ?? req.query?.ChildNum;
            const ChildNum = rawChildNum !== undefined && rawChildNum !== null ? Number(rawChildNum) : undefined;

            if (!TreeCode || ChildNum === undefined || isNaN(ChildNum)) {
                res.status(400).json({
                    message: "❌ El campo TreeCode y ChildNum son requeridos",
                })
                return
            }

            const result = await this.listaMaterialesBusiness.deleteProductTreeLine(TreeCode, ChildNum)
            console.info("✅ Línea eliminada exitosamente de la lista de materiales")
            res.status(200).json({
                message: "Línea eliminada exitosamente",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido"
            console.error("❌ Error: eliminando línea en la Lista de materiales ", error)
            res.status(500).json({
                message: "❌ Error al eliminar la línea en la Lista de materiales",
                error: message,
            });
        }
    };
}