import { DatePipe, NgClass } from '@angular/common'
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { icono } from 'dist/ngx-cfng-core-lib';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { DomSanitizer } from '@angular/platform-browser'
import {
  SLUG_CONFIRM_RESPONSE, SLUG_SIGN,
  validMaxLengthCustom,
} from '@constants/mesa-unica-despacho'
import { DateMaskModule } from '@directives/date-mask.module'
import { DigitOnlyModule } from '@directives/digit-only.module'
import { BACKEND } from '@environments/environment'
import { MaestroService } from '@services/shared/maestro.service'
import { TokenService } from '@services/shared/token.service'
import {
  archivoFileToB64, base64ToFile,
  base64ToFilePdf,
  formatoPesoArchivo,
  trustUrlB64,
} from '@utils/file'
import { obtenerIcono } from '@utils/icon'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { DropdownModule } from 'primeng/dropdown'
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { MessagesModule } from 'primeng/messages'
import { ProgressBarModule } from 'primeng/progressbar'
import { RadioButtonModule } from 'primeng/radiobutton'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TableModule } from 'primeng/table'
import { ToastModule } from 'primeng/toast'
import { catchError, concatMap, EMPTY, Observable, of, Subscription } from 'rxjs'

import { SelectActoProcesalRequest } from '@interfaces/provincial/bandeja-tramites/SelectedActoTramiteRequest'
import { DatosFirma } from '@interfaces/reusables/firma-digital/datos-firma.interface'
import {
  CargoCabecera,
  DocumentoCargoRequest,
} from '@interfaces/reusables/firma-digital/guardar-documento-request.interface'
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service'
import { MesaDocumentoService } from '@services/generales/mesa-documento.service'
import { ModalCargoFirmadoComponent } from '@components/registrar-presentacion-disposiciones/modal-cargo-firmado/modal-cargo-firmado.component'
import { VisorPdfCargoComponent } from '@components/registrar-presentacion-disposiciones/visor-pdf-cargo/visor-pdf-cargo.component'
import {
  FirmaDigitalClienteComponent,
  FirmaDigitalClienteService,
  FirmaInterface,
} from 'ngx-cfng-core-firma-digital'
import { RepositorioDocumentoService } from '@core/services/generales/repositorio-documento.service'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { MensajeInteroperabilidadPjComponent } from '../mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { ExpedienteMaskModule } from '@core/directives/expediente-mask.module'
import { MensajeFirma } from '@core/interfaces/reusables/firma-digital/mensaje-firma.interface'
import { AlertaModalComponent } from '../modals/alerta-modal/alerta-modal.component'
import { AlertaData } from '@core/interfaces/comunes/alert'
import { Router } from '@angular/router'
import { NgxSpinnerService } from 'ngx-spinner'
import {ESTADO_REGISTRO, MathUtil } from 'ngx-cfng-core-lib';
import {
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';

import { getDateFromString } from '@core/utils/utils';
import { tap } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-registrar-presentacion-disposiciones',
  templateUrl: './registrar-presentacion-disposiciones.component.html',
  styleUrl: './registrar-presentacion-disposiciones.component.scss',
  imports: [
    RadioButtonModule,
    DateMaskModule,
    DropdownModule,
    NgClass,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    CmpLibModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    DigitOnlyModule,
    FormsModule,
    ProgressBarModule,
    ToastModule,
    TableModule,
    CalendarModule,
    FirmaDigitalClienteComponent,
    SelectButtonModule,
    VisorPdfCargoComponent,
    MensajeInteroperabilidadPjComponent,
    ExpedienteMaskModule,
    NgxCfngCoreModalDialogModule
  ],
  providers: [
    DialogService,
    FirmaDigitalClienteService,
    DatePipe,
    DynamicDialogRef,
    DynamicDialogConfig,
  ],
})
export class RegistrarPresentacionDisposicionesComponent implements OnInit, OnDestroy {

  @Input() idCaso: string = ''
  @Input() tramiteSeleccionado: TramiteProcesal | null = null
  @Input() idActoTramiteCaso!: string
  @Input() idEstadoTramite: number = 0;
  @Output() ocultarTramiteIniciado = new EventEmitter<boolean>();

  public refModal!: DynamicDialogRef
  private nombreDocumentoCargado!: string
  private urlDocumentoFirmado: any

