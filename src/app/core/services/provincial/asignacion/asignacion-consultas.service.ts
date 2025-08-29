import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { BuscarCasosPorAsignarRequest } from '@core/interfaces/provincial/administracion-casos/asignacion/BuscarCasosPorAsignarRequest';

@Injectable({
  providedIn: 'root'
})
export class AsignacionConsultasService {

  urlTransaccion: string = `${BACKEND.CFE_EFE}/v1/e/caso/asignacion`
  decodeToken: any;

  constructor( private apiBase: ApiBaseService ) { }



  obtenerFiscales(): Observable<any> {
    return this.apiBase.get(
      `${this.urlTransaccion}/fiscalesconasignacion`
    );
  }

  obtenerCasosPorAsignar( request: BuscarCasosPorAsignarRequest ): Observable<any> {
    let fechaDesde = request.fechaDesde
    let fechaHasta = request.fechaHasta
    let plazo = request.plazo ? request.plazo : ''
    let origen = request.origen ? request.origen : ''
    let url = `${this.urlTransaccion}/casosporasignar?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&origen=${origen}&plazos=${plazo}`;
    return this.apiBase.get( url );
  }

}
