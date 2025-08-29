import { Injectable } from "@angular/core";
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from "rxjs";
import { HistorialTramiteRequest } from "@core/interfaces/reusables/historial-tramite/HistorialTramiteRequest";

import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable({
  providedIn: 'root'
})

export class ReusableHistorialTramiteService {

  urlHistorialTramite = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/historialtramite`;

  urlDocumentoTramite = `${BACKEND.CFEMAESTROSDOCUMENTOS}v1/cftm/t/gestion/obtienedocumento`;
  urlDocumentoVersionTramite = `${BACKEND.CFEMAESTROSDOCUMENTOS}v1/cftm/t/gestion/obtienedocumentoversion`;

  constructor(private apiBase: ApiBaseService) { }

  getListaHistorialTramite(idActoTramiteCaso: string, tamanoPagina: number, pagina: number): Observable<any> {
    return this.apiBase.get(`${this.urlHistorialTramite}/listahistorialtramite?idActoTramiteCaso=${idActoTramiteCaso}`);
  }

  restaurarTramite(request: HistorialTramiteRequest): Observable<any> {
    console.log('idActoTramiteCaso = ', request.idActoTramiteCaso);
    console.log('idBandejaActoTramite = ', request.idBandejaActoTramite);
    console.log('idDocumentoVersiones = ', request.idDocumentoVersiones);
    return this.apiBase.post(`${this.urlHistorialTramite}/restauratramite`, request);
  }

  verDocumentoTramite(idDocumento: any): Observable<any> {
    return this.apiBase.get(
      `${this.urlDocumentoTramite}/${idDocumento}`
    );
  }

  verDocumentoVersionTramite(iCaso: any): Observable<any> {
    return this.apiBase.get(
      `${this.urlDocumentoVersionTramite}/${iCaso}`
    );
  }

  formatearFecha(fecha: string): string {
    const fechaParseada = new Date(fecha);
    return format(fechaParseada, "d MMMM 'de' yyyy h:mm a", { locale: es });
  }

  formatearFechaconHoras(fecha: string): string {
    const fechaParseada = new Date(fecha);

    let fechaFormateada = format(fechaParseada, "d MMMM 'de' yyyy 'a horas' h:mm a", { locale: es });

    fechaFormateada = fechaFormateada.replace("AM", "a.m.").replace("PM", "p.m.");

    return fechaFormateada.toLowerCase();
  }


}