  protected files: any[] = []
  protected fileSign: any = {}
  protected isSignFile: boolean = false
  protected usuario: any
  protected documentoFirmado!: Blob
  protected documentoCargado: boolean = false
  protected flagDocumentoCargado: boolean = false
  protected flagOcultarBoton: boolean = false
  protected suscriptions: Subscription[] = []
  protected datosFirma!: DatosFirma
  protected tipoCopia: any = []
  protected distritoJudicialList = []
  protected juzgadosList = []

  protected formatoPesoArchivo = formatoPesoArchivo
  protected obtenerIcono = obtenerIcono
  protected caracteresRestantes: number = 1000
  private readonly cantidad_maxima_carateres: number = 1000
  protected readonly maximoTotalArchivo: number = 1024 * 1024 * 30; /* Se debe colocar 100 mb, pero el componente de firma solo soporta hasta 50 mb, revisar especificación*/
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly mathUtil = inject(MathUtil);
  protected fechaIngreso: Date | null = null;

  protected documentoAdjunto: any = {
    id: null,
    preNamePdf: 'Vista previa del documento',
    urlPdf: null,
    namePdf: '',
    isSign: false,
    base64: null,
    fromServer: false,
  }

  protected formRegistro: FormGroup = new FormGroup({
    fechaPresentacion: new FormControl(null, [Validators.required]),
    txtExpediente: new FormControl(null, [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(27),
      Validators.pattern(/^\d{5}-\d{4}-\d-\d{4}-[A-Z]{2}-[A-Z]{2}-\d{2}$/)
    ]),
    cboDistritoJudicial: new FormControl(null, [Validators.required]),
    cboJuzgado: new FormControl(null, [Validators.required]),
    txtObservacion: new FormControl(null, [Validators.maxLength(1000)]),
    idTipoCopia: new FormControl(null, [Validators.required]),
    fechaRegistro: new FormControl(null, [Validators.required])
  })

  maxDate: Date = new Date()

  constructor(
    protected ref: DynamicDialogRef,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    private readonly firmaDigitalClienteService: FirmaDigitalClienteService,
    private readonly firmaIndividualService: FirmaIndividualService,
    protected maestroService: MaestroService,
    protected sanitizer: DomSanitizer,
    protected datePipe: DatePipe,
    private readonly tokenService: TokenService,
    protected mesaDocumentoService: MesaDocumentoService,
    protected repositorioDocumentoService: RepositorioDocumentoService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly tramiteService: TramiteService,
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService
  ) {
    let usuarioToken = this.getUserSession()
    this.usuario = usuarioToken.usuario
  }

  get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  get formFirmaValidation(): boolean {
    return this.formRegistro.valid
  }

  get formsValidation(): boolean {
    return this.formFirmaValidation
  }

  getUserSession() {
    return this.tokenService.getDecoded()
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((e) => e.unsubscribe())
  }

