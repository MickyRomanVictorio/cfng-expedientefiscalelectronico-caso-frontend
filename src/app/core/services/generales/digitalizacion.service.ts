import { Injectable } from '@angular/core';
import { DigitalizadoInterface } from '@core/interfaces/mesa-unica-despacho/digitalizado/digitalizado.interface';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  DocumentoCargoFirmadoInterface
} from "@interfaces/provincial/administracion-casos/documento-cargo-firmado/documento-cargo-firmado.interface";


@Injectable({
  providedIn: 'root'
})
export class DigitalizacionService {

  constructor(private apiBase: ApiBaseService ) { }

  listarPendienteDigitalizacion(data: any): Observable<any> {
    return this.apiBase.post(`${BACKEND.MESA_UNICA_DESPACHO}v1/e/denuncia/digitalizado/pendiente`, data);
  }

  listarDenunciasRegistradas(data: any): Observable<any> {
    return this.apiBase.post(`${BACKEND.MESA_UNICA_DESPACHO}v1/e/denuncia/registradas`, data);
  }

  guardarPendienteDigitalizacion(data: DigitalizadoInterface): Observable<any> {
    return this.apiBase.post(`${BACKEND.MESA_DOCUMENTO}v1/e/denuncia/digitalizado`, data);
  }

  guardarPendienteDigitalizacionMasivo(data: DigitalizadoInterface): Observable<any> {
    return this.apiBase.post(`${BACKEND.MESA_DOCUMENTO}v1/e/denuncia/digitalizado/masivo`, data);
  }

  registrarDocuemntoCargoFirmado(data: DocumentoCargoFirmadoInterface): Observable<any> {
    return this.apiBase.post(`${BACKEND.MESA_DOCUMENTO}v1/t/documento/cargo`, data);
  }

}
