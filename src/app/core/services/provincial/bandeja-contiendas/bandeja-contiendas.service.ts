import { Injectable } from '@angular/core';
import { BandejaContiendaRequest } from '@core/interfaces/provincial/bandeja-contiendas/BandejaContiendasRequest';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BandejaContiendasService {

  constructor(
    private apiBase: ApiBaseService
  ) { }

  obtenerContiendas(request: BandejaContiendaRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/bandeja/contienda/listar`, request
    );
  }

  revertirElevacionContienda(request: BandejaContiendaRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/bandeja/contienda/revertir`, request
    );
  }

  verificarFiscalAsignado(idBandejaElevacion: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/bandeja/contienda/verificarFiscalAsignado/${idBandejaElevacion}`
    );
  }

  verificarProcedenteImprocedente(idBandejaElevacion: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/bandeja/contienda/verificarProcedenteImprocedente/${idBandejaElevacion}`
    );
  }

}
