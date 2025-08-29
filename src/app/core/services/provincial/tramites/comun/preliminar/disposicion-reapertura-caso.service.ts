import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { DisposicionReapertura } from '@interfaces/provincial/tramites/comun/preliminar/disposicion-reapertura.interface';

@Injectable({
  providedIn: 'root'
})
export class DisposicionReaperturaCasoService {

  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/preliminar`

  constructor(
    private http: HttpClient
  ) {
  }

  guardarDisposicionReaperturaCaso(data: DisposicionReapertura): Observable<any> {
    return this.http.post(
      `${this.url}/${data.idActoTramiteCaso}/disposicionReaperturaCaso`, data
    )
  }

  obtenerDisposicionReaperturaCaso(idActoTramiteCaso: String): Observable<any> {
    return this.http.get(
      `${this.url}/${idActoTramiteCaso}/disposicionReaperturaCaso`
    )
  }
}
