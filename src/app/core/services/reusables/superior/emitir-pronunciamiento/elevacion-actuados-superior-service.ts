import {Injectable} from "@angular/core";
import {BACKEND} from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';
import { CasoFiscal, CasoFiscalResponse } from "@core/interfaces/comunes/casosFiscales";
import { HttpClient, HttpParams } from '@angular/common/http';
import { TokenService } from "@core/services/shared/token.service";

@Injectable({
  providedIn: 'root'
})
export class ElevacionActuadosSuperiorService {

  urlConsultaCasosSuperior= `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/caso/consultacasos`;

  constructor(private apiBase: ApiBaseService,
    private http: HttpClient,
    private tokenservice: TokenService
  ) {
  }

  getActosProcesalesSeOrdenaSuperior(): Observable<any> {
    return this.apiBase.get(`${this.urlConsultaCasosSuperior}/seordena`);
  }

  getCasosFiscalesElevacionSuperior(filter: any): Observable<CasoFiscalResponse<CasoFiscal[]>> {
		let params = new HttpParams({ fromObject: { ...filter } });
		console.log(params);
		return this.http.get<CasoFiscalResponse<CasoFiscal[]>>(
		  `${this.urlConsultaCasosSuperior}/listarcasossuperior`, { params }
		);
	  }

  //#region Elevación Actuados
  public emitirPronunciamientoElevacionActuados(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlConsultaCasosSuperior}/elevacionactuados/emitirpronunciamiento`,
      request
    );
  }
  public obtenerDatosPronunciamiento(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlConsultaCasosSuperior}/elevacionactuados/obtenerdatospronunciamiento/${idActoTramiteCaso}`,
    );
  }
  //#endregion

  //#region Contienda de Competencia
  public emitirPronunciamientoContiendaCompetencia(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlConsultaCasosSuperior}/contiendacompetencia/emitirpronunciamiento`,
      request
    );
  }
  public obtenerDatosPronunciamientoContiendacompetencia(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlConsultaCasosSuperior}/contiendacompetencia/obtenerdatospronunciamiento/${idActoTramiteCaso}`,
    );
  }
  //#endregion
  //#region Contienda de Competencia
  public emitirPronunciamientoSubsanar(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlConsultaCasosSuperior}/subsanar/emitirpronunciamiento`,
      request
    );
  }


}
