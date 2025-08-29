import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable } from 'rxjs';
import { RegistrarReparacionCivilRequest } from '@core/interfaces/reusables/reparacion-civil/registrar-reparacion-civil-request';
import { ListaDeudoresRequest } from '@core/interfaces/reusables/reparacion-civil/lista-deudores-request';

@Injectable({
  providedIn: 'root'
})
export class RegistrarReparacionCivilService {
  urlTramites = `${BACKEND.CFE_EFE_TRAMITES}/v1/e/reparacion/civil/`

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  listaDeudores(request: ListaDeudoresRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramites}lista/sujetos-deudores`, request
    );
  }

  listaAcreedores(idCaso: string,idActoTramiteCaso:string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}lista/sujetos-acreedores/${idCaso}/${idActoTramiteCaso}`
    );
  }

  registrarReparacionCivil(request: RegistrarReparacionCivilRequest): Observable<any> {
    return this.apiBase.post(
      `${this.urlTramites}registrar-editar`, request
    );
  }

  listaReparacionCivil(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}listar/card/${idActoTramiteCaso}`
    );
  }

  eliminarReparacionCivil(idReparacionCivil: string): Observable<any> {
    return this.apiBase.delete(
      `${this.urlTramites}eliminar/card/${idReparacionCivil}`
    );
  }

  listaSujetosEditar(idReparacionCivil: string | undefined): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}lista/sujetos-editar/${idReparacionCivil}`
    );
  }

  obtenerUltimaSecuencia(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}secuencia/${idActoTramiteCaso}`
    );
  }
  validarAcuerdoActaDeudores(idCaso:string,idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlTramites}validar-acuerdos-acta-deudores/${idCaso}/${idActoTramiteCaso}`
    );
  }
}

