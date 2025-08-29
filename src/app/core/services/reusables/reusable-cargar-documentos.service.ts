import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
  ///obtienedocumento/08A1C7A51419557BE0650250569D508A
export class ReusablesCargarDocumentos {
  url = `${BACKEND.CFE_EFE}/v1/e/caso/reusable/adjuntardocumentos`
  url2 = `${BACKEND.CFEMAESTROSDOCUMENTOS}v1/cftm/t/gestion/obtienedocumento`
  url3 = `${BACKEND.CFEMAESTROSDOCUMENTOS}v1/cftm/t/gestion/obtiene/documentoescrito`

  constructor(private apiBase: ApiBaseService) { }

  obtenerListadoDocumentos(numeroCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/${numeroCaso}`
    );
  }

  verPdf(codDocumento:string): Observable<any> {
    console.log("url ----");
    console.log(`${this.url2}/${codDocumento}`)
    return this.apiBase.get(
      `${this.url2}/${codDocumento}`
    );
  }


  verPdf2(codDocumento:string): Observable<any> {
    console.log("url ----");
    console.log(`${this.url2}/${codDocumento}`)
    return this.apiBase.get( `${this.url2}/${codDocumento}`
    );
  }

}
