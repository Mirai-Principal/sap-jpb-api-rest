import type { Request, Response } from "express";
import { ListaMaterialesBusiness } from "./listaMateriales.business";
import { EstadoAprobacionRegulatoria } from "./listaMateriales.schemas";

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
            console.info("✅ Componente eliminado exitosamente de la lista de materiales")
            res.status(200).json({
                message: "Componente eliminado exitosamente",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido"
            console.error("❌ Error: eliminando componente en la Lista de materiales ", error)
            res.status(500).json({
                message: "❌ Error al eliminar el componente en la Lista de materiales",
                error: message,
            });
        }
    };

    // insert a ProductTreeLine
    insertProductTreeLine = async (req: Request, res: Response) => {
        try {
            const TreeCode = req.params.TreeCode?.toString();
            const { ItemCode, Quantity, Warehouse, StageID, StageId, Price, PriceList } = req.body;

            if (!TreeCode || !ItemCode || Quantity === undefined || Quantity === null || isNaN(Number(Quantity))) {
                res.status(400).json({
                    message: "❌ Los campos TreeCode, ItemCode y Quantity son requeridos",
                });
                return;
            }

            const stageIdValue = StageID ?? StageId;

            const line = {
                ItemCode: ItemCode.toString().trim(),
                Quantity: Number(Quantity),
                ...(Warehouse ? { Warehouse: Warehouse.toString().trim() } : {}),
                ...(stageIdValue !== undefined && stageIdValue !== null ? { StageID: Number(stageIdValue) } : {}),
                ...(Price !== undefined ? { Price: Number(Price) } : {}),
                ...(PriceList !== undefined ? { PriceList: Number(PriceList) } : {}),
            };

            const result = await this.listaMaterialesBusiness.insertProductTreeLine(TreeCode, line);
            console.info("✅ Componente registrado exitosamente en la lista de materiales");
            res.status(200).json({
                message: "Componente registrado exitosamente",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: registrando componente en la Lista de materiales ", error);
            res.status(500).json({
                message: "❌ Error al registrar el componente en la Lista de materiales",
                error: message,
            });
        }
    };

    //aprobar/rechazar cambios por asuntos regulatorios
    updateAprobarCambios = async (req: Request, res: Response) => {
        try {
            const TreeCode = req.params.TreeCode?.toString();
            const { U_JB_APROBADO_ASUNTOS_REGULATORIOS } = req.body;
            if (!TreeCode || !U_JB_APROBADO_ASUNTOS_REGULATORIOS) {
                res.status(400).json({
                    message: "❌ El campo TreeCode y U_JB_APROBADO_ASUNTOS_REGULATORIOS es requerido",
                });
                return;
            }
            const estadoNormalizado : EstadoAprobacionRegulatoria = U_JB_APROBADO_ASUNTOS_REGULATORIOS.toString().trim().toUpperCase();
            if (estadoNormalizado !== "SI" && estadoNormalizado !== "NO") {
                res.status(400).json({
                    message: "❌ El campo U_JB_APROBADO_ASUNTOS_REGULATORIOS debe ser 'SI' o 'NO'",
                });
                return;
            }

            const result = await this.listaMaterialesBusiness.updateAprobarCambios(TreeCode, estadoNormalizado);
            console.info("✅ Cambios aprobados exitosamente por asuntos regulatorios");
            res.status(200).json({
                message: "Cambios aprobados exitosamente por asuntos regulatorios",
                data: result,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            console.error("❌ Error: aprobando cambios por asuntos regulatorios", error);
            res.status(500).json({
                message: "❌ Error al aprobar los cambios por asuntos regulatorios",
                error: message,
            });
        }
    };
    
}