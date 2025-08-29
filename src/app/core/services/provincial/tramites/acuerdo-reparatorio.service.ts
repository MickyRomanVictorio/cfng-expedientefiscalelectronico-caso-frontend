import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActaAcuerdoReparatorio } from "@core/interfaces/provincial/tramites/acta-acuerdo/acta-acuerdo-reparatorio.interface";

@Injectable({
    providedIn: 'root'
})
export class AcuerdoReparatorioService {

    url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/calificacion`
    constructor(
        private http: HttpClient
    ) { }

    guardarActa(data: ActaAcuerdoReparatorio): Observable<any> {
        return this.http.post(`${this.url}/${data.idActoTramiteCaso}/actaacuerdoreparatorio`, data)
    }

    obtenerActa(idActoTramiteCaso: String): Observable<any> {
        return this.http.get(
            `${this.url}/${idActoTramiteCaso}/actaacuerdoreparatorio`
        )
    }

    obtenerImputados(idCaso: String): Observable<any> {
        return this.http.get(
            `${this.url}/${idCaso}/imputados`
        )
    }
}
