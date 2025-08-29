import { inject, Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnjuiciamientoCitacionService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/api/enjuiciamientoCitacion`;

  protected readonly apiBase = inject(ApiBaseService);

  registrarEnjuiciamientoCitacion(request: any) {
    return this.apiBase.post(
      `${this.url}/guardar`,
      request
    );
  }

  obtenerEnjuiciamientoCitacion(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/obtenerDatosTramite/${idActoTramiteCaso}`
    );
  }
  obtenerListaSujetosProcesales(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/sujetosProcesales/${idCaso}`
    );
  }
}
