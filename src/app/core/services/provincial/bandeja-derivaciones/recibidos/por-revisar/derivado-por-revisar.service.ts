import { Injectable } from "@angular/core";
import { ApiBaseService } from "@core/services/shared/api.base.service";

@Injectable({
  providedIn: 'root'
})
export class DerivadoPorRevisarService {

  private _formularioDevolucion: any = {};

  constructor( private apiBase: ApiBaseService ) { }

  guardarFormulario(datos: any) {
    this._formularioDevolucion = datos;
  }

  obtenerFormulario(): any {
    return this._formularioDevolucion;
  }

}
