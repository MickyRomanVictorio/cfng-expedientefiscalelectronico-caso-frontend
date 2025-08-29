import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import {
  TramiteResponse,
  ValidacionTramite,
} from '@interfaces/comunes/crearTramite';
import {
  TIPO_INICIO_TRAMITE,
  INGRESO_TRAMITE,
} from '@core/types/efe/provincial/tramites/comun/calificacion/acto-procesal.type';
import { Archivo } from '@interfaces/visor/visor-interface';
import { TramiteGenerico } from '@core/interfaces/provincial/tramites/genericos/tramite-generico.interface';

@Injectable({
  providedIn: 'root',
})
/**
 * Servicio encargado de gestionar y realizar operaciones sobre los trámites.
 * Proporciona métodos y propiedades para manejar el estado del trámite, su validación y su envío a un backend.
 */
export class TramiteService {
  /**
   * URL base para la API de trámites.
   * La URL se construye utilizando una constante que define el endpoint backend para los trámites.
   */
  url = `${BACKEND.CFE_EFE_TRAMITES}/v1/e`;

  /**
   * Indicador de si el documento ha sido editado.
   * Esta propiedad se usa para determinar si se debe mostrar el botón de guardar o firmar el documento
   * en conjunto con el valor de _formularioEditado
   */
  private _documentoEditado: boolean = false;

  /**
   * Indicador de si el formulario ha sido editado.
   * Esta propiedad se usa para determinar si se debe mostrar el botón de guardar o firmar el documento
   * en conjunto con el valor de _documentoEditado
   */
  private _formularioEditado: boolean = true;

  /**
   * Flag que indica si el proceso de inicio del trámite está habilitado.
   * Es utilizado para habilitar el botón de iniciar un nuevo trámite.
   */
  private _habilitarInicio: boolean = false;

  /**
   * Flag que indica si la opción de guardar el trámite está habilitada.
   * Controla el botón de guardar documento.
   */
  private _habilitarGuardar: boolean = false;
  /**
   * Flag que indica si la opción de firmar trámite se encuentra habilitada.
   * Controla el botón de firmar trámite, por defecto se encuentra activo y sólo se bloquea
   * cuando se está realizando la firma
   */
  private _habilitarFirmar: boolean = true;

  /**
   * Flag que indica si se ingresó al trámite sólo para visualizar datos sin permitir modificaciones.
   * Controla la habilitación de combos y formularios.
   */
  private _tramiteEnModoVisor: boolean = false;

  /**
   * Fecha de vencimiento del trámite, si corresponde.
   * Esta propiedad se utiliza para mostrar el cronómetro con el tiempo de vencimiento de plazo de un trámite.
   */
  private _vencimiento: Date | null = null;

  /**
   * Representa la información del trámite registrado.
   * Se llena con los datos obtenidos de la respuesta del backend al registrar un trámite o al obtener los datos
   * de un trámite en modo edición.
   */
  private _tramiteRegistrado!: TramiteResponse;

  /**
   * Contiene los detalles de validación del trámite.
   * Se utiliza para realizar validaciones adicionales relacionadas con los requisitos del trámite.
   */
  private _validacionTramite: WritableSignal<ValidacionTramite | undefined> = signal<ValidacionTramite | undefined>(undefined);

  /**
   * Función que valida si se puede salir de un formulario de trámite.
   * Esta función es opcional y se invoca para verificar si el usuario puede abandonar la interfaz sin problemas.
   */
  private _fnValidarSalida!: (() => Observable<boolean>) | undefined;

  /**
   * Subject que maneja el estado de recarga del editor.
   * Se utiliza para disparar un evento cuando es necesario recargar o actualizar la interfaz del editor de documentos.
   */
  private _reloadEditor = new BehaviorSubject<string | undefined>('');

  /**
   * Subject que maneja el evento de mostrar cargando el editor.
   * Se utiliza para disparar un evento cuando es necesario ocultar el editor y que se muestre un ícono de cargando.
   */
  private _loadingEditor = new BehaviorSubject<boolean | undefined>(false);

