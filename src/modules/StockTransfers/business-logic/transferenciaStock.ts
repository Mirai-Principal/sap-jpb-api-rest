import { HanaRepository } from "../data-access/stockTransfers.repository";
import { ServiceLayerStockTransferClient } from "../data-access/stockTransfer.service-layer";
import {
  DocSapInsertadoMsg,
  EstadoLote,
  MovimientoPesajeMsg,
  TsBodegaMsg,
  TsFromPesajeToMatMsg,
} from "../schemas/schemas";
import { mapFromPesajeToMat, mapMovimientosPesaje } from "./transferenciaStockMapper";

export class TransferenciaStockService {
  //DI
  private readonly repository: HanaRepository;
  private readonly sapStockTransfer: ServiceLayerStockTransferClient;

  constructor() {
    this.repository = new HanaRepository();
    this.sapStockTransfer = new ServiceLayerStockTransferClient();
  }

  async transferFromPesajeToMat(me: TsFromPesajeToMatMsg): Promise<DocSapInsertadoMsg> {
    try {
      //1. Mapear el mensaje de entrada a TsBodegaMsg
      const newMe = mapFromPesajeToMat(me);

      //2. Transferir a ubicaciones
      const ms = await this.transferToUbicaciones(newMe);

      //3. Guardar log de movimientos de pesaje
      if (!ms.Error) {
        const movimientos = mapMovimientosPesaje(newMe, me.detalleLote.DocNumOf);
        for (const movimiento of movimientos) {
          movimiento.DocNumTs = ms.DocNum;
          await this.setLogMovimientoPesaje(movimiento);
        }
      }

      return ms;
    } catch (error) {
      console.error(`Error en TransferFromPesajeToMat:${error instanceof Error ? error.message : String(error)}`);
      this.sapStockTransfer.logger.error(`Error en TransferFromPesajeToMat: ${error instanceof Error ? error.message : String(error)}`)
      throw new Error(`Error en TransferFromPesajeToMat:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async transferToUbicaciones(me: TsBodegaMsg): Promise<DocSapInsertadoMsg> {
    try {
      me.Lote = quitarCodArticuloDelLote(me.Lote);

      //2.1 Validar que la ubicación destino no sea igual a la de origen y obtener los ids origen y destino
      for (const movimiento of me.movimientos) {
        if (movimiento.UbicacionDesde === movimiento.UbicacionHasta) {
          throw new Error(`Error: La ubicación destino no puede ser igual a la de origen (${movimiento.UbicacionDesde})`);
        }

        if (movimiento.UbicacionDesde) {
          movimiento.IdUbicacionDesde = await this.repository.getIdUbicacionByName(
            movimiento.UbicacionDesde,
          );
        }

        if (movimiento.UbicacionHasta) {
          movimiento.IdUbicacionHasta = await this.repository.getIdUbicacionByName(
            movimiento.UbicacionHasta,
          );
        }
      }

      //2.2 Validar que el lote exista y sea liberado
      const estadoLote = await this.repository.getEstadoLote(me.Lote, me.CodArticulo);
      if (estadoLote == null) {
        console.error(`El lote '${me.Lote}' para el artículo '${me.CodArticulo}' no existe en la base de datos de SAP.`);
        this.sapStockTransfer.logger.error(`El lote '${me.Lote}' para el artículo '${me.CodArticulo}' no existe en la base de datos de SAP.`)
        throw new Error(`El lote '${me.Lote}' para el artículo '${me.CodArticulo}' no existe en la base de datos de SAP.`);
      }
      console.info(`Estado del lote ${me.Lote}: ${estadoLote == "0" ? "Liberado" : estadoLote == "1" ? "Acceso denegado" : "Bloqueado"}`);
      this.sapStockTransfer.logger.info(`Estado del lote ${me.Lote}: ${estadoLote == "0" ? "Liberado" : estadoLote == "1" ? "Acceso denegado" : "Bloqueado"}`)

      if (estadoLote !== String(EstadoLote.Liberado)) {
        await this.ponerLoteTemporalmenteComoLiberado(me, estadoLote);
        console.info(`Lote ${me.Lote} puesto temporalmente como liberado`);
        this.sapStockTransfer.logger.info(`Lote ${me.Lote} puesto temporalmente como liberado`)
      }

      //2.3 Transferir a ubicaciones
      const ms = await this.sapStockTransfer.transferirEntreUbicaciones(me);


      //2.4 Regresar lotes al estado anterior
      await this.repository.regresarLotesAlEstadoAnterior();
      console.info(`Lotes regresados al estado anterior`);
      this.sapStockTransfer.logger.info(`Lotes ${me.Lote} regresados al estado anterior`)

      if (ms.Error) {
        throw new Error(ms.Error);
      }

      return ms;
    } catch (error) {
      console.error(`Error en TransferToUbicaciones:${error instanceof Error ? error.message : String(error)}`);
      this.sapStockTransfer.logger.error(`Error en TransferToUbicaciones: ${error instanceof Error ? error.message : String(error)}`)
      throw new Error(`Error en TransferToUbicaciones:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async ponerLoteTemporalmenteComoLiberado(
    me: TsBodegaMsg,
    codEstadoOriginalLote: string,
  ): Promise<void> {
    await this.repository.registrarModificacionLote(
      me.CodArticulo,
      me.Lote,
      codEstadoOriginalLote,
    );
    await this.repository.updateEstadoLote(String(EstadoLote.Liberado), me.Lote, me.CodArticulo);
  }

  private async setLogMovimientoPesaje(me: MovimientoPesajeMsg): Promise<void> {
    let idLotePesaje = await this.repository.getIdLotePesaje(
      me.Lote,
      me.CodArticulo,
      me.DocNumOf,
    );

    if (idLotePesaje === 0) {
      const obj = await this.repository.getIdStYCantAbiertaInsumo(me.DocNumOf, me.CodArticulo);
      if (obj) {
        await this.repository.setCabeceraLogLotesPesaje(
          me.Lote,
          me.CodArticulo,
          obj.idSt,
          obj.cantAbiertaInsumo,
          me.DocNumOf
        );
        idLotePesaje = await this.repository.getMaxIdLotePesaje();
      } else {
        console.error(`No existe cabecera JB_LOTES_PESAJE para lote ${me.Lote}, artículo ${me.CodArticulo}, OF ${me.DocNumOf} y no se pudo crear (no se encontró ST).`);
        throw new Error(
          `No existe cabecera JB_LOTES_PESAJE para lote ${me.Lote}, artículo ${me.CodArticulo}, OF ${me.DocNumOf} y no se pudo crear (no se encontró ST).`,
        );
      }
    }

    await this.repository.insertMovimientoLotePesaje({
      idLotePesaje,
      docNumTs: me.DocNumTs,
      cantidad: me.Cantidad,
      ubicacionDesde: me.UbicacionDesde,
      ubicacionHasta: me.UbicacionHasta,
    });
  }
}

/**
 * Quita el código de artículo del lote ("JB-230317151244&codArticulo=10500001")
 * @param lote 
 * @returns "JB-230317151244"
 */
function quitarCodArticuloDelLote(lote: string): string {
  const parts = lote?.split("&") ?? [];
  return parts.length === 2 ? parts[0] : lote;
}