  public selectActoProcesalRequest!: SelectActoProcesalRequest

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor
  }

  public icono(name: string): string {
    return icono(name);
  }

  public ngOnInit(): void {
    this.fechaIngreso = getDateFromString(this.gestionCasoService.expedienteActual.fechaIngresoDenuncia);
    this.getTipoCopia()
    this.formCargaDataInicio()
    this.getListDistritoJudicial()
    this.obtenerFormulario(this.idActoTramiteCaso)
    this.tramiteEnModoVisor && this.formRegistro.disable()
    this.suscriptions.push(
      this.firmaDigitalClienteService.processSignClient.subscribe(
        (data: any) => {
          this.procesoFirma(data)
        }
      )
    )
  }

  private formCargaDataInicio(): void {
    this.formRegistro.patchValue({
      fechaRegistro: this.datePipe.transform(new Date(), 'dd/MM/yyyy hh:mm')
    })
  }

  public validMaxLength(field: string = 'dni'): void {
    validMaxLengthCustom(field, this)
  }

  public counterReportChar(): number {
    return this.formRegistro.get('txtObservacion')!.value !== null
      ? this.formRegistro.get('txtObservacion')!.value.length
      : 0
  }

  protected processSignDocument(file: any) {

    if ( file.process == 3 ) {
      this.modalDialogService.warning(
        '',
        `Lo sentimos, el archivo PDF supera el límite de tamaño permitido (${this.mathUtil.bytesAMegabytes(this.maximoTotalArchivo,0)}). Por favor, reduce el tamaño del archivo y vuelve a intentarlo o comunicate con el aréa de soporte.`,
        'Aceptar',
      );
      return;
    }

    if (file.isFirst && !file.isSign) {
      file.descriptionDocument = this.config.data?.denuncia.numeroDocumento
      this.fileSign = file
      this.documentoCargado = true
      this.flagDocumentoCargado = true
      !file.isSign ? this.manejarDocumentoNoFirmado() : this.manejarDocumentoFirmado()
    }

  }

  protected getListDistritoJudicial(): void {
    this.suscriptions.push(
      this.maestroService.getDistritoJudicial().subscribe({
        next: (resp) => {
          if (resp && resp.code === 200) {
            this.distritoJudicialList = resp.data
          }
        },
      })
    )
  }

  protected listarJuzgadosPazLetrado(idDistritoJudicial: number) {
    if ( idDistritoJudicial !== null ) {
      this.maestroService
        .getJuzgadosPorDistritoJudicial(idDistritoJudicial)
        .subscribe({
          next: (resp) => {
            this.juzgadosList = resp.data
          },
          error: (e) => {
            console.error(e)
          },
        })
    }
  }

  private getTipoCopia(): void {
    this.suscriptions.push(
      this.maestroService.getCatalogo('ID_N_TIPO_COPIA').subscribe({
        next: (resp) => {
          this.tipoCopia = resp.data
        },
        error: (error) => {
          this.tipoCopia = []
        },
      })
    )
  }

  private manejarDocumentoNoFirmado(): void {
    this.getUrlFile(this.fileSign.file, false);
  }

  private manejarDocumentoFirmado(): void {
    if (!this.fileSign.base64) {
      this.mesaDocumentoService
        .obtenerDocumentoServidor(this.fileSign.idDocumento)
        .subscribe({
          next: (res: any) => {
            this.fileSign.base64 = res.data[0].archivo;
            this.getUrlFile(this.fileSign.base64, true);
          },
          error: (error) => {
            console.error(error);
          },
        });
    } else {
      this.getUrlFile(this.fileSign.base64, true);
    }
  }

  async getUrlFile(data: any, fromServer: boolean): Promise<void> {
    let pdf = fromServer
      ? trustUrlB64(String(data))
      : URL.createObjectURL(data)
    this.documentoAdjunto = {
      id: this.fileSign.id,
      urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(pdf),
      preNamePdf: fromServer ? '' : 'Vista previa del documento',
      namePdf: `${this.fileSign.nombreOrigen}`,
      isSign: this.fileSign.isSign,
      base64: fromServer ? this.fileSign.base64 : await archivoFileToB64(data),
      fromServer: fromServer,
    }
  }

  private resetearFormulario(): void {
    this.isSignFile = false
    this.formRegistro.get('fechaPresentacion')!.disable()
    this.formRegistro.get('txtExpediente')!.disable()
    this.formRegistro.get('cboDistritoJudicial')!.disable()
    this.formRegistro.get('txtObservacion')!.disable()
    this.formRegistro.get('cboJuzgado')!.disable()
    this.formRegistro.get('idTipoCopia')!.disable()
    this.formRegistro.get('fechaRegistro')!.disable()

    this.flagOcultarBoton = true
    this.documentoCargado = true
  }

  get labelClose(): string {
    return this.formsValidation ? 'Cerrar' : 'Cancelar'
  }

  protected confirmarGuardarDigitalizado(): void {
    let datosUsuario =
      this.usuario.info.nombres +
      ' ' +
      this.usuario.info.apellidoMaterno +
      ' ' +
      this.usuario.info.apellidoPaterno
    this.refModal = this.dialogService.open(ModalCargoFirmadoComponent, {
      showHeader: false,
      contentStyle: { 'max-width': '650px', padding: '0px' },
      data: {
        tipoModal: SLUG_CONFIRM_RESPONSE.OK,
        usuario: datosUsuario,
        tipoCopia: this.fileSign.nombreRadio,
      },
    })

    this.refModal.onClose.subscribe((confirm) => {
      if (confirm === SLUG_CONFIRM_RESPONSE.OK) {
        this.iniciarFirma();
      }
    })
  }

  private iniciarFirma(): void {
    this.spinner.show().then();
    this.suscriptions.push(
      this.obtenerDatosFirma().pipe(
        concatMap((resp) => this.cargarDocumentoRepositorio())
      ).subscribe({
        next: (nodeId) => {
          let body: FirmaInterface = {
            id: nodeId,
            firma_url: `${BACKEND.FIRMA_CLIENTE}`,
            repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
            rol: this.datosFirma.cargoFirmador,
            motivo: this.fileSign.nombreRadio,
            param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
            extension: 'pdf',
            posicionX: null,
            posicionY: null,
          };
          console.log('enviad sendDataSign');
          this.firmaDigitalClienteService.sendDataSign.emit(body);
        },
        complete: () => this.spinner.show(),
        error: () => {
          this.spinner.hide();
        }
      })
    );
  }

  private obtenerDatosFirma(): Observable<any> {
    this.spinner.show().then();
    return this.firmaIndividualService.obtenerDatosFirma().pipe(
      tap((resp) => {
        console.log(resp);
        this.spinner.show();
        this.datosFirma = resp
      }),
      catchError((error) => {
        this.spinner.hide();
        console.log(error);
        return of(EMPTY);
      })
    );
  }

  private cargarDocumentoRepositorio(): Observable<any> {
    this.spinner.show().then();
    const formData = new FormData();
    formData.append(
      'file',
      base64ToFilePdf(this.documentoAdjunto.base64)!,
      this.documentoAdjunto.namePdf
    );
    console.log('cargarDocumentoRepositorio');
    return this.repositorioDocumentoService.guardarDocumentoRepositorio(formData).pipe(
      tap((resp) => {
        console.log(resp);
        this.spinner.show();
        this.nombreDocumentoCargado = resp.data.nodeId
      }),
      concatMap(resp => of(resp.data.nodeId)),
      catchError((error) => {
        this.spinner.hide();
        console.log(error);
        throw Error(error);
      })
    );
  }

  async procesoFirma(realizado: string): Promise<void> {
    if (realizado === '0') {

      await this.obtenerDocumentoFirmado(this.nombreDocumentoCargado)

      let formCargo = this.formRegistro.getRawValue()

      const requestCargo: CargoCabecera = {
        codigoDocumento: this.nombreDocumentoCargado,
        nombreDocumentoFichero: this.nombreDocumentoCargado,
        numExpedientePoderJudicial: formCargo.txtExpediente,
        fechaPresentacion: formCargo.fechaPresentacion,
        fechaRecepcion: `${formCargo.fechaRegistro}`,
        observacion: formCargo.txtObservacion,
        idTipoEntidad: formCargo.cboDistritoJudicial,
        codigoEntidad: formCargo.cboJuzgado,
        idTipoCopia: this.fileSign.optionRadio,
        nombreOrigen: this.fileSign.nombreOrigen
      }

      this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
      let expedienteActual = this.gestionCasoService.expedienteActual

      const request: any = {
        idCaso: this.idCaso,
        idActoTramiteEstado: this.tramiteSeleccionado?.idActoTramiteEstado,
        idActoTramiteCaso: expedienteActual.idActoTramiteCasoUltimo,
        datosCabecera: requestCargo,
        archivo: this.nombreDocumentoCargado,
      }
      await this.guardarDocumento(request)
    }
    if (realizado === '1') {
      await this.spinner.hide();
      alert(SLUG_SIGN.CANCEL);
    }
  }

  private async guardarDocumento(request: DocumentoCargoRequest) {
    return new Promise<void>((resolve, reject) => {
      this.suscriptions.push(
        this.firmaIndividualService.guardarDocumentoCargo(request).subscribe({
          next: (resp) => {
            this.resetearFormulario();
            this.ocultarTramiteIniciado.emit(true);
            let idcaso = this.gestionCasoService.expedienteActual.idCaso
            this.gestionCasoService.obtenerCasoFiscal(idcaso)
            this.idEstadoTramite = ESTADO_REGISTRO.FIRMADO
            this.documentoAdjunto.isSign = true
            resolve()

            if( this.tramiteSeleccionado!.idActoTramiteEstado === '00000810100112020700024800000'){

              this.alertaDocumentoFirmado({
                idTipoAccion: '1030',
                titulo: 'SALTO DE ETAPA',
                descripcion: 'El caso ha saltado a la etapa: Juicio inmediato',
                accion: 'app/administracion-casos/consultar-casos-fiscales/juicio-inmediato/programacion/caso/'+idcaso+'/acto-procesal',
                icono: 'success',
                mostrarBotonCancelar: '',
                textoBotonCancelar: '',
                textoBotonConfirmar: 'Aceptar'

              })
            }
          },
          error: (e) => {
            if (e.error.code == 500) {
              this.modalDialogService.error(
                'Error en el servicio',
                `${e.error.message}`,
                'Aceptar'
              );
            } else {
              this.modalDialogService.warning(
                'Mensaje del sistema',
                `${e.error.message}`,
                'Aceptar'
              );
            }
            this.manejarDocumentoNoFirmado()
          },
        })
      )
    })
  }

  public referenciaModal!: DynamicDialogRef

  private alertaDocumentoFirmado(mensajeFirma: MensajeFirma) {
    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      closeOnEscape: false,
      closable: false,
      data: {
        icon: mensajeFirma.icono,
        title: mensajeFirma.titulo,
        description: mensajeFirma.descripcion,
        confirmButtonText: mensajeFirma.textoBotonConfirmar,
        cancelButtonText: mensajeFirma.textoBotonCancelar,
        confirm: false,
      },
    } as DynamicDialogConfig<AlertaData>)

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (
          mensajeFirma.idTipoAccion !== null &&
          (resp === 'confirm' || resp === 'closedAction')
        ) {
          this.router.navigate([mensajeFirma.accion])
        }
      },
    })
  }

  private async obtenerDocumentoFirmado(nodeId: string) {
    return new Promise<void>((resolve, reject) => {
      this.suscriptions.push(
        this.repositorioDocumentoService
          .verDocumentorepositorio(nodeId)
          .subscribe({
            next: (resp) => {
              this.documentoFirmado = new Blob([resp], {
                type: 'application/pdf',
              })
              this.urlDocumentoFirmado =
                this.sanitizer.bypassSecurityTrustResourceUrl(
                  URL.createObjectURL(this.documentoFirmado)
                )
              this.getUrlFirmado(
                this.documentoFirmado,
                this.urlDocumentoFirmado,
                true
              )
              resolve()
            },
            error: (e) => {
              console.error(e)
            },
          })
      )
    })
  }

  async getUrlFirmado(
    data: any,
    docFirmado: any,
    fromServer: boolean
  ): Promise<void> {
    this.documentoAdjunto = {
      id: this.fileSign.id,
      urlPdf: docFirmado,
      preNamePdf: '',
      namePdf: `${this.fileSign.nombreOrigen}`,
      base64: await archivoFileToB64(data),
      fromServer: fromServer,
    }
  }

  protected downloadPDF() {
    const name = this.documentoAdjunto.namePdf
    const link = document.createElement('a')
    link.href = URL.createObjectURL(this.documentoFirmado)
    link.setAttribute('download', `${name}`)
    document.body.appendChild(link)
    link.click()
  }

  protected eliminarDocumento(file: any): void {

    if (this.isSignFile) {
      this.repositorioDocumentoService
        .eliminarDocumentorepositorio(file.name)
        .subscribe({
          next: (res) => {},
          error: (error) => {
          },
        })
    }

    if (file === null) {
      file = this.fileSign
    }
    const indexToDelete = this.files.findIndex((i) => i.id === file.id)
    this.files.splice(indexToDelete, 1)

    this.documentoCargado = false
    this.isSignFile = false
    this.formRegistro.get('idTipoCopia')?.enable()
    this.formRegistro.patchValue({
      idTipoCopia: null,
      idAnexo: null,
      nombreTipoCopia: null,
      nombreDocumentoOriginal: null,
      numeroFolios: null,
    })
    this.documentoAdjunto = {
      id: null,
      urlPdf: null,
      preNamePdf: 'Vista previa del documento',
      namePdf: '',
      isSign: false,
      base64: null,
      fromServer: false,
    }
  }

  protected actualizarContadorInputTextArea(e: Event): void {
    const value = (e.target as HTMLInputElement).value
    this.caracteresRestantes = this.cantidad_maxima_carateres - value.length
  }

  public obtenerFormulario(idActoTramiteCaso: string) {
    this.suscriptions.push(
      this.firmaIndividualService
        .recuperarDatosCargoExpediente(idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.updateFormulario(resp)
          },
          error: (error) => {
            console.error(error)
          },
        })
    )
  }

  private updateFormulario(resp: any) {
    this.formRegistro.patchValue({
      fechaPresentacion: resp.fechaPresentacion,
      txtExpediente: resp.numExpedientePoderJudicial,
      cboDistritoJudicial: resp.idTipoEntidad,
      cboJuzgado: resp.codigoEntidad,
      txtObservacion: resp.observacion,
      fechaRegistro: resp.fechaRecepcion
    })
    if ( resp.bloquearNumeroExpediente ) {
      this.formRegistro.get('txtExpediente')?.disable()
    }
    if ( this.tramiteEnModoVisor ) {
      this.fileSign.id = resp.nodeId
      this.fileSign.nombreOrigen = resp.nombreDocumentoOrigen
      this.obtenerDocumentoFirmado(resp.nodeId)
    }
  }
}
