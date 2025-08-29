import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TerminacionAnticipadaService {

  urlCaso = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/terminacionanticipada/`

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  listarSujetosProcesales(idCaso: string,idActoTramiteCaso:string): Observable<any> {
    return this.apiBase.get(
      `${this.urlCaso}listarsujetosprocesales/${idCaso}/${idActoTramiteCaso}`,
    );
  }

}
