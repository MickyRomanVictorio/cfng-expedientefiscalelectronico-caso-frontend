import {Injectable} from "@angular/core";
import {ApiBaseService} from "@services/shared/api.base.service";
import {Observable, Subject} from "rxjs";
import {BACKEND} from "@environments/environment";
import {GuardarDocumentoRequest} from "@core/interfaces/reusables/firma-digital/guardar-documento-request.interface";
import {FirmaIndividualCompartido} from "@core/interfaces/reusables/firma-digital/firma-individual-compartido.interface";

@Injectable({
  providedIn: 'root'
})
export class VisadoIndividualService {

  private readonly esVisadoCompartido = new Subject<FirmaIndividualCompartido>();
  public esVisadoCompartidoObservable = this.esVisadoCompartido.asObservable();

  constructor(private readonly apiBase: ApiBaseService) {
  }

  notificarEsFirmado(compartido: FirmaIndividualCompartido) {
    this.esVisadoCompartido.next(compartido);
  }

  validarVisado(idBandejaActoTramite: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/visadodigital/validarvisado/${idBandejaActoTramite}`
    );
  }

  obtenerDatosVisado(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/visadodigital/datosvisado`
    );
  }

  obtenerDocumentoVisar(idDocumentoVersion: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/visadodigital/documentovisar/${idDocumentoVersion}`
    );
  }

  guardarDocumentoVisado(request: GuardarDocumentoRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/visadodigital/guardardocumentovisado`, request
    );
  }
}
