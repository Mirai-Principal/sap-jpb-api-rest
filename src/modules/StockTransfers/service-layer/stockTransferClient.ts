import { DocSapInsertadoMsg, TsBodegaMsg } from "../schemas/schemas";
import sessionManager from "../../../services/session-manager.service";

export interface HttpClient {
  post<T = unknown>(url: string, body: unknown): Promise<{ data: T }>;
}

export interface ServiceLayerStockTransferOptions {
  stockTransfersPath?: string;
  defaultSeries?: number;
}

export class ServiceLayerStockTransferClient {
  constructor(
    private readonly options: ServiceLayerStockTransferOptions = {}
  ) { }

  async transferirEntreUbicaciones(datos: TsBodegaMsg): Promise<DocSapInsertadoMsg> {
    const body = this.buildStockTransferBody(datos);

    console.info("body", JSON.stringify(body, null, 2));

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
    const lineas = uniqueWarehouseLines(me);

    return {
      DocDate: new Date().toISOString().slice(0, 10),
      PriceList: -2,
      Comments: me.Responsable,
      ...(this.options.defaultSeries && this.options.defaultSeries > 0
        ? { Series: this.options.defaultSeries }
        : {}),
      FromWarehouse: lineas[0]?.bd,
      ToWarehouse: lineas[0]?.bh,
      StockTransferLines: lineas.map((linea, lineIndex) => {
        const movimientosPorLinea = me.movimientos.filter(
          (movimiento) =>
            movimiento.CodBodegaDesde === linea.bd && movimiento.CodBodegaHasta === linea.bh,
        );
        const cantidadLinea = round4(
          movimientosPorLinea.reduce((sum, movimiento) => sum + movimiento.Cantidad, 0),
        );

        return {
          ItemCode: me.CodArticulo,
          Quantity: cantidadLinea,
          FromWarehouseCode: linea.bd,
          WarehouseCode: linea.bh,
          BatchNumbers: [
            {
              BatchNumber: me.Lote,
              BaseLineNumber: lineIndex,
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
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (error as { response?: { data?: unknown } }).response;
      return JSON.stringify(response?.data ?? error);
    }

    return error instanceof Error ? error.message : String(error);
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

function buildBinAllocations(
  movimientos: TsBodegaMsg["movimientos"],
  lineIndex: number,
  direction: "from" | "to",
): Array<Record<string, unknown>> {
  const idKey = direction === "from" ? "IdUbicacionDesde" : "IdUbicacionHasta";
  const binActionType = direction === "from" ? "batFromWarehouse" : "batToWarehouse";
  const ids = new Set(
    movimientos
      .map((movimiento) => movimiento[idKey])
      .filter((id): id is number => typeof id === "number" && id > 0),
  );

  return Array.from(ids).map((idUbicacion) => ({
    BinActionType: binActionType,
    BaseLineNumber: lineIndex,
    SerialAndBatchNumbersBaseLine: 0,
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
