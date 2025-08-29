import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroFechaCitacion } from '@core/interfaces/provincial/tramites/acta-acuerdo/registro-fecha-citacion.interface';

@Injectable({
  providedIn: 'root'
})
export class DisposicionAplicacionPrincipioOportunidadService {

    urlTramites = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/`

    constructor(
        private http: HttpClient
    ) { }

    actualizarFechaCitacion(data: RegistroFechaCitacion ): Observable<any> {
        return this.http.post(
            `${ this.urlTramites }registrofechacitacion`,data
        )
    }

    obtenerDiligenciaPreliminar(idActoTramiteCaso: String ): Observable<any> {
        return this.http.get(
            `${ this.urlTramites }/${ idActoTramiteCaso }/iniciodiligenciaspreliminares/${idActoTramiteCaso}`
        )
    }
}
