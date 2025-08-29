import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import { ModificarCodigoCuadernoPruebaRequest } from '../interfaces/modificar-codigo-cuaderno-prueba-request';

@Injectable({
  providedIn: 'root',
})
export class CuadernosPruebaService {
  constructor(private readonly apiBase: ApiBaseService) {}

  obtenerCodigoCuadernoPruebas(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/cuadernoprueba/obtenercodigo/${idCaso}`
    );
  }

  listarDocumentosCuadernoPruebas(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/cuadernoprueba/listardocumentos/${idCaso}`
    );
  }

  modificarCodigoCuadernoPrueba(
    request: ModificarCodigoCuadernoPruebaRequest
  ): Observable<any> {
    return this.apiBase.put(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/cuadernoprueba`,
      request
    );
  }
}
