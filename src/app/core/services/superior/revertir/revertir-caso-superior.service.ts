import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiBaseService } from '@core/services/shared/api.base.service';


@Injectable({
  providedIn: 'root'
})
export class RevertirCasosSuperiorService {

  url = `${BACKEND.CFE_EFE_SUPERIOR}/v1/e/revertir`

  constructor(private apiBase: ApiBaseService,
    private http: HttpClient) { }


 revertirCaso(idbandeja:any): Observable<any> {
        return this.http.put(
            `${this.url}/${idbandeja}`, {});
    }

}
