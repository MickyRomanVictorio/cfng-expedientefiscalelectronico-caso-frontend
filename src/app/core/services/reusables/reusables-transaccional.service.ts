import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReusablesTransaccionalService {

  urlReusables= `${BACKEND.CFE_EFE}/v1/e/caso/reusable`

  constructor( private apiBase: ApiBaseService ) { }

  agregarDelitos( request: Object ): Observable<any> {
    //return mock(DELITOS_MODIFCADOS)
    return this.apiBase.post(
      `${ this.urlReusables }/agregardelitos/delitos`,
      request
    );
  }

}
