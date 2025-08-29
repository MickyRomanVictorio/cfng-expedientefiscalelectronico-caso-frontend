import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
  })

  export class ReusablesObservacionService {
    url= `${BACKEND.CFE_EFE}/v1/e/caso/observaciones`
    constructor( private apiBase: ApiBaseService ) { }

    obtenerObservacion( numeroCaso: string ): Observable<any>{
        return this.apiBase.get(
            `${ this.url }/${numeroCaso}`
          );
    }

  }