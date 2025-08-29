import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IndagacionesPrevias } from '@core/interfaces/provincial/tramites/comun/preliminar/indagaciones-previas.interface';

@Injectable({
  providedIn: 'root'
})
export class IndagacionesPreviasService {

    url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/calificacion`
    constructor(
        private http: HttpClient
    ) { }

    guardarIndagacionesPrevias(data: IndagacionesPrevias ): Observable<any> {
        return this.http.post(
            `${ this.url }/${ data.idActoTramiteCaso }/disponerindagacionesprevias`,data
        )
    }

    obtenerIndagacionesPrevias(idActoTramiteCaso: String ): Observable<any> {
        return this.http.get(
            `${ this.url }/${ idActoTramiteCaso }/disponerindagacionesprevias`
        )
    }
    
}