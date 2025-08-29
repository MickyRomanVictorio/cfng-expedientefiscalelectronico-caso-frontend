import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActualizarCausales } from '@core/interfaces/provincial/tramites/comun/calificacion/archivar-caso/actualizar-causales.interface';

@Injectable({
  providedIn: 'root'
})
export class ArchivarCasoService {

    private readonly url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`

    constructor(
        private readonly http: HttpClient
    ) { }

    public obtenerCausalesArchivamiento( etapa: string, idActoTramiteCaso: string ): Observable<any> {
        return this.http.get(
            `${ this.url }/${ etapa }/${ idActoTramiteCaso }/causalesarchivamiento`,
        )
    }

    public actualizarCausalesArchivamiento( data: ActualizarCausales ): Observable<any> {
        return this.http.put(
            `${ this.url }/${ data.etapa }/${ data.idActoTramiteCaso }/causalesarchivamiento`, data
        )
    }

}
