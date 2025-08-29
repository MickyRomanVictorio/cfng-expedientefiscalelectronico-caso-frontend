import { Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ReusableArchivoService {
  url = `${BACKEND.CFE_EFE}/v1/e/caso/reusable/archivo`

  constructor(private apiBase: ApiBaseService) { }

  verArchivo(idArchivo:string, nombreArchivo: string): Observable<any> {
    return this.apiBase.getFile(
      `${this.url}/obtener?archivoId=${idArchivo}&nombreArchivo=${nombreArchivo}`
    );
  }

}
