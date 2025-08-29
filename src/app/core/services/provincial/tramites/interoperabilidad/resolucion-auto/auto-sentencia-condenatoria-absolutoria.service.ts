import { Injectable } from '@angular/core';
import { ValidarReparacionCivil } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/determina-conclusion-anticipada/validar-reparacion-civil.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutoSentenciaCondenatoriaAbsolutoriaService {
  constructor(private readonly apiBase: ApiBaseService) { }

  urlTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/sentencia/condenatoriaabsolutoria/`

  listarSentencias(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramite}listarsentencias/${idActoTramiteCaso}`
    );
  }
  listarSujetosDelitos(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramite}listarsujetosdelitos/${idCaso}`
    );
  }
  
  eliminarPena(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlTramite}pena/${idActoTramiteCaso}`
    );
  }

  validarNoExisteReparacionCivil(idActoTramiteCaso: string): Observable<ValidarReparacionCivil> {
    return this.apiBase.get(
      `${this.urlTramite}reparacioncivil/validarexistencia/${idActoTramiteCaso}`
    ).pipe(
      map(() => ({
        noExistenRegistros: true,
        reparaciones: []
      })),
      catchError((error) => {
        if (error?.status === 422) {
          const mensajeError = error?.error?.codigo ?? ''

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
      `${this.urlTramite}reparacioncivil/${idActoTramiteCaso}/masivo`
    );
  }

  guardarTramite(idActoTramiteCaso: string, datos: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramite}guardar/${idActoTramiteCaso}`,
      datos
    );
  }

  obtenerDatosTramite(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramite}obtenerdatostramite/${idActoTramiteCaso}`
    );
  }

  guardarSujetoDelitoTramite(idActoTramiteCaso: string, datos: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramite}guardarsujetodelitotramite/${idActoTramiteCaso}`,
      datos
    );
  }
  eliminarSujetoDelitoTramite(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlTramite}eliminarsujetodelitotramite/${idActoTramiteCaso}`
    );
  }
}