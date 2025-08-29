import { EventEmitter, Injectable, Output } from '@angular/core';
import { ReservaProvisional } from '@core/interfaces/provincial/tramites/comun/preliminar/reserva-provisional.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaProvicionalService {
  @Output() dataInput: EventEmitter<boolean> = new EventEmitter();
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;

  constructor(
    private apiBase: ApiBaseService
  ) { }

  __dataInput(inputData:any) {
    this.dataInput.emit(inputData);
  }

    guardarReservaProvisional(etapa:string,data: ReservaProvisional) : Observable<any>{
    return this.apiBase.post(`${this.url}/${etapa}/reservaprovisional`,data);
    }

    obtenerReservaProvisional(etapa:string, idActoTramiteCaso:string) : Observable<any>{
      return this.apiBase.get(`${this.url}/${etapa}/reservaprovisional/${idActoTramiteCaso}`)
    }

}
