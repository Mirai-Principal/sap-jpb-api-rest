import { DocSapInsertadoMsg, TsBodegaMsg } from "../schemas/schemas";
import ServiceFacade from "../../../services/service.facade";
import { env } from "../../../config/env";

export class ServiceLayerStockTransferClient {
  readonly logger = ServiceFacade.logger;

  async transferirEntreUbicaciones(datos: TsBodegaMsg): Promise<DocSapInsertadoMsg> {
    const body = this.buildStockTransferBody(datos);
    console.info("body", JSON.stringify(body, null, 2))
    this.logger.info("Iniciando transferencia para el lote: " + datos.Lote);
    try {
      const response = await ServiceFacade.serviceLayer.request("/StockTransfers", "POST", body) as { DocEntry?: number, DocNum?: number };
      this.logger.info("Se realizo la transferencia DocNum: " + response.DocNum + " para el lote: " + datos.Lote);
      // console.log("response", JSON.stringify(response, null, 2));

      return { Id: response?.DocEntry ?? 0, DocNum: response?.DocNum ?? 0 };
    }
    catch (error: any) {
      console.error("Error en transferirEntreUbicaciones para el lote:", datos.Lote, " error: ", error);
      this.logger.error("Error en transferirEntreUbicaciones para el lote: " + datos.Lote + " - " + error);
      throw new Error("Error en transferirEntreUbicaciones para el lote: " + datos.Lote + " - " + error.message);
    }
  }

  private buildStockTransferBody(me: TsBodegaMsg): Record<string, unknown> {
    //identifico las lineas a agregarse
    const lineas = uniqueWarehouseLines(me);

    //? fecha actual
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let datos = {
      // DocDate: localDate,
      DocDate: "2026-05-29",
      PriceList: -2,               //? Último precio determinado
      Comments: me.Responsable,
      //solo en la primera linea asigno las bodegas de la TS
      FromWarehouse: lineas[0]?.bd,
      ToWarehouse: lineas[0]?.bh,

      StockTransferLines: lineas.map((linea, lineIndex) => {
        const movimientosPorLinea = me.movimientos.filter(
          (movimiento) =>
            movimiento.CodBodegaDesde === linea.bd && movimiento.CodBodegaHasta === linea.bh,
        );
        // console.log("Datos que llegaron al reduce:", JSON.stringify(movimientosPorLinea, null, 2));
        const cantidadLinea = movimientosPorLinea.reduce((sum, movimiento) => sum + movimiento.Cantidad, 0)

        return {
          //añado una linea
          ItemCode: me.CodArticulo,
          Quantity: cantidadLinea,
          FromWarehouseCode: linea.bd,
          WarehouseCode: linea.bh,
          //----------- retistro las ubicaciones por linea ----------------

          //registro el lote por linea
          BatchNumbers: [
            {
              BatchNumber: me.Lote,
              //BaseLineNumber: lineIndex,
              Quantity: cantidadLinea,
            },
          ],
          StockTransferLinesBinAllocations: [
            ...buildBinAllocations(movimientosPorLinea, lineIndex, "from"),
            ...buildBinAllocations(movimientosPorLinea, lineIndex, "to"),
          ],
        };
      }),
    };
    if (env.NroSerieTSPorDefecto > 0) {
      (datos as any).Series = env.NroSerieTSPorDefecto;
    }
    return datos;
  }
}

function uniqueWarehouseLines(me: TsBodegaMsg): Array<{ bd?: string; bh?: string }> {
  const result: Array<{ bd?: string; bh?: string }> = [];
  for (const movimiento of me.movimientos) {
    const exists = result.some(
      (linea) => linea.bd === movimiento.CodBodegaDesde && linea.bh === movimiento.CodBodegaHasta,
    );
    if (!exists) {
      result.push({ bd: movimiento.CodBodegaDesde, bh: movimiento.CodBodegaHasta });
    }
  }
  return result;
}

function buildBinAllocations(movimientos: TsBodegaMsg["movimientos"], lineIndex: number, direction: "from" | "to"): Array<Record<string, unknown>> {
  const idKey = direction === "from" ? "IdUbicacionDesde" : "IdUbicacionHasta";
  const binActionType = direction === "from" ? "batFromWarehouse" : "batToWarehouse";
  const ids = new Set(
    movimientos
      .map((movimiento) => movimiento[idKey])
      .filter((id): id is number => typeof id === "number" && id > 0),
  );

  return Array.from(ids).map((idUbicacion) => ({
    BinActionType: binActionType,
    // BaseLineNumber: lineIndex,
    SerialAndBatchNumbersBaseLine: lineIndex,   //! segun sericelayer debe ser 0, es el indice de la linea, pero en .net esta con el index del registro
    BinAbsEntry: idUbicacion,
    Quantity: round4(
      movimientos
        .filter((movimiento) => movimiento[idKey] === idUbicacion)
        .reduce((sum, movimiento) => sum + movimiento.Cantidad, 0),
    ),
  }));
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

