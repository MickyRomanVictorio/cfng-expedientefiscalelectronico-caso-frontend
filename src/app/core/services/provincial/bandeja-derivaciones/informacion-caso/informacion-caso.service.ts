import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable, map } from 'rxjs';
import { ApiBaseService } from '@core/services/shared/api.base.service';

@Injectable({
  providedIn: 'root'
})
export class InformacionCasoService {

  urlService = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/caso`
  urlServiceHistorial = `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/historial`

  constructor( private apiBase: ApiBaseService ) { }

  obtenerInformacionCaso(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlService}/${idCaso}`
    );
  }

  obtenerHistorialCaso(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlService}/historial/${idCaso}`
    );
  }

  obtenerHistorialDerivaciones(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlServiceHistorial}/${idCaso}`
    );
  }

}
