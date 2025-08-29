import {Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CarpetaAuxiliarCargoService {

  urlConsultas = `${BACKEND.CFE_EFE}/v1/e/caso/carpetaauxiliar`

  constructor(private apiBase: ApiBaseService,
              private http: HttpClient) {
  }


  subirCargo(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlConsultas}/guardarcedula`, request
    );
  }


}
