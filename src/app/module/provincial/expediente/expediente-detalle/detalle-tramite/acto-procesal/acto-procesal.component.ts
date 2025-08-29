import { Component, ComponentRef, inject, input, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListarCasosConsultaService } from '@services/provincial/consulta-casos/listar-casos-consulta.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropdownModule } from 'primeng/dropdown';
import { catchError, concatMap, delay, firstValueFrom, Observable, of, Subject, Subscription, takeUntil, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { TramiteEditorComponent } from '@components/tramite-editor/tramite-editor.component';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { TramiteResponse, ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { obtenerComponenteTramite } from '@modules/provincial/tramites/tramites';
import { MessagesModule } from 'primeng/messages';
import { TokenService } from '@services/shared/token.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { ReusableEditarTramiteService } from '@services/reusables/reusable-editar-tramite.service';
import {
  SelectedActoTramiteProcesalService
} from '@services/provincial/bandeja-tramites/SeleccionarTramiteProcesalBehavior';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { obtenerRutaParaEtapa } from '@utils/utils';
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service';
import { ActoProcesal, ESTADO_REGISTRO, IconAsset, IconUtil } from 'ngx-cfng-core-lib';
import { SelectActoProcesalRequest } from '@interfaces/provincial/bandeja-tramites/SelectedActoTramiteRequest';
import { TabDocumentosComponent } from '@components/tab-documentos/tab-documentos.component';
import { Expediente } from '@utils/expediente';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { tap } from 'rxjs/operators';
import {
  INGRESO_TRAMITE,
  TIPO_INICIO_TRAMITE,
  TIPO_ORIGEN
} from '@core/types/efe/provincial/tramites/comun/calificacion/acto-procesal.type';
import { ActoProcesalBase } from '@interfaces/reusables/acto-procesal/acto-procesal.interface';
import { UsuarioAuthService } from '@core/services/auth/usuario.service.ts.service';
import { UsuarioAuth } from '@core/models/usuario-auth.model';
import { MessageService } from 'primeng/api';
import { ACTO_PROCESAL_ETAPA } from '@core/types/tipo-acto-procesal';
import { SeleccionarTramiteComponent } from './seleccionar-tramite/seleccionar-tramite.component';
import { CanComponentDeactivate } from '@guards/tramite-form-exit.guard';
import { ID_ETAPA } from '@core/constants/menu';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CasosMonitoreadosService } from '@core/services/superior/casos-monitoreados/casos-monitoreados.service';

@Component({
  standalone: true,
  selector: 'app-acto-procesal',
  templateUrl: './acto-procesal.component.html',
  styleUrls: ['./acto-procesal.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    TramiteEditorComponent,
    CmpLibModule,
    MessagesModule,
    InputTextareaModule,
    NgxExtendedPdfViewerModule,
    TabDocumentosComponent,
    SeleccionarTramiteComponent
  ],
  providers: [DialogService, TokenService, MessageService, NgxCfngCoreModalDialogService],
})
export class ActoProcesalComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  @Input() tramitePredefinido!: TramiteProcesal;
  @Input() datosExtraFormulario: any;
  public idActoTramiteCasoIn = input<string>('');
  public isTramiteEnModoEdicion = input<boolean>(false);
  @ViewChild('componenteACargar', {read: ViewContainerRef}) componenteACargar!: ViewContainerRef;
  private componenteCargado!: ComponentRef<any>;

  /*************/
  /* VARIABLES */
  /*************/
  public idActoTramiteSeccionado!: string;
  public idCaso: string = '';
  public numeroCaso: string = '';
  public etapa: string = '';
  public idEtapa: string = '';
  public idActoTramiteCaso: string = '';
  public tituloTramite: string = '';
  public formularioActoProcesal: FormGroup;
  public actosProcesales: ActoProcesalBase[] = [];
  public tramites: TramiteProcesal[] = [];
  public tramiteSeleccionado!: TramiteProcesal | null;
  public creacionTramiteRespuesta!: TramiteResponse;
  public peticionFormulario: ((datos?: any) => Observable<any>) | null = null;
  public ocultarTitulo: boolean = false;
  public ocultarTramiteIniciado: boolean = true;
  public casoFiscal!: Expediente;
  public usuario!: string;
  private idActoTramiteProcesalEnlace: string = ''
  public urlPdf: any;
  public idEstadoTramite!: number;
  public datosResolucionSubscription!: Subscription;
  public idDocumentos: any = '';
  protected tramiteEnModoEdicion: boolean = false
  protected iniTramiteCreado: boolean = false;
  public mostrarEnlace: boolean = false;
  public actosConEnalce: Array<string> = [
    ACTO_PROCESAL_ETAPA.PRINCIPIO_CALIFICACION,
    ACTO_PROCESAL_ETAPA.PRINCIPIO_PREELIMINAR,
    ACTO_PROCESAL_ETAPA.PRINCIPIO_PREPARATORIA
  ];
  public noTituloYBoton: boolean = false
  protected idActoProcesalSeleccionado: string = ''
  protected idTramiteSeleccionado: string = ''
  private guardarTiempo: any = null;

  private forzarConConfirmacionUsuario: boolean = false

  private readonly desuscribir$ = new Subject<void>();
  protected usuarioAuth!:UsuarioAuth;
  private routerSubscription!: Subscription;

  //nueva variable
  private idActoTramiteCasoUltimo :string = '';
  protected validarEstadoTramiteCasoUltimo :boolean = false;

  /***************/
  /* CONSTRUCTOR */
  /***************/
  protected readonly iconAsset = inject(IconAsset);
  protected readonly iconUtil = inject(IconUtil);
  constructor(
    private readonly route: ActivatedRoute,
    private readonly formulario: FormBuilder,
    private readonly listarCasosConsultaService: ListarCasosConsultaService,
    private readonly spinner: NgxSpinnerService,
    private readonly dialogService: DialogService,
    private readonly tramiteService: TramiteService,
    private readonly tokenService: TokenService,
    private readonly casoService: Casos,
    private readonly editarTramiteService: ReusableEditarTramiteService,
    private readonly selectedActoTramiteProcesalService: SelectedActoTramiteProcesalService,
    private readonly firmaIndividualService: FirmaIndividualService,
    protected readonly gestionCasoService: GestionCasoService,
    private readonly router: Router,
    private readonly usuarioAuthService:UsuarioAuthService,
    private readonly modalDialogService : NgxCfngCoreModalDialogService,
    private readonly casosMonitoreadosService: CasosMonitoreadosService,
  ) {
    this.formularioActoProcesal = this.formulario.group({
      actoProcesal: [null],
      tramite: [null],
    });
    this.obtenerUsuario();
  }

  /******************/
  /* CICLOS DE VIDA */
  /******************/

  public async ngOnInit(): Promise<void> {
    this.usuarioAuth = this.usuarioAuthService.obtenerDatosUsuario();
    this.gestionCasoService.alActualizarCaso$.pipe(takeUntil(this.desuscribir$)).subscribe(caso => {
      this.casoFiscal = caso;
      this.idEstadoTramite = this.casoFiscal.idEstadoRegistro;
      this.validacionTramite.idEstadoRegistro = this.casoFiscal.idEstadoRegistro;
      //obtengo el último id del acto tramite caso asignado al id caso
      this.idActoTramiteCasoUltimo = this.casoFiscal.idActoTramiteCasoUltimo;
    });

    // Suscribirse a los eventos de navegación
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.validarTab();
    });

    this.firmaIndividualService.limpiarValidacion();
    this.tramiteService.inicializarValidacion(this.validarTab);
    this.tramiteService.guardarTramite.pipe(takeUntil(this.desuscribir$)).subscribe(
      guardarTramite => this.guardarTramite()
    );
    this.iniciarlizarValidaciones();
    this.iniciarlizarVariables();
    await this.validarModo();

    this.validarEstadoUltimoTramiteCaso();


    // Para trámite predefinidos
    if (!this.esTramitePredefinido) {
      //Listar actos procesales segun caso
      this.obtenerActosProcesalesSegunCaso().pipe(
        takeUntil(this.desuscribir$),
        concatMap((res) => {
          if (this.tieneActoTramiteCasoURL) {
            return this.actoTramiteCasoURL();
          }
          return of(true);
        })
      ).subscribe();
    } else {
      this.gestionarTramitePredefinido();
    }
  }

  public ngOnDestroy(): void {
    this.desuscribir$.next();
    this.desuscribir$.complete();
    if (this.guardarTiempo !== null) {
      clearTimeout(this.guardarTiempo);
    }
    if (this.datosResolucionSubscription) {
      this.datosResolucionSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /***************/
  /* METODOS GET */
  /***************/

  get infoIcon(): string {
    return `assets/icons/info.svg`;
  }

  get tramiteCreado(): boolean {
    return this.idActoTramiteCaso !== ''
  }

  get idTramiteActual(): string {
    return this.idTramiteSeleccionado
  }

  get estaSeleccionadoUnActoProcesal(): boolean {
    return this.formularioActoProcesal.get('actoProcesal')!.value !== null
  }

  get estaSeleccionadoUnTramite(): boolean {
    return this.idTramiteSeleccionado !== null
  }

  get esFirmado(): boolean {
    return this.validacionTramite.idEstadoRegistro != null && this.validacionTramite.idEstadoRegistro == ESTADO_REGISTRO.FIRMADO
  }

  get estadoFirmado(): boolean {
    return this.casoFiscal.idEstadoRegistro == ESTADO_REGISTRO.FIRMADO
  }

  get estadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  get estadoPedienteCompletar(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.PENDIENTE_COMPLETAR
  }

  get tieneActoTramiteCasoURL(): boolean {
    return this.idActoTramiteProcesalEnlace !== null
  }

  get habilitarInicio(): boolean {
    return this.tramiteService.habilitarInicio;
  }

  set habilitarInicio(data: boolean) {
    this.tramiteService.habilitarInicio = data;
  }

  get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  set tramiteEnModoVisor(data: boolean) {
    this.tramiteService.tramiteEnModoVisor = data;
  }

  get activarGuardar(): boolean {
    return this.documentoEditado || this.formularioEditado;
  }

  get habilitarGuardar(): boolean {
    return this.tramiteService.habilitarGuardar;
  }

  get mostrarConfirmacion(): boolean {
    if (this.esFirmado || this.estadoRecibido) return false
    else return this.activarGuardar && this.habilitarGuardar;
  }

  get documentoEditado(): boolean {
    return this.tramiteService.documentoEditado;
  }

  set documentoEditado(dato: boolean) {
    this.tramiteService.documentoEditado = dato;
  }

  get formularioEditado(): boolean {
    return this.tramiteService.formularioEditado;
  }

  set formularioEditado(dato: boolean) {
    this.tramiteService.formularioEditado = dato;
  }

  get validacionTramite(): ValidacionTramite {
    return this.tramiteService.validacionTramite;
  }

  get mostrarTextoTramiteIniciado(): boolean {
    return !this.ocultarTramiteIniciado && this.validacionTramite.idItemIngresoTramite !== INGRESO_TRAMITE.POR_MESAS;
  }

  set validacionTramite(data: ValidacionTramite) {
    this.tramiteService.validacionTramite = data;
  }

  public obtenerUsuario(): void {
    const datosToken = this.tokenService.getDecoded()?.usuario
    this.usuario = datosToken?.usuario;
  }

  public validarTab = (): Observable<boolean> => {
    if (this.mostrarConfirmacion) {
      return new Observable<boolean>(observer => {
        const confirmarCreacionTramite = this.dialogService.open(AlertaModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'warning',
            title: `SALIR DEL TRÁMITE`,
            description: `¿Está seguro que desea salir del formulario?. Recuerde que se perderán los cambios realizados. Por favor confirme está acción.`,
            confirmButtonText: 'Confirmar',
            confirm: true,
          }
        } as DynamicDialogConfig<AlertaData>);

        // Esperamos a que el diálogo esté completamente inicializado
        setTimeout(() => {
          if (confirmarCreacionTramite) {
            confirmarCreacionTramite.onClose.pipe(
              concatMap((resp) => of(resp === 'confirm')),
              concatMap((resp) => resp ? this.eliminarDocumento() : of(resp))
            ).subscribe({
              next: (result) => {
                observer.next(result);
                observer.complete();
              },
              error: (error) => {
                observer.next(false);
                observer.complete();
              }
            });
          } else {
            observer.next(true);
            observer.complete();
          }
        }, 0);
      });
    }
    return this.eliminarDocumento();
  }

  // TODO error al eliminar el documento tio @gmendez
  private eliminarDocumento(): Observable<boolean> {
   /** if (!this.tramiteCreado) return of(true);
    const documento = {
      filename: this.tramiteService.tramiteRegistrado.pathDocumento || '',
      filePass: '',
      lang: '',
    };
    return this.editarTramiteService.eliminarDocumento(documento).pipe(
      takeUntil(this.desuscribir$),
      concatMap(() => of(true))
    );**/
    return of(true);
  }

  iniciarlizarValidaciones(): void {
    this.tramiteService.iniciarValores();
    this.tramiteService.iniciarlizarValidacionTramite();
  }

  iniciarlizarVariables(): void {
    this.casoFiscal = this.gestionCasoService.expedienteActual;
    this.ocultarTramiteIniciado = true;
    this.iniTramiteCreado = false;
    this.idCaso = this.casoFiscal.idCaso;
    this.idEstadoTramite = this.casoFiscal.idEstadoRegistro;
    this.etapa = obtenerRutaParaEtapa(this.casoFiscal.idEtapa);
    this.idEtapa = this.casoFiscal.idEtapa;
    this.numeroCaso = this.casoFiscal.numeroCaso;
    if(this.idActoTramiteCasoIn()!==''){
      this.idActoTramiteProcesalEnlace = this.idActoTramiteCasoIn();
    }else{
      this.idActoTramiteProcesalEnlace = this.route.snapshot.paramMap.get('idActoTramiteCaso')!;
    }
  }

  async validarModo(): Promise<void> {
    const urlActual: string = this.router.url;
    this.tramiteEnModoEdicion = urlActual.includes('/editar') || this.isTramiteEnModoEdicion();
    this.tramiteEnModoVisor = this.idActoTramiteProcesalEnlace !== null && this.idActoTramiteProcesalEnlace !== '' && !this.tramiteEnModoEdicion;
    if (this.tramiteEnModoEdicion) {
      // Validar si el trámite en modo edición realmente debería poderse editar
      let puedeEditarTramite: boolean = await firstValueFrom(this.tramiteService.validarSiPuedeEditarTramite(this.idActoTramiteProcesalEnlace))
      !puedeEditarTramite && this.router.navigateByUrl(urlActual.replace('/editar', ''), {replaceUrl: true})
    }

    if (this.tramiteEnModoVisor || this.tramiteEnModoEdicion) {
      this.bloquearCombos();
    }
  }

  private bloquearCombos(): void {
    /**this.bloquearCombosTramite = true**/
  }

  validarEstadoUltimoTramiteCaso(): void {
    /**const idActoTramiteCasoUltimo : string = this.casoFiscal.idActoTramiteCasoUltimo;**/
    const idActoTramiteCasoUltimo = this.gestionCasoService.getCasoFiscalActual()?.idActoTramiteCasoUltimo;

    if (idActoTramiteCasoUltimo && this.tokenService.getDecoded().usuario.codJerarquia !== '02') { // TODO la validacion solo considera casos de provincial, se debe corregir para valida tambien en superior, se excluye temporalmente la validacion en superior
      this.editarTramiteService.validarEstadoUltimoActoTramite(idActoTramiteCasoUltimo)
        .subscribe({
          next: resp => {

            const estado = typeof resp === 'string' ? resp.trim() : String(resp).trim();

            this.validarEstadoTramiteCasoUltimo = estado === '0';

            this.spinner.hide();

          },
          error: (error) => {
            console.error('se va al el error siguiente  ' + error);
            this.spinner.hide();
          }
        })
    }
  }

  /***************************************/
  /* OBTENER ACTOS PROCESALES SEGÚN CASO */
  /***************************************/

  protected mostrarIdCasoExtremo():string{
    //ESTA FUNCION SE ELIMINARÁ CUANDO SE HABILITEN LOS ACTOS PROCESALES PARA LOS EXTREMOS
    if(this.casoFiscal.idTipoCuaderno == 4){
      if(this.casoFiscal.idCasoPadre){
        return this.casoFiscal.idCasoPadre;
      }
    }
    return this.casoFiscal.idCaso;
  }

  private obtenerActosProcesalesSegunCaso(): Observable<ActoProcesalBase[]> {
    return this.listarCasosConsultaService.obtenerActosProcesales(this.casoFiscal.idCaso, this.idActoTramiteProcesalEnlace).pipe(
      takeUntil(this.desuscribir$),
      tap((resp) => {
        resp.forEach(e => {
          e.nombreActoProcesal = e.nombreActoProcesal.charAt(0) + e.nombreActoProcesal.slice(1).toLowerCase();
        })
        if (this.casoFiscal.flgConcluido === '1') {
          this.actosProcesales = resp.filter((elm: any) => {
            let existe = false;
            ActoProcesal.ReaperturaDeInvestigacion.split(',').forEach(e => {
              if (e === elm.idActoProcesal) existe = true;
            });
            return existe;
          });
        } else {
          this.actosProcesales = resp;
        }
      })
    );
  }

  //--000008: DISPOSICION DE ARCHIVO CONSENTIDO
  //--000029: DISPOSICION DE ARCHIVO LIMINAR CONSENTIDO
  verificarTramiteArchivo(){
    return this.casoFiscal && this.casoFiscal.idEtapa === ID_ETAPA.PRELIMINAR &&
    (this.casoFiscal.ultimoIdTramite === '000008' || this.casoFiscal.ultimoIdTramite === '000029') &&
    !this.tramiteEnModoVisor;
  }

  verificarTramitePredifinido(){
    return this.tramitePredefinido!=null;
  }

  actoTramiteCasoURL(): Observable<boolean> {
    this.spinner.show()
    return this.casoService.actoTramiteDetalleCaso(this.idActoTramiteProcesalEnlace).pipe(
      takeUntil(this.desuscribir$),
      tap(resp => {
        this.idActoProcesalSeleccionado = resp.idActoTramiteConfigura
        this.idTramiteSeleccionado = resp.idActoTramiteEstado
        this.idEstadoTramite = resp.idEstadoTramite;
        this.idDocumentos = resp.idDocumentos;
      }),
      concatMap(resp => this.obtenerTramitesSegunActoProcesalV2(resp.idActoTramiteConfigura)
        .pipe(concatMap(() => of(resp)))),
      concatMap(resp => this.seleccionarTramite(resp.idActoTramiteEstado, true)),
      catchError(err => {
        this.spinner.hide();
        return of(true);
      })
    );
  }

  //TODO comentado hasta identificar el uso
  //actoTramiteCaso(): Observable<any> {
  //  return this.resolucionService.getData().pipe(
  //    takeUntil(this.desuscribir$),
  //    tap((resp) => {
  //        this.idEstadoTramite = resp.idEstadoRegistro;
  //        this.idDocumento = resp.idDocumentos;
  //    }),
  //    catchError(err => this.spinner.hide())
  //  );
  //}

  public eventoCambiarActoProcesal(idActoProcesal: string): void {
    this.idActoProcesalSeleccionado = idActoProcesal
    //this.mostrarEnlace = this.actosConEnalce.includes(idActoProcesal);
    const tramiteControl = this.formularioActoProcesal.get('tramite')!;
    this.tituloTramite = '';
    this.tramites = [];
    this.tramiteSeleccionado = null;
    this.ocultarTramiteIniciado = true;
    this.idActoTramiteCaso = '';
    this.idActoTramiteSeccionado = idActoProcesal;
    if (idActoProcesal === null) {
      tramiteControl.reset();
      tramiteControl.disable();
      return;
    }
    this.tramiteService.iniciarValidacion();
    this.obtenerTramitesSegunActoProcesalV2(idActoProcesal).pipe(
      tap(() => {
        tramiteControl.enable();
        this.noTituloYBoton = true;
        this.componenteCargado?.destroy();
      })
    ).subscribe();
  }

  /*****************************************************/
  /* OBTENER TRÁMITES SEGÚN ACTO PROCESAL PARA UN CASO */
  /*****************************************************/

  private obtenerTramitesSegunActoProcesalV2(actoProcesalId: string): Observable<any> {
    this.tramites = [];
    this.spinner.show();
    return this.listarCasosConsultaService.obtenerTramitesProcesalesV2(this.idCaso, actoProcesalId, this.idActoTramiteProcesalEnlace).pipe(
      takeUntil(this.desuscribir$),
      tap((resp) => {
        resp.forEach(e => {
          e.nombreTramite = e.nombreTramite.charAt(0) + e.nombreTramite.slice(1).toLowerCase();
        })
        //si el caso es simple, no se debe mostrar tramites complejos
        if (this.casoFiscal.idTipoComplejidad !== 2) this.tramites = resp  //si el caso es complejo o crimen organizado se debe mostrar todos los tramites
        else this.tramites = resp.filter((data:any) => {
          return data.idTipoComplejidad != '1' || data.idTipoComplejidad == null
        })
      })
    );
  }

  eventoSeleccionarTramite(idActoTramiteEstado: string): void {
    this.idTramiteSeleccionado = idActoTramiteEstado
    this.seleccionarTramite(idActoTramiteEstado, false).subscribe();
  }

  seleccionarTramite(idActoTramiteEstado: string, tieneUrl: boolean): Observable<boolean> {
    const preSeleccionado = this.tramites.find(tramite => tramite.idActoTramiteEstado === idActoTramiteEstado);
    if (!preSeleccionado) return of(false);
    this.ocultarTramiteIniciado = true;
    this.tramiteSeleccionado = preSeleccionado;
    if (this.tramiteSeleccionado.formulario == null || this.tramiteSeleccionado.formulario == '') {
      this.tramiteService.iniciarValidacion();
      return of(false);
    }
    return this.validarTramiteIniciado(tieneUrl);
  }

  public validarTramiteIniciado(forzarFormulario: boolean): Observable<boolean> {

    if (!this.tramiteSeleccionado) {
      return of(false);
    }

    return this.validarIniciarTramite(forzarFormulario).pipe(
      tap((resp) => {
        this.componenteCargado?.destroy();
        this.idActoTramiteCaso = '';
        this.tituloTramite = '';
        this.ocultarTitulo = false;
        this.habilitarInicio = false;

        if (resp.mensaje && !forzarFormulario) {

          if (resp.mensaje.includes('[PREGUNTAR]')) {

            const tituloRegex = /\[TITULO\](.*?)\[MENSAJE\]/
            const mensajeRegex = /\[MENSAJE\](.*)/
            const tituloMatch = tituloRegex.exec(resp.mensaje)
            const mensajeMatch = mensajeRegex.exec(resp.mensaje)

            const titulo = tituloMatch ? tituloMatch[1].trim() : 'Confirmación'
            const mensaje = mensajeMatch ? mensajeMatch[1].trim() : ''

            const dialog = this.modalDialogService.warning(titulo?.toUpperCase(), mensaje, 'Sí',true,'No')
            this.tramiteService.abrirSelectorTramites(true)

            dialog.subscribe({
              next: (resp: CfeDialogRespuesta) => {
                if (resp === CfeDialogRespuesta.Confirmado) {
                  this.forzarConConfirmacionUsuario = true
                  this.eventoSeleccionarTramite(this.tramiteSeleccionado!.idActoTramiteEstado)
                  this.tramiteService.abrirSelectorTramites(false)
                }
              },
            })

          } else {
            this.mensajeInfo('TRÁMITE NO DISPONIBLE', resp.mensaje, 'warning', 'Aceptar')
            this.tramiteService.abrirSelectorTramites(true)
          }
        }
      }),
      concatMap((resp) => {
        this.forzarConConfirmacionUsuario = false
        if (resp.verFormulario || forzarFormulario) {
          this.validacionTramite.verFormulario = true;
          this.tituloTramite = this.tramiteSeleccionado?.nombreTramite || '';
          return this.obtenerTramiteEnBorrador(forzarFormulario, resp).pipe(
            concatMap((tramiteResponse) =>
              this.cargarDatosRecibido(forzarFormulario, resp, tramiteResponse)),
            tap((tramiteResponse) => {
              this.cargarFormularioTramite(this.tramiteSeleccionado!.formulario, resp);
              this.validacionTramite = resp;
              this.spinner.hide();
            }),
          );
        } else {
          this.validacionTramite = resp;
          return of (true);
        }
      }),
      concatMap(() => {
        if (this.tramiteEnModoVisor) this.validacionTramite.verIniciarTramite = false;
        return of(true);
      })
    );
  }

  public validarIniciarTramite(forzarFormulario: boolean): Observable<ValidacionTramite> {

    if(!this.tramiteSeleccionado?.idActoTramiteEstado) return of({} as ValidacionTramite)

    let valorFormulario: string;

    if (forzarFormulario) {
      valorFormulario = this.idActoTramiteProcesalEnlace
    } else if (this.forzarConConfirmacionUsuario) {
      valorFormulario = '1';
    } else {
      valorFormulario = '0';
    }

    this.forzarConConfirmacionUsuario = false

    return this.tramiteService.validarInicioDeTramite(
      this.casoFiscal.idCaso,
      this.tramiteSeleccionado.idActoTramiteEstado,
      valorFormulario
    )

  }

  public obtenerTramiteEnBorrador(forzarFormulario: boolean, resp: ValidacionTramite): Observable<TramiteResponse> {
    let idBuscar = '';
    if (forzarFormulario) {
      idBuscar = this.idActoTramiteProcesalEnlace;
    } else {
      idBuscar = resp.idActoTramiteSeleccionado || '';
    }
    return idBuscar == '' ? of({} as TramiteResponse) : this.tramiteService.obtenerTramite(idBuscar).pipe(
      takeUntil(this.desuscribir$),
      tap((response: TramiteResponse) => {
        this.iniciarComponentes(response);
      })
    );
  }

  /**
   * Se ejecuta esta fucnción sólo para los trámites RECIBIDOS cuando son cargados
   * seleccionando los combos de acto y trámite. Para obtener los datos del caso y los
   * Id's de documentos requeridos en el componente visor de PDF/Cargo
   */
  cargarDatosRecibido(forzarFormulario: boolean, validacion: ValidacionTramite, tramiteResponse: TramiteResponse): Observable<TramiteResponse> {
    if (!forzarFormulario && (validacion.tipoInicio == TIPO_INICIO_TRAMITE.RECIBIDO || validacion.tipoOrigenTramiteSeleccionado !== TIPO_ORIGEN.EFE)) {
      return this.casoService.actoTramiteDetalleCaso(validacion.idActoTramiteSeleccionado).pipe(
        tap((resp) => {
          this.idDocumentos = resp.idDocumentos;
        }),
        concatMap(() => of(tramiteResponse))
      )
    } else {
      return of(tramiteResponse);
    }
  }

  public cargarFormularioTramite(formularioACargar: string, resp: ValidacionTramite): void {
    if (this.componenteCargado) {
      this.componenteCargado.destroy();
    }
    const componente = obtenerComponenteTramite(formularioACargar);
    if (componente) {
      this.componenteCargado = this.componenteACargar.createComponent(componente)
      this.componenteCargado.instance.idCaso = this.idCaso
      this.componenteCargado.instance.numeroCaso = this.numeroCaso
      this.componenteCargado.instance.etapa = this.etapa
      this.componenteCargado.instance.idEtapa = this.idEtapa
      this.componenteCargado.instance.tramiteSeleccionado = this.tramiteSeleccionado
      this.componenteCargado.instance.idDocumento = this.idDocumentos
      this.componenteCargado.instance.datosExtra = this.datosExtraFormulario
      this.componenteCargado.instance.idEstadoTramite = resp.idEstadoRegistro;
      this.componenteCargado.instance.tramiteEnModoEdicion = resp.modoEdicion || this.tramiteEnModoEdicion;
      this.componenteCargado.instance.idActoTramiteCaso = resp.idActoTramiteSeleccionado;
      this.componenteCargado.instance.validacionTramite = resp;
      this.componenteCargado.instance.iniTramiteCreado = this.iniTramiteCreado;

      // Se establece al inciar el componente la peticion para ejecutar
      this.componenteCargado?.instance?.peticionParaEjecutar?.pipe(takeUntil(this.desuscribir$)).subscribe((peticion:any) => {
        this.peticionFormulario = peticion
      });

      // Se recibe orden si se debe ocultar el subtítulo genérico
      this.componenteCargado?.instance?.ocultarTitulo?.pipe(takeUntil(this.desuscribir$)).subscribe((valor:any) => {
        this.ocultarTitulo = this.noTituloYBoton ? true : valor
      });

      //Se recibe si se oculta el titulo Trámite Iniciado
      this.componenteCargado?.instance?.ocultarTramiteIniciado?.pipe(takeUntil(this.desuscribir$)).subscribe((valor:boolean) => {
        this.ocultarTramiteIniciado = valor
      });

      //Se escucha si ya se firmo
      this.firmaIndividualService.esFirmadoCompartidoObservable.pipe(takeUntil(this.desuscribir$)).subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.bloquearCombos();
            this.componenteCargado.instance.deshabilitado = true;
            //desactiva combo de trámites ni bien firma
            this.validarEstadoTramiteCasoUltimo = true;
          }
        }
      );
    }
  }

  private iniciarComponentes(response: TramiteResponse): void {
    this.creacionTramiteRespuesta = response;
    this.tramiteService.tramiteRegistrado = response;
    this.idActoTramiteCaso = response.idActoTramiteCaso!;
  }

  /*****************/
  /* CARGAR TITULO */
  /*****************/

  public obtenerTitulo(titulo: string): string {
    if (!titulo) return '';
    return titulo.charAt(0).toUpperCase() + titulo.slice(1).toLowerCase();
  }

  /************************************/
  /* PREGUNTAR SI DESEA CREAR TRÁMITE */
  /************************************/

  public confirmarCreacionTramite(): void {
    const confirmarCreacionTramite = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Iniciar trámite`,
        description: `Esta acción iniciará el trámite <span class='bold'>${this.tramiteSeleccionado!.nombreTramite}</span>
            en estado borrador. ¿Desea continuar?`,
        confirmButtonText: 'Aceptar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>)

    confirmarCreacionTramite.onClose.pipe(
      takeUntil(this.desuscribir$),
      delay(200),
      concatMap((resp) => {
        if (resp === 'confirm') {
          this.tramiteService.abrirSelectorTramites(false)
          this.crearTramite();
        }
        return of(true);
      })
    ).subscribe();
  }

  /*****************/
  /* CREAR TRAMITE */

  /*****************/

  private crearTramite(): void {
    this.spinner.show();
    this.tramiteService.crearTramiteBorrador(this.idCaso, this.idTramiteActual)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe({
        next: (response) => {
          this.iniTramiteCreado = true;
          const alertModal = this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: ``,
              description: `Se inició correctamente el trámite <span class='bold'>${this.tramiteSeleccionado!.nombreTramite}</span>
              en estado: "Borrador"`,
              confirmButtonText: 'Aceptar',
              confirm: false,
            }
          } as DynamicDialogConfig<AlertaData>);
          alertModal.onClose.pipe(
            takeUntil(this.desuscribir$),
            concatMap((resp) => this.obtenerCasoFiscal(this.idCaso)),
            tap(() => {
              this.creacionTramiteRespuesta = response;
              this.tramiteService.tramiteRegistrado = response;
              this.idActoTramiteCaso = response.idActoTramiteCaso || '';
              this.ocultarTramiteIniciado = false;
              //this.bloquearCombos();
              //desactiva combo de trámites ni bien inicializa
              this.validarEstadoTramiteCasoUltimo = true;
            }),
            concatMap(() => this.cargarTramite()),
            tap((res) => {
              //this.componenteCargado.instance.idActoTramiteCaso = response.idActoTramiteCaso
            })
          ).subscribe({
            complete: () => {
              this.spinner.hide();
            }
          });
        },
        error: () => {
          this.mensajeInfo(null, 'Ha ocurrido un error, inténtelo más tarde', 'error', 'Aceptar');
          this.spinner.hide();
        }
      });
  }

  cargarTramite(): Observable<boolean> {
    if (!this.tramiteSeleccionado) {
      return of(false);
    }
    this.idActoTramiteCaso = ''

    let request: SelectActoProcesalRequest = {
      idActoTramiteEstado: this.tramiteSeleccionado.idActoTramiteEstado,
      idTramite: this.idActoTramiteSeccionado,
      tramiteNombre: this.tramiteSeleccionado.nombreTramite,
      etapaCaso: this.casoFiscal.idEtapa
    }
    this.selectedActoTramiteProcesalService.setIdTramite(request);

    if (this.estaSeleccionadoUnTramite) {
      return this.validarTramiteIniciado(false);
    } else return of(false);
  }

  /********************/
  /* GUARDADO TRAMITE */

  /********************/

  public async guardarTramite(): Promise<void> {
    if (this.tramiteCreado) {
      if (this.formularioEditado) {
        this.peticionFormulario!().pipe(
          delay(200),
          tap(() => {
            this.ocultarTramiteIniciado = true;
          })
        ).subscribe({
          next: async (resp) => {
            await this.guardarDocumento(false);
          },
          error: (err) => {
            console.error(err);
          }
        });
      } else {
        await this.guardarDocumento(true);
      }
    }
  }

  async guardarDocumento(conMensaje: boolean): Promise<void> {
    if (this.documentoEditado) {
      clearTimeout(this.guardarTiempo);
      await this.spinner.show();
      this.tramiteService.showLoading();
      this.guardarTiempo = setTimeout(async () => {
        this.creacionTramiteRespuesta = await this.guardarDocumentoEditado(this.creacionTramiteRespuesta);
        this.ocultarTramiteIniciado = true;
        this.documentoEditado = false;
        this.tramiteService.endLoading();
        await this.spinner.hide();
        const nomTra = this.obtenerTitulo(this.tituloTramite);
        if (conMensaje) {
          this.mensajeInfo(
            'Datos guardados correctamente',
            `Se guardaron correctamente los datos para el trámite: <b>${nomTra}</b>`,
            'success',
            'Aceptar');
        }
      }, 10000);
    }
  }

  /********************/
  /* GUARDADO TRAMITE */

  /********************/

  mensajeInfo(mensaje:any, submensaje:any, icono:any, textoBotonConfirm:any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icono,//'info',
        title: mensaje,
        description: submensaje,
        confirmButtonText: textoBotonConfirm,//OK,
        confirm: false,
      }
    } as DynamicDialogConfig<AlertaData>)
  }

  get esTramitePredefinido(): boolean {
    return this.tramitePredefinido !== undefined;
  }

  private gestionarTramitePredefinido() {
    //this.formularioActoProcesal.get('tramite')!.setValue(this.tramitePredefinido.idActoTramiteEstado)
    this.idTramiteSeleccionado = this.tramitePredefinido.idActoTramiteEstado
    this.tramites = [this.tramitePredefinido];
    this.seleccionarTramite(this.tramitePredefinido.idActoTramiteEstado, false).subscribe();
  }

  private obtenerCasoFiscal(idCaso: any): Observable<any> {
    return this.gestionCasoService.obtenerCasoFiscalV2( idCaso ).pipe(
      tap(() => this.casoFiscal = this.gestionCasoService.expedienteActual)
    )
  }

  guardarDocumentoEditado(data: TramiteResponse): Promise<any> {
    return new Promise<boolean>((resolve, reject) => {
      if (!data.idDocumentoVersiones || !data.pathDocumento) {
        reject();
        return
      }
      this.editarTramiteService.guardarDocumentoEditado(data.idDocumentoVersiones, data.pathDocumento)
        .subscribe({
          next: resp => {
            resolve(resp)
          },
          error: (error) => {
            this.tramiteService.endLoading();
            this.spinner.hide()
          }
        })
    });
  }

  canDeactivate(): Observable<boolean> {
    return this.validarTab();
  }

  public esModoLecturaMonitoreado(): boolean {
    const esMonitoreado = this.casosMonitoreadosService.getEsMonitoreado(); 
    return esMonitoreado === '1';
  }
}
