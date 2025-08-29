import {inject, Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  DiligenciaPreliminar
} from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import {PlazoPreparatoria} from "@interfaces/provincial/tramites/comun/preparatoria/plazo-preparatoria";

@Injectable({
  providedIn: 'root'
})
export class IniciarDiligenciaPreliminarService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/calificacion`
  urlPreparatoria = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preparatoria`

  private readonly http = inject(HttpClient)

  procesarDiligenciaPreliminar(data: DiligenciaPreliminar): Observable<any> {
    return this.http.post(
      `${this.url}/${data.idActoTramiteCaso}/iniciodiligenciaspreliminares`, data
    )
  }

  obtenerDiligenciaPreliminar(idActoTramiteCaso: string): Observable<any> {
    return this.http.get(
      `${this.url}/${idActoTramiteCaso}/iniciodiligenciaspreliminares`
    )
  }

  registrarPlazo(data: PlazoPreparatoria): Observable<any> {
    return this.http.post(
      `${this.urlPreparatoria}/${data.idActoTramiteCaso}/requerimiento-prorroga`, data
    )
  }

}
