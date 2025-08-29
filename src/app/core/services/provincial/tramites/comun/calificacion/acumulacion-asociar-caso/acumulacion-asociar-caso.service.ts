import {Injectable} from "@angular/core";
import {BACKEND} from "@environments/environment";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {
  AcumulacionAsociarCaso
} from "@interfaces/provincial/tramites/comun/calificacion/acumulacion-asociar-caso/acumulacion-asociar-caso.interface";

@Injectable({
  providedIn: 'root'
})
export class AcumulacionAsociarCasoService {

  url: string = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`

  private envioEvento = new BehaviorSubject<Boolean>(false);
  eventoActual = this.envioEvento.asObservable();

  constructor(private http: HttpClient) {
  }

  activarEvento(valor: Boolean): void {
    this.envioEvento.next(valor);
  }

  obtenerDatos(idBandejaDerivacion: string): Observable<any> {
    return this.http.get(`${this.url}/calificacion/asociarcaso/${idBandejaDerivacion}`);
  }

  registrarAcumulacion(data: AcumulacionAsociarCaso): Observable<any> {
    return this.http.put(
      `${this.url}/${data.etapa}/asociarcaso/`,
      data,
      {responseType: 'text'}
    )
  }
}
