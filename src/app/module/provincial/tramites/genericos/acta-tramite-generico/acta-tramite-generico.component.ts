import { Component, EventEmitter, inject, input, Output } from '@angular/core'
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
  SLUG_SIGN,
  validMaxLengthCustom,
} from '@constants/mesa-unica-despacho'
import { BACKEND } from '@environments/environment'
import { MaestroService } from '@services/shared/maestro.service'
import { TokenService } from '@services/shared/token.service'
import {
  archivoFileToB64,
  base64ToFilePdf,
  formatoPesoArchivo,
  trustUrlB64,
} from '@utils/file'
import { obtenerIcono } from '@utils/icon'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { ButtonModule } from 'primeng/button'
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { ProgressBarModule } from 'primeng/progressbar'
import { RadioButtonModule } from 'primeng/radiobutton'
import { TableModule } from 'primeng/table'
import { ToastModule } from 'primeng/toast'
import { catchError, concatMap, EMPTY, Observable, of, Subscription, throwError } from 'rxjs'

import { DatosFirma } from '@interfaces/reusables/firma-digital/datos-firma.interface'
import {
  DocumentoCargoRequest,
} from '@interfaces/reusables/firma-digital/guardar-documento-request.interface'
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service'
import { MesaDocumentoService } from '@services/generales/mesa-documento.service'
import { VisorPdfCargoComponent } from '@components/registrar-presentacion-disposiciones/visor-pdf-cargo/visor-pdf-cargo.component'
import {
  FirmaDigitalClienteComponent,
  FirmaDigitalClienteService,
  FirmaInterface,
} from 'ngx-cfng-core-firma-digital'
import { RepositorioDocumentoService } from '@core/services/generales/repositorio-documento.service'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { ExpedienteMaskModule } from '@core/directives/expediente-mask.module'
import { NgxSpinnerService } from 'ngx-spinner'
import { ESTADO_REGISTRO, MathUtil } from 'ngx-cfng-core-lib';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { map, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { TramitesGenericosService } from '@core/services/provincial/tramites/genericos/tramites-genericos.service';
import { capitalizedFirstWord } from '@core/utils/string';
@Component({
  selector: 'acta-tramite-generico',
  standalone: true,
  imports: [
    RadioButtonModule,
    InputTextareaModule,
    CmpLibModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    FormsModule,
    ProgressBarModule,
    ToastModule,
    TableModule,
    FirmaDigitalClienteComponent,
    VisorPdfCargoComponent,
    ExpedienteMaskModule,
    NgxCfngCoreModalDialogModule,
    CommonModule,
    CheckboxModule
  ],
  providers: [
    DialogService,
    FirmaDigitalClienteService,
    DynamicDialogRef,
    DynamicDialogConfig,
    NgxCfngCoreModalDialogService
  ],
  templateUrl: './acta-tramite-generico.component.html',
  styleUrl: './acta-tramite-generico.component.scss'
})
export class ActaTramiteGenericoComponent {

  public idCaso = input.required<string>()

  public tramiteSeleccionado = input.required<TramiteProcesal | null>()

  public idActoTramiteCaso = input.required<string>()

  public validacionFormulario = input<boolean>(true);

  public serviceGuardarDatosTramite = input<(request: any) => Observable<any>>();

  public requestGuardarDatosTramite = input<any>();

  private readonly subscriptions: Subscription[] = []

  private readonly maestroService = inject(MaestroService)

  protected readonly config = inject(DynamicDialogConfig)

  protected readonly dialogService = inject(DialogService)

  protected readonly firmaDigitalClienteService = inject(FirmaDigitalClienteService)

  protected readonly firmaIndividualService = inject(FirmaIndividualService)

  protected readonly sanitizer = inject(DomSanitizer)

  protected readonly tokenService = inject(TokenService)

  protected readonly mesaDocumentoService = inject(MesaDocumentoService)

  protected readonly repositorioDocumentoService = inject(RepositorioDocumentoService)

  protected readonly gestionCasoService = inject(GestionCasoService)

  protected readonly tramiteService = inject(TramiteService)

  private readonly tramitesGenericosService = inject(TramitesGenericosService);

  protected readonly spinner = inject(NgxSpinnerService)

  private readonly mathUtil = inject(MathUtil)

  public idEstadoTramite!: number

  @Output() actaEscaneadaFirmada = new EventEmitter<any>();

  public refModal!: DynamicDialogRef

  private nombreDocumentoCargado!: string

  private urlDocumentoFirmado: any

  protected files: any[] = []

  protected fileSign: any = {}

  protected isSignFile: boolean = false

  protected documentoFirmado!: Blob

  protected documentoCargado: boolean = false

  protected flagDocumentoCargado: boolean = false

  protected flagOcultarBoton: boolean = false

  protected datosFirma!: DatosFirma

  protected tipoCopia: any = []

  protected formatoPesoArchivo = formatoPesoArchivo

  protected obtenerIcono = obtenerIcono

  protected maximoCaracteresObservacion : number = 1000

  protected contadorCaracteresObservacion = 0

  protected readonly maximoTotalArchivo: number = 1024 * 1024 * 100; /* Se debe colocar 100 mb, pero el componente de firma solo soporta hasta 50 mb, revisar especificación*/

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);

  protected actaEscaneada = new FormControl(false)

  protected actaYaEscaneada: boolean = false;


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
    idTipoCopia: new FormControl(null, [Validators.required]),
    observaciones: new FormControl('', [Validators.required])
  })

  constructor(
  ) {
  }
  ngOnInit(): void {
    this.getTipoCopia()
    this.obtenerFormulario(this.idActoTramiteCaso())
    if (this.tramiteEnModoVisor) {
      this.formRegistro.disable()
      this.actaEscaneada.disable()
    }
    this.subscriptions.push(
      this.firmaDigitalClienteService.processSignClient.subscribe(
        (data: any) => {
          if (this.actaEscaneada.value) {
            this.procesoFirma(data)
          }
        }
      )
    )
    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            //DESACTIVA CHECKBOX DE ACTA ESCANEADA SI SE FIRMA POR FIRMA INDIVIDUAL
            this.actaEscaneada.disable()
            if (this.actaYaEscaneada != this.actaEscaneada.value) {
              this.guardarActaEscaneada(false, '')
            }
          }
        }
      )
    )

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((e) => e.unsubscribe())
  }
  protected seleccionarDocumentoEscaneado(event: any): void {
    const { checked } = event
    this.tramiteService.verEditor = !checked
  }

  protected processSignDocument(file: any) {

    if (file.process == 3) {
      this.modalDialogService.warning(
        '',
        `Lo sentimos, el archivo PDF supera el límite de tamaño permitido (${this.mathUtil.bytesAMegabytes(this.maximoTotalArchivo, 0)}). Por favor, reduce el tamaño del archivo y vuelve a intentarlo o comunicate con el aréa de soporte.`,
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

  private getTipoCopia(): void {
    this.subscriptions.push(
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
    this.flagOcultarBoton = true
    this.documentoCargado = true
    this.formRegistro.disable()
    this.actaEscaneada.disable()
  }

  get labelClose(): string {
    return this.formsValidation ? 'Cerrar' : 'Cancelar'
  }

  protected confirmarGuardarDigitalizado(): void {
    const dialog = this.modalDialogService.question(
      'REGISTRAR ACTA',
      'Está a punto de firmar digitalmente y registrar el acta cargada. <b>Está acción no podrá revertirse</b> ¿Desea continuar con el registro?',
      'Si, continuar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.subscriptions.push(
            this.guardarFormularioGenerico().subscribe()
          );
        }
      },
    });
  }


