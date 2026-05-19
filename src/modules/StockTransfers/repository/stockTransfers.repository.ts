interface IHanaDbConnection {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  scalar<T>(sql: string, params?: unknown[]): Promise<T | null>;
}

export class HanaRepository {
  constructor(private readonly db: IHanaDbConnection) { }

  async getIdUbicacionByName(ubicacion: string): Promise<number> {
    const sql = `
      select "Id"
      from "JbpVw_Ubicaciones"
      where "Ubicacion" = ?
    `;
    const result = await this.db.scalar(sql, [ubicacion]);
    return this.toNumber(result);
  }

  async getEstadoLote(lote: string, codArticulo: string): Promise<string | null> {
    const sql = `
      select "Status"
      from OBTN
      where "DistNumber" = ?
        and "ItemCode" = ?
    `;
    const estado = await this.db.scalar(sql, [lote, codArticulo]);
    console.log('estado', estado);
    return estado == null ? null : String(estado);
  }

  async registrarModificacionLote(
    codArticulo: string,
    lote: string,
    codEstadoOriginalLote: string,
  ): Promise<void> {
    const sql = `
      insert into "JB_MODIFICACION_ESTADO_LOTE"(
        COD_ARTICULO,
        LOTE,
        COD_ESTADO_ORIGINAL,
        FECHA
      )
      values(?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await this.db.execute(sql, [codArticulo, lote, codEstadoOriginalLote]);
  }

  async updateEstadoLote(estado: string, lote: string, codArticulo: string): Promise<void> {
    const sql = `
      update OBTN
      set "Status" = ?
      where "DistNumber" = ?
        and "ItemCode" = ?
    `;
    await this.db.execute(sql, [estado, lote, codArticulo]);
  }

  async regresarLotesAlEstadoAnterior(): Promise<void> {
    const sql = `
      select
        COD_ARTICULO,
        LOTE,
        COD_ESTADO_ORIGINAL
      from JB_MODIFICACION_ESTADO_LOTE
    `;
    const rows = await this.db.query<{
      COD_ARTICULO: string;
      LOTE: string;
      COD_ESTADO_ORIGINAL: string;
    }>(sql);

    for (const row of rows) {
      await this.updateEstadoLote(row.COD_ESTADO_ORIGINAL, row.LOTE, row.COD_ARTICULO);
      await this.borrarRegistroActualizacion(row.COD_ARTICULO, row.LOTE);
    }
  }

  async getDocNumById(id: string): Promise<number> {
    const sql = `
      select "DocNum"
      from "JbpVw_TransferenciaStock"
      where "Id" = ?
    `;
    return this.toNumber(await this.db.scalar(sql, [id]));
  }

  async getIdLotePesaje(lote: string, codArticulo: string, docNumOf: number): Promise<number> {
    const sql = `
      select top 1 ID
      from JB_LOTES_PESAJE
      where LOTE = ?
        and COD_ARTICULO = ?
        and DOC_NUM_OF = ?
    `;
    return this.toNumber(await this.db.scalar(sql, [lote, codArticulo, docNumOf]));
  }

  async getIdStYCantAbiertaInsumo(docNumOf: number, codArticulo: string): Promise<{ idSt: number; cantAbiertaInsumo: number } | null> {
    const sql = `
      select
        t1."Id",
        t0."CantidadAbierta"
      from "JbpVw_SolicitudTrasladoLinea" t0
      inner join "JbpVw_SolicitudTraslado" t1 on t1."Id" = t0."IdSolicitudTraslado"
      where
        t1."DocNumOrdenFabricacion" = ?
        and t0."CodArticulo" = ?
    `;
    const rows = await this.db.query<{ Id: number; CantidadAbierta: number }>(sql, [docNumOf, codArticulo]);
    if (rows && rows.length > 0) {
      return {
        idSt: this.toNumber(rows[0].Id),
        cantAbiertaInsumo: this.toNumber(rows[0].CantidadAbierta),
      };
    }
    return null;
  }

  async setCabeceraLogLotesPesaje(lote: string, codArticulo: string, idSt: number, cantAbiertaInsumo: number, docNumOf: number): Promise<void> {
    const sql = `
      insert into JB_LOTES_PESAJE(LOTE, COD_ARTICULO, ID_ST, CANTIDAD, DOC_NUM_OF, FINALIZADO)
      values(?, ?, ?, ?, ?, 'N')
    `;
    await this.db.execute(sql, [lote, codArticulo, idSt, cantAbiertaInsumo, docNumOf]);
  }

  async getMaxIdLotePesaje(): Promise<number> {
    const sql = `select max(ID) as "MaxId" from JB_LOTES_PESAJE`;
    return this.toNumber(await this.db.scalar(sql));
  }

  async insertMovimientoLotePesaje(input: {
    idLotePesaje: number;
    docNumTs: number;
    cantidad: number;
    ubicacionDesde?: string;
    ubicacionHasta?: string;
  }): Promise<void> {
    const sql = `
      insert into JB_MOVIMIENTOS_LOTE_PESAJE(
        ID_LOTE_PESAJE,
        DOC_NUM_TS,
        CANTIDAD,
        UBICACION_DESDE,
        UBICACION_HASTA
      )
      values(?, ?, ?, ?, ?)
    `;
    await this.db.execute(sql, [
      input.idLotePesaje,
      input.docNumTs,
      input.cantidad,
      input.ubicacionDesde,
      input.ubicacionHasta,
    ]);
  }

  private async borrarRegistroActualizacion(codArticulo: string, lote: string): Promise<void> {
    const sql = `
      delete from JB_MODIFICACION_ESTADO_LOTE
      where COD_ARTICULO = ?
        and LOTE = ?
    `;
    await this.db.execute(sql, [codArticulo, lote]);
  }

  private toNumber(value: unknown): number {
    if (value == null || value === "") {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
