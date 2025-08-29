import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable} from 'rxjs';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BandejaDerivacionRequest } from '@core/interfaces/provincial/bandeja-derivacion/enviados/derivado-revertidos/BandejaDerivacionRequest';

@Injectable({
  providedIn: 'root'
})
export class DerivadoRevertidoService {

  constructor(private apiBase: ApiBaseService) {
  }

  listarDerivadoRevertidos(request :BandejaDerivacionRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_DERIVACIONES}/v1/e/bandeja/enviado/revertido/listar`, request
    );
  }

}
