import { inject, Injectable } from '@angular/core';
import {
  AutoResuelvePrisionPreventiva,
  ResultadoAudienciaPrisionPreventiva,
  ResultadoPrisionPreventivaInterface, SujetoProcesal,
  SujetoResultadoPrisionPreventivaInterface
} from '@core/interfaces/comunes/AutoResuelvePrisionPreventivaRequest';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResolucionAutoResuelvePrisionPreventivaService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/resolucionautoresuelveprisionpreventiva`;
  protected readonly apiBase = inject(ApiBaseService);
 
  /* TRAMITE */
  obtenerAutoResuelvePrisionPreventiva(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${idActoTramiteCaso}`
    );
  }

  registroParcialAutoResuelvePrisionPreventiva(data: AutoResuelvePrisionPreventiva): Observable<any> {
    return this.apiBase.post(`${this.url}/registroparcial`, data);
  }

  registroAutoResuelvePrisionPreventiva(data: AutoResuelvePrisionPreventiva): Observable<any> {
    return this.apiBase.post(`${this.url}/registro`, data);
  }

  /* ITE 005 */
  obtenerSujetosProcesales(idCaso: string): Observable<SujetoProcesal[]> {
    return this.apiBase.get(`${this.url}/${idCaso}/sujetosprocesales`);
  }

  obtenerDelitosSujetoProcesal(idSujetoCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/${idSujetoCaso}/delitos`);
  }

  registrarResultadosPrisionPreventiva(data: ResultadoPrisionPreventivaInterface): Observable<any> {
    return this.apiBase.post(`${this.url}/resultados`, data);
  }

  eliminarResultadoPrisionPreventiva(idActoTramiteResultadoSujeto: string, tipoMedida: string): Observable<any> {
    return this.apiBase.delete(`${this.url}/resultados/${idActoTramiteResultadoSujeto}/${tipoMedida}`);
  }

  obtenerResultadosPrisionPreventiva(idActoTramiteCaso: string): Observable<ResultadoPrisionPreventivaInterface[]> {
    return this.apiBase.get(`${this.url}/resultados/${idActoTramiteCaso}`);
  }

  /* ITE 006 */
  obtenerSujetosProcesalesProlongacion(idCaso: string): Observable<SujetoProcesal[]> {
    return this.apiBase.get(`${this.url}/${idCaso}/sujetosprocesales/prolongacion`);
  }

  /* ITE 009 */
  obtenerSujetosProcesalesCesacion(idCaso: string): Observable<SujetoProcesal[]> {
    return this.apiBase.get(`${this.url}/${idCaso}/sujetosprocesales/cesacion`);
  }

  /* ITE 0011 */
  obtenerSujetosProcesalesAdecuacion(idCaso: string): Observable<SujetoProcesal[]> {
    return this.apiBase.get(`${this.url}/${idCaso}/sujetosprocesales/adecuacion`);
  }

  obtenerResultadosSujetoProcesal(idActoTramiteCaso: string, idSujetoCaso: string, idTipoResultado: string): Observable<SujetoResultadoPrisionPreventivaInterface> {
    return this.apiBase.get(`${this.url}/resultados/${idActoTramiteCaso}/${idSujetoCaso}/${idTipoResultado}`);
  }

  /* RESULTADO AUDIENCIA PRISION PREVENTIVA */
  obtenerSujetosProcesalesApelacionPrision(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/resultadosaudiencia/${idActoTramiteCaso}/sujetosprocesales`);
  }

  registrarResultadosAudiencia(data: ResultadoAudienciaPrisionPreventiva): Observable<any> {
    return this.apiBase.post(`${this.url}/resultadosaudiencia`, data);
  }

  eliminarResultadoAudienciaPrisionPreventiva(idApelacionResultado: string): Observable<any> {
    return this.apiBase.delete(`${this.url}/resultadosaudiencia/${idApelacionResultado}/sujetosprocesales`);
  }

  registrarApelacionFiscalia(data: ResultadoAudienciaPrisionPreventiva): Observable<any> {
    return this.apiBase.post(`${this.url}/resultadosaudiencia/apelacionfiscalia`, data);
  }

  obtenerApelacionFiscalia(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(`${this.url}/resultadosaudiencia/${idActoTramiteCaso}/apelacionfiscalia`);
  }

}
