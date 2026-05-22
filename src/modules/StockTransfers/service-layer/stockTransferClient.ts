import { DocSapInsertadoMsg, TsBodegaMsg } from "../schemas/schemas";
import sessionManager from "../../../services/session-manager.service";
import { env } from "../../../config/env";


export interface HttpClient {
  post<T = unknown>(url: string, body: unknown): Promise<{ data: T }>;
}

export class ServiceLayerStockTransferClient {

  async transferirEntreUbicaciones(datos: TsBodegaMsg): Promise<DocSapInsertadoMsg> {
    const body = this.buildStockTransferBody(datos);
    console.log("body", JSON.stringify(body, null, 2));

    try {
      const response = await sessionManager.request("/StockTransfers", "POST", body) as { DocEntry?: number | string };
      console.info("sapResult", response);
      return { Id: String(response?.DocEntry ?? ""), DocNum: 0 };
    }
    catch (error: any) {
      console.error("Error en transferirEntreUbicaciones:", error);
      return {
        DocNum: 0,
        Error: "Error en transferirEntreUbicaciones: " + error.message,
      };
    }
  }

  private buildStockTransferBody(me: TsBodegaMsg): Record<string, unknown> {
    //identifico las lineas a agregarse
    const lineas = uniqueWarehouseLines(me);

    let datos = {
      DocDate: new Date().toISOString().slice(0, 10),
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
        console.log("Datos que llegaron al reduce:", JSON.stringify(movimientosPorLinea, null, 2));
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
    console.log("datos", datos);
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

