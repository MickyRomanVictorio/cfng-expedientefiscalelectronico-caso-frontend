import {Injectable} from "@angular/core";
import {ApiBaseService} from "@services/shared/api.base.service";
import {Observable} from "rxjs";
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EscritoDesistimientoApelacionAutoService {

  private url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;

  constructor(private apiBase: ApiBaseService) {
  }

  registrar(request: any): Observable<any> {
    return this.apiBase.post(`${this.url}/preliminar/desistimientoapelacionauto`, request);
  }
}
