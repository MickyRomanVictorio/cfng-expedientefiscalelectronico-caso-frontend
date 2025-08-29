import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { BandejaTramiteRequest } from '@interfaces/provincial/bandeja-tramites/BandejaTramiteRequest';
import { RevertirTramiteRequest } from '@interfaces/provincial/bandeja-tramites/RevertirTramiteRequest';
import { ApiBaseService } from '@services/shared/api.base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BandejaTramitesService {
  constructor(private readonly apiBase: ApiBaseService) {}

  obtenerTramitesNuevos(request: BandejaTramiteRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/listarNuevos`,
      request
    );
  }

  obtenerDatosPrevisualizar(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/previsualizarTramite/previsualizar/${idActoTramiteCaso}`
    );
  }

  obtenerDatosPrevisualizarVersion(idDocumentoVersion: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/previsualizarTramite/${idDocumentoVersion}`
    );
  }

  eliminarTramiteNuevo(idBandejaTramite: string): Observable<any> {
    return this.apiBase.delete(
      `${BACKEND.CFE_EFE}/v1/e/caso/bandeja/borrador/anular/${idBandejaTramite}`
    );
  }

  obtenerTramitesEnviadosParaRevisar(
    request: BandejaTramiteRequest
  ): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/listarEnviadosParaRevisar`,
      request
    );
  }

  obtenerTramitesEnviadosParaVisar(
    request: BandejaTramiteRequest
  ): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/listarEnviadosParaVisar`,
      request
    );
  }

  revertirTramiteEnviadoParaRevisar(
    request: RevertirTramiteRequest
  ): Observable<any> {
    return this.apiBase.put(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/revertirTramite`,
      request
    );
  }

  obtenerTramitesPendientesParaRevisarVisar(
    request: BandejaTramiteRequest
  ): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/listarPendientesParaRevisarVisar`,
      request
    );
  }

  obtenerCantidadTramitesPendientesParaVisar(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/obtenerCantidadTramitesPendientesParaVisar`
    );
  }

  obtenerDetallesNotificacion(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/listarDetalleNotificacion/${idCaso}`
    );
  }

  obtenerCantidadTramitesFirmados(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/obtenerCantidadTramitesFirmados`
    );
  }

  obtenerTramitesFirmados(request: BandejaTramiteRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/listarFirmados`,
      request
    );
  }

  validarNotificacionPartes(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/notificarpartes/${idActoTramiteCaso}`
    );
  }

  eliminarTramiteFirmado(
    bandejaactotramite: string,
    documentoversion: string
  ): Observable<any> {
    console.log('bandejaactotramite ->> ', bandejaactotramite);
    console.log('documentoversion ->> ', documentoversion);
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/eliminarTramiteFirmado/${bandejaactotramite}/${documentoversion}`
    );
  }

  previsualizarTramitePDF(
    idNode: string,
    nombreArchivo: string
  ): Observable<any> {
    return this.apiBase.getFile(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/previsualizarTramite/previsualizarpdf?idNode=${idNode}&nombreArchivo=${nombreArchivo}`
    );
  }

  cantidadTramitePendienteParaRevisarVisar(
    idEstadoBandeja: number
  ): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/bandeja/tramites/cantidadTramitePendienteParaRevisarVisar/${idEstadoBandeja}`
    );
  }
}