  /**
   * Subject que maneja el estado del botón de guardar el trámite.
   * Controla las actualizaciones del estado del botón de guardado, se invoca desde el editor de documentos y guarda el trámite.
   */
  private _guardarTramite = new BehaviorSubject<number>(0);
  reloadEditor = this._reloadEditor.asObservable();
  loadingEditor = this._loadingEditor.asObservable();
  guardarTramite = this._guardarTramite.asObservable();

  private dataSubject: BehaviorSubject<any> = new BehaviorSubject<any>('');
  public data$: Observable<any> = this.dataSubject.asObservable();
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(ApiBaseService);

  private readonly selectorTramiteSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  public readonly selectorTramiteSubject$ = this.selectorTramiteSubject.asObservable()

  abrirSelectorTramites(valor: boolean):void {
    this.selectorTramiteSubject.next(valor)
  }

  updateData(newValue: any): void {
    this.dataSubject.next(newValue);
  }

  getCurrentData(): any {
    return this.dataSubject.getValue();
  }

  handleReloadEditor(pathDocumento?: string) {
    this._reloadEditor.next(pathDocumento);
  }

  showLoading() {
    this._loadingEditor.next(true);
  }

  endLoading() {
    this._loadingEditor.next(false);
  }

  isLoading(): boolean {
    return this._loadingEditor.getValue() || false;
  }

  invocarGuadarTramite() {
    this._guardarTramite.next(Math.random());
  }

  set documentoEditado(data: boolean) {
    this._documentoEditado = data;
  }

  get documentoEditado(): boolean {
    return this._documentoEditado;
  }

  set formularioEditado(data: boolean) {
    this._formularioEditado = data;
  }

  get formularioEditado(): boolean {
    return this._formularioEditado;
  }

  set habilitarInicio(data: boolean) {
    this._habilitarInicio = data;
  }

  get habilitarInicio(): boolean {
    return this._habilitarInicio;
  }

  set habilitarGuardar(data: boolean) {
    this._habilitarGuardar = data;
  }

  get habilitarGuardar(): boolean {
    return this._habilitarGuardar;
  }

  set habilitarFirmar(data: boolean) {
    this._habilitarFirmar = data;
  }

  get habilitarFirmar(): boolean {
    return this._habilitarFirmar;
  }

  set tramiteEnModoVisor(data: boolean) {
    this._tramiteEnModoVisor = data;
  }

  get tramiteEnModoVisor(): boolean {
    return this._tramiteEnModoVisor;
  }

  set vencimiento(data: Date | null) {
    this._vencimiento = data;
  }

  get vencimiento(): Date | null {
    return this._vencimiento;
  }

  set tramiteRegistrado(data: TramiteResponse) {
    this._tramiteRegistrado = data;
  }

  get tramiteRegistrado(): TramiteResponse {
    return this._tramiteRegistrado;
  }

  set validacionTramite(data: ValidacionTramite) {
    this._validacionTramite.set(data);
  }

  get validacionTramite(): ValidacionTramite {
    return this._validacionTramite() || {} as ValidacionTramite;
  }

  set verEditor(data: boolean) {
    this.validacionTramite.verEditor = data;
  }

  set verIniciarTramite(data: boolean) {
    this.validacionTramite.verIniciarTramite = data;
  }

  iniciarValidacion(): void {
    this.validacionTramite = {} as ValidacionTramite;
  }

  iniciarValores(): void {
    this.documentoEditado = false;
    this.formularioEditado = true;
    this.habilitarInicio = false;
    this.habilitarGuardar = false;
    this.habilitarFirmar = true;
    this.tramiteEnModoVisor = false;
  }

  tabConValidacion(): boolean {
    return this._fnValidarSalida !== undefined;
  }

