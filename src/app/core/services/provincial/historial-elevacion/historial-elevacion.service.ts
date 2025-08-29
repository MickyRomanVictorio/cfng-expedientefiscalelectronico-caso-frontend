import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialElevacionService {

  constructor(private apiBase: ApiBaseService) { }

  listarHistorialElevacion(idBandejaElevacion:string, page:string, per_page:string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/historialelevacion?idBandejaElevacion=${idBandejaElevacion}&page=${page}&per_page=${per_page}`
    );
  }

}