protected guardarFormularioGenerico(): Observable<any> {
  const service = this.serviceGuardarDatosTramite();

  if (!service) {
    this.iniciarFirma();
    return EMPTY;
  }

  return service(this.requestGuardarDatosTramite()).pipe(
    tap(() => {
      this.iniciarFirma()
    }),
    map(() => 'válido'),
    catchError(() => {
      this.modalDialogService.error(
        'Error',
        'No se pudo guardar la información para el trámite: <b>' + this.nombreTramite() + '</b>.',
        'Aceptar'
      );
      return throwError(() => new Error('Error al guardar'));
    })
  );
}

  private iniciarFirma(): void {
    this.spinner.show().then();
    this.subscriptions.push(
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
        complete: () => { this.spinner.show(); },
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

      const requestCargo: any = {
        codigoDocumento: this.nombreDocumentoCargado,
        nombreDocumentoFichero: this.nombreDocumentoCargado,
        idTipoCopia: this.fileSign.optionRadio,
        nombreOrigen: this.fileSign.nombreOrigen,
      }

      this.gestionCasoService.obtenerCasoFiscal(this.idCaso())
      let expedienteActual = this.gestionCasoService.expedienteActual

      const request: any = {
        idCaso: this.idCaso(),
        idActoTramiteEstado: this.tramiteSeleccionado()?.idActoTramiteEstado,
        idActoTramiteCaso: expedienteActual.idActoTramiteCasoUltimo,
        datosCabecera: requestCargo,
        archivo: this.nombreDocumentoCargado,
        flgActaEscaneada: this.actaEscaneada.value,
        descripcionActaEscaneada: `${formCargo.observaciones}`,

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
      this.subscriptions.push(
        this.firmaIndividualService.guardarActaEscaneada(request).subscribe({
          next: (resp) => {
            this.resetearFormulario();
            this.actaEscaneadaFirmada.emit(null);
            let idcaso = this.gestionCasoService.expedienteActual.idCaso
            this.gestionCasoService.obtenerCasoFiscal(idcaso)
            this.idEstadoTramite = ESTADO_REGISTRO.FIRMADO
            this.documentoAdjunto.isSign = true
            resolve()
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

  private async obtenerDocumentoFirmado(nodeId: string) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
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
          next: (res) => { },
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

  protected contadorCaracterObservaciones(): void {
    const words = this.formRegistro.get('observaciones')!.value ?? ''
    this.contadorCaracteresObservacion = words.length
    if (this.contadorCaracteresObservacion >= this.maximoCaracteresObservacion) {
      const currentValue = words
      const newValue = currentValue.substring(0, this.maximoCaracteresObservacion)
      this.formRegistro.get('observaciones')!.setValue(newValue)
    }
  }

  public obtenerFormulario(idActoTramiteCaso: string) {
    this.subscriptions.push(
      this.tramitesGenericosService
        .obtenerActaEscaneada(idActoTramiteCaso)
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
      observaciones: resp.descripcionActaEscaneada
    })
    this.actaYaEscaneada = resp.flgActaEscaneada as boolean;
    this.actaEscaneada.setValue(this.actaYaEscaneada)

    this.tramiteService.verEditor = !this.actaYaEscaneada

    if (this.tramiteEnModoVisor && this.actaYaEscaneada) {
      this.fileSign.id = resp.nodeId
      this.fileSign.nombreOrigen = resp.nombreDocumentoOrigen
      this.obtenerDocumentoFirmado(resp.nodeId)
    }
  }

  private guardarActaEscaneada(flgActaEscaneada: boolean, descripcionActaEscaneada: string): void {
    const request = {
      idActoTramiteCaso: this.idActoTramiteCaso(),
      flgActaEscaneada: flgActaEscaneada,
      descripcionActaEscaneada: descripcionActaEscaneada
    }
    this.subscriptions.push(
      this.tramitesGenericosService.guardarActaEscaneada(request).subscribe({
        next: () => { },
        error: () =>
          this.modalDialogService.error(
            "Error",
            "Se ha producido un error al intentar guardar la información del trámite",
            "Aceptar"
          )
      })
    );

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
  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor
  }

  public icono(name: string): string {
    return icono(name);
  }

  public validMaxLength(field: string = 'dni'): void {
    validMaxLengthCustom(field, this)
  }

  protected counterReportChar(): number {
    return this.formRegistro.get('observaciones')!.value !== null
      ? this.formRegistro.get('observaciones')!.value.length
      : 0;
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado()?.nombreTramite)
  }
}
