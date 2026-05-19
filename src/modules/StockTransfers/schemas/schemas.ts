export interface DocSapInsertadoMsg {
  Id?: string;
  DocNum: number;
  Error?: string;
}

export interface DetalleLotePsjToMat {
  CodBodega?: string;
  Cantidad: number;
  CodArticulo: string;
  Lote: string;
  DocNumOf: number;
  UbicacionPesaje?: string;
}

export interface TsFromPesajeToMatMsg {
  ClientId?: string;
  detalleLote: DetalleLotePsjToMat;
  Responsable?: string;
  UbicacionMatDestino: string;
}

export interface MovimientoTsMsg {
  Cantidad: number;
  CodBodegaDesde?: string;
  UbicacionDesde?: string;
  CodBodegaHasta?: string;
  UbicacionHasta?: string;
  IdUbicacionDesde?: number;
  IdUbicacionHasta?: number;
}

export interface TsBodegaMsg {
  CodArticulo: string;
  Lote: string;
  Responsable?: string;
  movimientos: MovimientoTsMsg[];
  ClientId?: string;
  DocNumTS?: number;
}

export interface MovimientoPesajeMsg {
  IdLotePesaje?: number;
  DocNumTs: number;
  Cantidad: number;
  UbicacionDesde?: string;
  UbicacionHasta?: string;
  Lote: string;
  CodArticulo: string;
  DocNumOf: number;
}

export enum EstadoLote {
  Liberado = 0,
  AccesoDenegado = 1,
  Bloqueado = 2,
}
