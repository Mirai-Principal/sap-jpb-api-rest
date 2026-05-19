import {
  MovimientoPesajeMsg,
  TsBodegaMsg,
  TsFromPesajeToMatMsg,
} from "../schemas/schemas";

export function mapFromPesajeToMat(me: TsFromPesajeToMatMsg): TsBodegaMsg {
  const ubicacionDesde = me.detalleLote?.UbicacionPesaje;
  if (!ubicacionDesde) {
    throw new Error("No se ha podido determinar la ubicación de pesaje!!");
  }

  const movimiento = {
    Cantidad: me.detalleLote.Cantidad,
    CodBodegaDesde: me.detalleLote.CodBodega,
    UbicacionDesde: ubicacionDesde,
    CodBodegaHasta: me.detalleLote.CodBodega,
    UbicacionHasta: me.UbicacionMatDestino,
  };

  movimiento.CodBodegaDesde ||= getCodBodegaFromUbicacion(movimiento.UbicacionDesde);
  movimiento.CodBodegaHasta ||= getCodBodegaFromUbicacion(movimiento.UbicacionHasta);

  return {
    CodArticulo: me.detalleLote.CodArticulo,
    Lote: me.detalleLote.Lote,
    Responsable: me.Responsable,
    ClientId: me.ClientId,
    movimientos: [movimiento],
  };
}

export function mapMovimientosPesaje(
  loteConUbicacion: TsBodegaMsg,
  docNumOf: number,
): MovimientoPesajeMsg[] {
  return loteConUbicacion.movimientos.map((movimiento) => ({
    DocNumTs: loteConUbicacion.DocNumTS ?? 0,
    Cantidad: movimiento.Cantidad,
    UbicacionDesde: movimiento.UbicacionDesde,
    UbicacionHasta: movimiento.UbicacionHasta,
    Lote: loteConUbicacion.Lote,
    CodArticulo: loteConUbicacion.CodArticulo,
    DocNumOf: docNumOf,
  }));
}

function getCodBodegaFromUbicacion(ubicacion?: string): string {
  const codBodega = ubicacion?.split("-")[0];
  if (codBodega) {
    return codBodega;
  }

  throw new Error(`No se ha podido determinar la bodega desde la ubicación: ${ubicacion}`);
}
