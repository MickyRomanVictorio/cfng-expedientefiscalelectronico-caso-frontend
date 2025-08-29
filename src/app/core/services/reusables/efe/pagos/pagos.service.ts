import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from "@core/services/shared/api.base.service";
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  urlCaso = `${BACKEND.CFE_EFE}/v1/e/caso/reusable/pagos/`

  private readonly actualizarReparacionSub = new Subject<void>();

  actualizarReparacionOb$ = this.actualizarReparacionSub.asObservable();

  constructor(
    private readonly apiBase: ApiBaseService
  ) { }

  listarReparacionesCiviles(idCaso: string): Observable<any> {
    return this.apiBase.get(
      `${this.urlCaso}reparacion-civil/lista/${idCaso}`,
    );
  }
  detalleReparacion(idReparacionCivil: string,estadoCuota:number | null): Observable<any> {
    let param:string=``;
    if (estadoCuota) {
      param=`?estadoCuota=${estadoCuota}`
    }
    return this.apiBase.get(
      `${this.urlCaso}reparacion-civil/detalle/${idReparacionCivil}${param}`,
    );
  }

  listaSujetosReparaciones(idReparacionCivil: string,participante:number): Observable<any> {
    return this.apiBase.get(
      `${this.urlCaso}reparacion-civil/lista-sujetos/${idReparacionCivil}/${participante}`,
    );
  }
  detallePagoCuota(idCuota: string,idPagoCuota:string | null): Observable<any> {
    let param:string=``;
    if (idPagoCuota) {
      param=`?idPagoCuota=${idPagoCuota}`
    }
    return this.apiBase.get(
      `${this.urlCaso}detalle/${idCuota}${param}`,
    );
  }
  registrarEditarPago(request: any): Observable<any> {
    return this.apiBase.post(
      `${this.urlCaso}registrar-editar`, request
    );
  }
  eliminarPago(idSeguiCuota: string,idPagoCuota: string ): Observable<any> {
    return this.apiBase.delete(
      `${this.urlCaso}eliminar/${idSeguiCuota}/${idPagoCuota}`
    );
  }
  actualizarReparacion() {
    this.actualizarReparacionSub.next();
  }
}

