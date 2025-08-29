import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  DiligenciaPreliminar,
  DisposicionProrrogaInvPreparatoria
} from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import {PlazoPreparatoria} from "@interfaces/provincial/tramites/comun/preparatoria/plazo-preparatoria";

@Injectable({
  providedIn: 'root'
})
export class IniciarDiligenciaPreparatoriaService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preparatoria`

  constructor(
    private http: HttpClient
  ) {
  }

  procesarPreparatoria(data: DiligenciaPreliminar): Observable<any> {
    return this.http.post(
      `${this.url}`, data
    )
  }

  obtenerPlazo(idActoTramiteCaso: String): Observable<any> {
    return this.http.get(
      `${this.url}/${idActoTramiteCaso}/info-plazos`
    )
  }

  registrarPreparatoria(data: PlazoPreparatoria): Observable<any> {
    return this.http.post(
      `${this.url}/${data.idActoTramiteCaso}/requerimiento-prorroga`, data
    )
  }

  obtenerProrrogaInvPreparatoria(idActoTramiteCaso: string): Observable<any> {
    return this.http.get(
      `${this.url}/${idActoTramiteCaso}/prorrogainvestigacionpreparatoria`
    )
  }
  
  guardarProrrogaInvPreparatoria(data: DisposicionProrrogaInvPreparatoria): Observable<any> {
    return this.http.post(`${this.url}/prorrogainvestigacionpreparatoria`, data);
  }
  
}
