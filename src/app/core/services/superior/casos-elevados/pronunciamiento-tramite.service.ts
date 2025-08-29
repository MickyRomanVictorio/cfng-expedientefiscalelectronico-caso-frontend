import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PronunciamientoTramiteService {

  private readonly url = `${BACKEND.CFE_EFE_SUPERIOR}`;
  private readonly base = this.url + '/v1/e';

  constructor(private readonly apiBase: ApiBaseService) { }

  public obtenerPestania(idCaso: string): Observable<any> {
    return this.apiBase.get(this.base + '/caso/reusable/pestaniaApelacion/pestaniaApelacion/' + idCaso);
  }

  public obtenerPestaniaHistorial(idCaso: string): Observable<any> {
    return this.apiBase.get(this.base + '/caso/reusable/pestaniaApelacion/historial/' + idCaso);
  }

  public obtenerPartesDelitos(idCaso: string): Observable<any> {
    return this.apiBase.get(this.base + '/caso/reusable/pestaniaApelacion/partesDelitos/' + idCaso);
  }

  public obtenerTramitePadre(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(this.base + '/caso/reusable/pestaniaApelacion/tramitepadre/' + idActoTramiteCaso);
  }
}
