import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialDerivacionService {

  constructor(private apiBase: ApiBaseService) { }

obtenerHistorial(idCaso:String): Observable<any> {
  return this.apiBase.get(
    `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/historial/${idCaso}`
  );
}




}
