import {Injectable} from "@angular/core";
import {ApiBaseService} from "@services/shared/api.base.service";
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {BACKEND} from "@environments/environment";
import {GuardarDocumentoRequest} from "@interfaces/reusables/firma-digital/guardar-documento-request.interface";
import {FirmaIndividualCompartido} from "@interfaces/reusables/firma-digital/firma-individual-compartido.interface";
import {
  DocumentoCargoFirmadoInterface
} from "@interfaces/provincial/administracion-casos/documento-cargo-firmado/documento-cargo-firmado.interface";
import { ConfiguracionFirma } from '@interfaces/reusables/firma-digital/datos-firma.interface';

@Injectable({
  providedIn: 'root'
})
export class FirmaIndividualService {

  /**
   * Función que valida si se puede firmar, previo a la ejecución del proceso de firmado.
   * Esta función es opcional y se invoca para agregar validaciones adicionales al evento de firma, por defecto es indefinida.
   */
  private _fnValidarFirma!: (() => Observable<boolean>) | undefined;
  private esFirmadoCompartido = new Subject<FirmaIndividualCompartido>();
  public esFirmadoCompartidoObservable = this.esFirmadoCompartido.asObservable();

  constructor(private apiBase: ApiBaseService) {
  }

  public notificarEsFirmado(compartido: FirmaIndividualCompartido) {
    this.esFirmadoCompartido.next(compartido);
  }

  /**
   * Indica si hay una función de validación de firma configurada.
   *
   * @returns `true` si existe una función de validación, `false` en caso contrario.
   */
  firmaConValidacion(): boolean {
    return this._fnValidarFirma !== undefined;
  }

  /**
   * Ejecuta la función de validación configurada.
   *
   * @returns Un `Observable<boolean>` que emite el resultado de la validación.
   *          Si no hay función definida, retorna `Observable<true>`.
   */
  ejecutarValidacion(): Observable<boolean> {
    if (this._fnValidarFirma === undefined) {
      return of(true);
    }

    const validacionFn = this._fnValidarFirma;
    return new Observable<boolean>(observer => {
      validacionFn().subscribe({
        next: (result) => {
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Limpia la función de validación configurada.
   */
  limpiarValidacion(): void {
    this._fnValidarFirma = undefined;
  }

  /**
   * Inicializa la función de validación personalizada.
   *
   * @param fn Función que retorna un `Observable<boolean>` indicando si la validación fue exitosa.
   */
  inicializarValidacion(fn: () => Observable<boolean>): void {
    this._fnValidarFirma = fn;
  }

  obtenerDatosFirma(): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/firmadigital/datosfirma`
    );
  }

  obtenerConfiguracionFirma(idDocumentoVersiones: string): Observable<ConfiguracionFirma> {
    return this.apiBase.get(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/firmadigital/permiso-firma/${idDocumentoVersiones}`);
  }

  obtenerDocumentoAFirmar(idDocumentoVersiones: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/firmadigital/documentoafirmar/${idDocumentoVersiones}`
    );
  }

  guardarDocumento(request: GuardarDocumentoRequest): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/firmadigital/guardardocumento`, request
    );
  }

  registrarDocuemntoCargoFirmado(data: DocumentoCargoFirmadoInterface): Observable<any> {
    return this.apiBase.post(`${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/firmadigital/cargo`, data);
  }

  guardarDocumentoCargo(request: any): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/firmadigital/documento/cargo`, request
    );
  }

  recuperarDatosCargoExpediente(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase.get(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/firmadigital/documento/${idActoTramiteCaso}/presentacion-disposicion`
    )
  }
  guardarActaEscaneada(request: any): Observable<any> {
    return this.apiBase.post(
      `${BACKEND.CFE_EFE_TRAMITES}/v1/e/caso/firmadigital/documento/actaEscaneada`, request
    );
  }

}
