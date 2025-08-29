import {Injectable} from "@angular/core";
import {ApiBaseService} from "@core/services/shared/api.base.service";
import {Observable} from "rxjs";
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ReusableDetalleFirmaService {

  constructor(private apiBase: ApiBaseService) {
  }

  verDetalleFirma(idDocumentoVersiones: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/detallefirma/${idDocumentoVersiones}`
    );
  }

}