  ejecutarValidacion(): Observable<boolean> {
    if (this._fnValidarSalida === undefined) {
      return of(true);
    }

    const validacionFn = this._fnValidarSalida;
    return new Observable<boolean>(observer => {
      validacionFn().subscribe({
        next: (result) => {
          this.limpiarValidacion();
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          this.limpiarValidacion();
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  limpiarValidacion(): void {
    this._fnValidarSalida = undefined;
    this._documentoEditado = false;
    this._formularioEditado = false;
  }

  inicializarValidacion(fn: () => Observable<boolean>): void {
    this._fnValidarSalida = fn;
  }

  iniciarlizarValidacionTramite(): void {
    this.validacionTramite = {
      tipoInicio: TIPO_INICIO_TRAMITE.GENERADO,
      idItemIngresoTramite: INGRESO_TRAMITE.POR_EFE,
      mensaje: '',
      cantidadTramiteSeleccionado: 0,
      tipoOrigenTramiteSeleccionado: 0,
      idActoTramiteSeleccionado: '',
      idActoSeleccionado: '',
      idEstadoRegistro: null,
      modoEdicion: false,
      verFormulario: false,
      verEditor: false,
      verDocumentos: false,
      verIniciarTramite: false,
      bloquearIniciarTramite: false,
    };
  }

  tramiteManual(
    formData: FormData,
    idDocumetoVersion: string
  ): Observable<HttpEvent<TramiteResponse>> {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.http.post<any>(
      `${this.url}/crear/manual/${idDocumetoVersion}/borrador`,
      formData,
      {
        headers,
        reportProgress: true,
        observe: 'events',
      }
    );
  }

  crearTramiteBorrador(
    idCaso: string,
    idActoTramiteEstado: string
  ): Observable<TramiteResponse> {
    return this.apiBase.postEmpty(
      `${this.url}/${idCaso}/crear/${idActoTramiteEstado}/borrador`
    );
  }

  obtenerTramite(idActoTramiteCaso: string): Observable<TramiteResponse> {
    return this.apiBase.get(`${this.url}/obtener/${idActoTramiteCaso}`);
  }

  descargarDocumento(idDocumetoVersion: string): Observable<Archivo> {
    return this.apiBase.get(`${this.url}/descargar/${idDocumetoVersion}`);
  }

  obtenerActoTramiteEstado(idActoTramiteEstado: string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/actoTramiteEstado/${idActoTramiteEstado}`
    );
  }

  validarSiPuedeEditarTramite(idActoTramiteCaso: string): Observable<any> {
    return this.apiBase
      .get(
        `${this.url}/caso/tramite/firmado/validarCondiciones/${idActoTramiteCaso}`
      )
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  validarInicioDeTramite(
    idCaso: string,
    idActoTramiteEstado: string,
    idActoTramiteProcesalEnlace: string
  ): Observable<ValidacionTramite> {
    return this.apiBase.get(
      `${this.url}/${idCaso}/validar/${idActoTramiteEstado}/${idActoTramiteProcesalEnlace}`
    );
  }

  obtenerTabsPorCargo(): Observable<ValidacionTramite> {
    return this.apiBase.get(`${this.url}/bandeja/tramites/tabs`);
  }

  registrarEnjuiciamientoCitacion(
    request: any
  ) {
    return this.http.post(
      `${BACKEND.CFE_EFE_TRAMITES}/api/procesoInmediato/enjuiciamientoInmediato`, request
    );
  }

  obtenerEnjuiciamientoCitacion(idActoTramiteCaso: string): Observable<any> {
    return this.http.get(
      `${BACKEND.CFE_EFE_TRAMITES}/api/procesoInmediato/tramites/${idActoTramiteCaso}`
    );
  }

  validarExisteUltimoTramiteCaso(idCaso:string,idActoTramiteCaso: string,idActoTramiteEstado:string): Observable<any> {
    return this.apiBase.get(
      `${this.url}/validar-existe-ultimo-tramite-caso/${idCaso}/${idActoTramiteCaso}/${idActoTramiteEstado}`
    );
  }

  actualizarEstadoTramite(data: TramiteGenerico): Observable<any> {
    return this.apiBase.post(
      `${this.url}/actualizarEstadoTramite`, data
    )
  }
}
