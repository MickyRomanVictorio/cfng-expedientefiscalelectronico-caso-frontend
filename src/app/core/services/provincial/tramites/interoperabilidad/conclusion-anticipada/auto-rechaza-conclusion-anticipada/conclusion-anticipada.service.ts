import { Injectable } from '@angular/core';
import { ValidarReparacionCivil } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/determina-conclusion-anticipada/validar-reparacion-civil.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConclusionAnticipadaService {

  constructor(private readonly apiBase: ApiBaseService) {}

  obtenerDetalleAutoRechazaConclusionAnticipada(
    idTramiteCaso: string
  ): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/obtenerdetalletramite/${idTramiteCaso}`
    );
  }

  obtenerImputadosTramiteCaso(idTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/obtenerimputadostramite/${idTramiteCaso}`
    );
  }

  obtenerTipoSentenciaConlusionAnticipada(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/obtenertiposentencia`
    );
  }

  obtenerListaImputados(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/imputados/${idCaso}`
    );
  }

  registrarAutoRechazaConclusionAnticipada(body: any): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/rechazarconclusionanticipada`,
      body
    );
  }

  obtenerPenasRegistradas(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/penas/${idActoTramiteCaso}`
    );
  }

  eliminarPena(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.delete(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/pena/${idActoTramiteCaso}`
    );
  }

  validarNoExisteReparacionCivil(idActoTramiteCaso: string): Observable<ValidarReparacionCivil> {
    console.log( `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/reparacioncivil/validarexistencia/${idActoTramiteCaso}`)
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/reparacioncivil/validarexistencia/${idActoTramiteCaso}`
    ).pipe(
      map(() => ({
        noExistenRegistros: true,
        reparaciones: []
      })),
      catchError((error) => {
        if (error?.status === 422) {
          const mensajeError = error?.error?.message || ''
          const regex = /\[\[\|\|(.*?)\|\|\]\]/g
          const reparaciones: string[] = []
          let coincidencia
          while ((coincidencia = regex.exec(mensajeError)) !== null) {
            const registrosSeparados = coincidencia[1].split('{{[[]]}}')
            reparaciones.push(...registrosSeparados)
          }
          return of({
            noExistenRegistros: false,
            reparaciones
          })
        }
        return of({
          noExistenRegistros: true,
          reparaciones: []
        })
      })
    );
  }

  eliminarMasivamenteReparacionCivil(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.delete(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/reparacioncivil/${ idActoTramiteCaso }/masivo`
    );
  }

  guardarSentenciaDeterminaConclusionAnticipada(idActoTramiteCaso: string, datos: any): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/sentenciadetermina/${ idActoTramiteCaso }/guardar`,
      datos
    );
  }

  obtenerSentenciaDeterminaConclusionAnticipada(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/sentenciadetermina/${ idActoTramiteCaso }`
    );
  }

  obtenerListaImputadosConsentido(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/imputadosConsentido/${idActoTramiteCaso}`
    );
  }

  obtenerListaPenasConsentido(idActoTramiteCaso: string, idSujetoCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/delitosConsentido/${idActoTramiteCaso}/${idSujetoCaso}`
    );
  }

  obtenerPenasConsentidoRegistradas(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/penasConsentido/${idActoTramiteCaso}`
    );
  }

  registrarAutoDeclaraConsentidoConclusionAnticipada(body: any): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/autoDeclaraConsentidoConclusionanticipada`,
      body
    );
  }

  obtenerDetalleTramiteConsentidoConclusionAnticipada(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/conclusionanticipada/obtenerDetalleTramiteConsentido/${ idActoTramiteCaso }`
    );
  }


}
