import { inject, Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '@services/shared/api.base.service';
import { Observable } from 'rxjs';
import {
  RequerimientoProlongacionRequest,
  ResultadoProlongacionPrisionPreventivaInterface
} from '@interfaces/reusables/prolongacion-prision-preventiva/ProlongacionPrisionPreventivaRequest';
import { InfoResponse } from '@interfaces/comunes/genericos.interface';

@Injectable({
  providedIn: 'root'
})
export class ProlongacionPrisionPreventivaService {

  private readonly url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/tramites/prolongacionprisionpreventiva`;
  protected readonly apiBase = inject(ApiBaseService);


  obtenerResultadosPrisionPreventiva(idActoTramiteCaso: string): Observable<ResultadoProlongacionPrisionPreventivaInterface[]> {
    return this.apiBase.get(`${this.url}/resultados/${idActoTramiteCaso}`);
  }

  registrarTramite(request: RequerimientoProlongacionRequest): Observable<InfoResponse> {
    return this.apiBase.post(`${this.url}/registrar`, request);
  }
}
