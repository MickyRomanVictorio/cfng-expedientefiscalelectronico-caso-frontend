import { HttpStatusCode } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { VisadoIndividualComponent } from '@components/tramite-editor/visado-individual/visado-individual.component';
import { ErrorValidacionNegocio } from '@core/interfaces/comunes/error-validacion-negocio.interface';
import { DatosCabecera } from '@core/interfaces/reusables/firma-digital/datos-cabecera.interface';
import { DatosFirma } from '@core/interfaces/reusables/firma-digital/datos-firma.interface';
import { FirmaIndividualCompartido } from '@core/interfaces/reusables/firma-digital/firma-individual-compartido.interface';
import { GuardarDocumentoRequest } from '@core/interfaces/reusables/firma-digital/guardar-documento-request.interface';
import { MensajeFirma } from '@core/interfaces/reusables/firma-digital/mensaje-firma.interface';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { RepositorioDocumentoService } from '@core/services/generales/repositorio-documento.service';
import { BandejaTramitesSharedService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites-shared.service';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { ReusableEditarTramiteService } from '@core/services/reusables/reusable-editar-tramite.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { VisorEfeService } from '@core/services/visor/visor.service';
import { Expediente } from '@core/utils/expediente';
import { archivoFileToB64, base64ToFile } from '@core/utils/file';
import { obtenerIcono } from '@core/utils/icon';
import { BACKEND, DOMAIN_FRONT_NOTIFICADOR } from '@environments/environment';
import { AlertaData } from '@interfaces/comunes/alert';
import { Observaciones } from '@interfaces/reusables/asunto-observaciones/observaciones.interface';
import { DetalleFirma } from '@interfaces/reusables/detalle-firma/detalle-firma.interface';
import BandejaTramitesComponent from '@modules/provincial/bandeja-tramites/bandeja-tramites.component';
import { BandejaTramitesService } from '@services/provincial/bandeja-tramites/bandeja-tramites.service';
import { TokenService } from '@services/shared/token.service';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import {
  FirmaDigitalClienteComponent,
  FirmaDigitalClienteService,
  FirmaInterface,
} from 'ngx-cfng-core-firma-digital';
import {
  BANDEJA_ESTADO,
  CARGO,
  IconAsset,
  IconUtil,
  SLUG_SIGN,
  StringUtil,
  TRAMITE_TIPO_DOCUMENTO,
} from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { firstValueFrom, Subscription } from 'rxjs';
import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
import { ModalVerDetalleFirmasComponent } from '../modal-ver-detalle-firmas/modal-ver-detalle-firmas.component';

enum ESTADO_TRAMITE {
  FIRMADO = 946,
}

@Component({
  standalone: true,
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
  imports: [
    CmpLibModule,
    SharedModule,
    TableModule,
    ButtonModule,
    NgxCfngCoreModalDialogModule,
    FirmaDigitalClienteComponent,
  ],
  styles: [
    `
      .btn-pendiente {
        background-color: var(--blue-500);
      }
    `,
  ],
  providers: [BandejaTramitesComponent, NgxCfngCoreModalDialogService, FirmaDigitalClienteService],
})
export class PreviewModalComponent {
  public readonly subscriptions: Subscription[] = [];
  public observaciones: Observaciones[] = [];
  public detalles: DetalleFirma[] = [];
  public urlDocumentoFirmado: any;
  protected BANDEJA_ESTADO = BANDEJA_ESTADO;
  protected documentoRuta: SafeResourceUrl | null | string = '';
  protected datos: any;
  protected errorValidacion!: ErrorValidacionNegocio | null;
  protected obtenerIcono = obtenerIcono;
  protected idBandejaEstado: number = 0;
  protected esBandejaTramite: boolean = false;
  private validoEditar: boolean = false;
  private readonly textoNoSePuedeEditar: string =
    'NO SE PUEDE EDITAR EL TRÁMITE';
  private tramiteVisado: boolean = false;
  /**/
  protected mostrarBtnVisar: boolean = false;
  protected mostrarBtnFirmar: boolean = false;

  /**/
  private casoFiscal!: Expediente;
  private datosFirma!: DatosFirma;
  private documentoAFirmarB64!: string;
  private datosCabecera!: DatosCabecera;
  private nombreDocumentoCargado!: string;
  private documentoFirmado!: Blob;
  private idActoTramiteEstado: string | null = null;
  private idActoTramiteCaso: string | null = null;
  private mensajeFirma!: MensajeFirma;
  public firmadoExitoso: boolean = false;
  private compartido!: FirmaIndividualCompartido;

  public desdeNuevo: boolean = false;
  public desdePendientesRevisar: boolean = false;

  constructor(
    public firmaDigitalClienteService: FirmaDigitalClienteService,
    public sanitizer: DomSanitizer,
    protected iconAsset: IconAsset,
    protected referenciaModal: DynamicDialogRef,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    private readonly dialogService: DialogService,
    private readonly tokenService: TokenService,
    private readonly dataService: VisorEfeService,
    private readonly bandejaTramitesSharedService: BandejaTramitesSharedService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly editarTramiteService: ReusableEditarTramiteService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly bandejaTramitesService: BandejaTramitesService,
    protected readonly config: DynamicDialogConfig,
    private readonly casoService: Casos,
    private readonly firmaIndividualService: FirmaIndividualService,
    private readonly repositorioDocumentoService: RepositorioDocumentoService,
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService
  ) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  ngOnInit() {
    const { usuario } = this.tokenService.getDecoded();
    this.subscriptions.push(
      this.firmaDigitalClienteService.processSignClient.subscribe(
        (data: any) => {
          this.procesoFirma(data);
        }
      )
    );

    if (
      this.config.data.tramite.coCaso !== null &&
      this.config.data.tramite.coCaso !== undefined
    ) {
      this.esBandejaTramite = true;
    } else {
      this.esBandejaTramite = false;
    }

    this.desdeNuevo = this.config.data?.desdeNuevo ?? false;
    this.desdePendientesRevisar = this.config.data?.desdePendientesRevisar ?? false;
    
    this.subscriptions.push(
      this.bandejaTramitesSharedService.idBandejaEstado$.subscribe((index) => {
        this.idBandejaEstado = index;
        this.evaluarMostrarBtnFirmar();
        this.evaluarMostrarBtnVisar();
      })
    );
    this.obtenerDatosGenerales();
  }

  private previsualizarTramitePDF(
    idNode: string,
    nombreDocumento: string
  ): void {
    // validar si el documento es pdf
    if (this.esPdf(nombreDocumento)) {
      this.setDocumentRoute(
        this.dataService.getArchivoUrl(idNode, nombreDocumento)
      );
    } else {
      // Obtener el documento si no es pdf
      this.obtenerDocumentoAPrevisualizar(idNode, nombreDocumento);
    }
  }

  private obtenerDocumentoAPrevisualizar(
    idNode: string,
    nombreDocumento: string
  ): void {
    this.subscriptions.push(
      this.bandejaTramitesService
        .previsualizarTramitePDF(idNode, nombreDocumento)
        .subscribe({
          next: (response) => {
            this.setDocumentRoute(
              this.createBlobUrl(response, 'application/pdf')
            );
          },
          error: (error) => {
            this.documentoRuta = null;
          },
        }));
  }

  private setDocumentRoute(url: string): void {
    this.documentoRuta = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private createBlobUrl(data: BlobPart, type: string): string {
    const blob = new Blob([data], { type });
    return URL.createObjectURL(blob);
  }

  private esPdf(filename: string): boolean {
    return /\.pdf$/i.test(filename);
  }

  private obtenerDatosGenerales(): void {
    this.subscriptions.push(
      this.bandejaTramitesService
        .obtenerDatosPrevisualizarVersion(this.config.data.tramite.idDocumentoVersiones)
        .subscribe({
          next: (resp) => {
            this.datos = resp.data;
            if (!this.isEmpty(this.datos.idNode)) {
              this.previsualizarTramitePDF(
                this.datos.idNode,
                this.datos.nombreDocumento
              );
            } else {
              this.documentoRuta = null;
            }
          },
          error: () => { },
        }));
  }

  protected get mostrarBtnFirmarOld(): boolean {
    if (!this.esBandejaTramite) {
      return false;
    }

    const { idTipoDocumento, tramiteCreadoPor } = this.config.data.tramite;
    const { usuario } = this.tokenService.getDecoded();
    const { codCargo, usuario: currentUser } = usuario;

    if (
      (
        [
          BANDEJA_ESTADO.TRAMITES_ENVIADOS_REVISAR,
          BANDEJA_ESTADO.TRAMITES_ENVIADOS_VISAR,
          BANDEJA_ESTADO.TRAMITES_PENDIENTES_VISAR,
          BANDEJA_ESTADO.TRAMITES_FIRMADOS,
        ] as number[]
      ).includes(this.idBandejaEstado)
    ) {
      return false;
    }

    if (idTipoDocumento === TRAMITE_TIPO_DOCUMENTO.RESPUESTA_OFICIO) {
      return false;
    }

    if (
      codCargo === CARGO.FISCAL_PROVINCIAL &&
      !this.config.data.tramite.flgSinDataCompleta
    ) {
      return true;
    }

    if (
      codCargo === CARGO.FISCAL_ADJUNTO_PROVINCIAL &&
      [
        TRAMITE_TIPO_DOCUMENTO.PROVIDENCIA,
        TRAMITE_TIPO_DOCUMENTO.ACTA,
        TRAMITE_TIPO_DOCUMENTO.RAZON,
      ].includes(idTipoDocumento) &&
      !this.config.data.tramite.flgSinDataCompleta
    ) {
      return true;
    }

    if (
      [CARGO.ASISTENTE_FUNCION_FISCAL, CARGO.ASISTENTE_ADMINISTRATIVO].includes(
        codCargo
      ) &&
      idTipoDocumento === TRAMITE_TIPO_DOCUMENTO.RAZON &&
      currentUser === tramiteCreadoPor.coUsername &&
      !this.config.data.tramite.flgSinDataCompleta
    ) {
      return true;
    }

    return false;
  }

  protected evaluarMostrarBtnVisar(): void {
    this.mostrarBtnVisar =
      this.esBandejaTramite &&
      this.idBandejaEstado === this.BANDEJA_ESTADO.TRAMITES_PENDIENTES_VISAR &&
      !this.tramiteVisado;
  }

  protected evaluarMostrarBtnFirmar(): void {
    const { idTipoDocumento, tramiteCreadoPor, flgSinDataCompleta } =
      this.config.data.tramite;
    const { usuario } = this.tokenService.getDecoded();
    const { codCargo, usuario: currentUser } = usuario;

    // Exit early if not in the correct bandeja
    if (!this.esBandejaTramite) return;

    // Exit early if in non-signable bandejas
    if (
      (
        [
          BANDEJA_ESTADO.TRAMITES_ENVIADOS_REVISAR,
          BANDEJA_ESTADO.TRAMITES_ENVIADOS_VISAR,
          BANDEJA_ESTADO.TRAMITES_PENDIENTES_VISAR,
          BANDEJA_ESTADO.TRAMITES_FIRMADOS,
        ] as number[]
      ).includes(this.idBandejaEstado)
    )
      return;

    // Exit early if the document type is RESPUESTA_OFICIO
    if (idTipoDocumento === TRAMITE_TIPO_DOCUMENTO.RESPUESTA_OFICIO) return;

    // Determine if the button should be shown based on user role and conditions
    const isFiscalProvincial =
      codCargo === CARGO.FISCAL_PROVINCIAL && !flgSinDataCompleta;
    const isFiscalAdjuntoProvincial =
      codCargo === CARGO.FISCAL_ADJUNTO_PROVINCIAL &&
      [
        TRAMITE_TIPO_DOCUMENTO.PROVIDENCIA,
        TRAMITE_TIPO_DOCUMENTO.ACTA,
        TRAMITE_TIPO_DOCUMENTO.RAZON,
      ].includes(idTipoDocumento) &&
      !flgSinDataCompleta;
    const isAsistente =
      [CARGO.ASISTENTE_FUNCION_FISCAL, CARGO.ASISTENTE_ADMINISTRATIVO].includes(
        codCargo
      ) &&
      idTipoDocumento === TRAMITE_TIPO_DOCUMENTO.RAZON &&
      currentUser === tramiteCreadoPor.coUsername &&
      !flgSinDataCompleta;

    // Set mostrarBtnFirmar if any of the conditions are met
    if (isFiscalProvincial || isFiscalAdjuntoProvincial || isAsistente) {
      this.mostrarBtnFirmar = true;
    }
  }

  protected get validarBtnFirmar(): boolean {
    const { usuario } = this.tokenService.getDecoded();
    return (
        //this.mostrarBtnFirmar &&
        this.esBandejaTramite && (this.desdePendientesRevisar || this.desdeNuevo) &&
       (this.datos?.coUsernameCreacion === usuario?.usuario || this.datos?.coUsernameDestino === usuario?.usuario)
      && this.datos?.permiteFirma === '1');
  }

  protected get mostrarBtnVisarOld(): boolean {
    if (!this.esBandejaTramite) {
      return false;
    }

    return (
      this.idBandejaEstado === this.BANDEJA_ESTADO.TRAMITES_PENDIENTES_VISAR &&
      !this.tramiteVisado
    );
  }

  protected get esBandejaFirmados(): boolean {
    return this.esBandejaTramite
      ? this.idBandejaEstado === BANDEJA_ESTADO.TRAMITES_FIRMADOS
      : this.datos?.idEstadoRegistro === ESTADO_TRAMITE.FIRMADO;
  }

  public procesarVisado() {
    const ref = this.dialogService.open(VisadoIndividualComponent, {
      showHeader: false,
      width: '500px',
      data: {
        idCaso: this.config.data.tramite.idCaso,
        idDocumentoVersiones: this.config.data.tramite.idDocumentoVersiones,
        idActoTramiteEstado: this.config.data.tramite.idActoTramiteEstado,
        idActoTramiteCaso: this.config.data.tramite.idActoTramiteCaso,
        idBandejaActoTramite: this.config.data.tramite.idBandejaActoTramite,
        noTramite: this.config.data.tramite.noTramite,
        tramiteEnviadoPor: this.config.data.tramite.tramiteEnviadoPor,
      },
    });

    ref.onClose.subscribe({
      next: (resp) => {
        if (resp.code) {
          this.documentoRuta = null;
          this.documentoRuta = resp.urlDocumentoFirmado;
          this.tramiteVisado = resp.code;

          this.evaluarMostrarBtnFirmar();
          this.evaluarMostrarBtnVisar();
        }
      },
    });
  }
  protected eventoCerrarModal() {
    this.referenciaModal.close();
  }

  protected async editarTramite() {
    const idActoTramiteCaso: string = this.config.data.tramite.idActoTramiteCaso;
    await this.validarCondiciones(idActoTramiteCaso);
    if (this.validoEditar) {
      const cfeDialog = this.modalDialogService.warning(
        'EDITAR DOCUMENTO FIRMADO',
        'Esta acción invalida todas las firmas actuales y elimina todas las consecuencias realizadas después de haber firmado. Luego podrá volver a firmar el documento nuevamente. ¿Desea continuar?',
        'Continuar',
        true,
        'Cancelar'
      );
      cfeDialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.editarTramiteFirmado(idActoTramiteCaso);
          }
        },
      });
    } else {
      this.informarQueNoSePuedeEditar();
    }
  }

  private async validarCondiciones(idActoTramiteCaso: string) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.editarTramiteService
          .validarCondiciones(idActoTramiteCaso)
          .subscribe({
            next: () => {
              this.validoEditar = true;
              resolve();
            },
            error: (error) => {
              if (error.status == HttpStatusCode.UnprocessableEntity) {
                this.errorValidacion = error.error;
              } else {
                this.errorValidacion = null;
              }
              this.informarQueNoSePuedeEditar();
            },
          })
      );
    });
  }

  private editarTramiteFirmado(idActoTramiteCaso: string): void {
    this.subscriptions.push(
      this.editarTramiteService
        .editarTramiteFirmado(idActoTramiteCaso)
        .subscribe({
          next: () => {
            this.gestionCasoService.obtenerCasoFiscal(this.config.data.tramite.idCaso);
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR AL INTENTAR EDITAR DOCUMENTO FIRMADO',
              'Ha ocurrido un error inesperado al intentar editar el documento firmado',
              'Aceptar'
            );
          },
        })
    );
  }

  private informarQueNoSePuedeEditar(): void {
    const mensaje: string = this.errorValidacion!.message;
    if (mensaje.includes('se encuentra en proceso de notificación')) {
      const cfeDialog = this.modalDialogService.warning(
        this.textoNoSePuedeEditar,
        mensaje,
        'Ir al generador',
        true,
        'Cancelar'
      );
      cfeDialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            const token = this.tokenService.getWithoutBearer();
            window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&idAplication=1`;
          }
        },
      });
      return;
    }
    this.modalDialogService.warning(
      this.textoNoSePuedeEditar,
      mensaje,
      'Aceptar'
    );
  }

  protected verDetalleFirmasModal(): void {
    this.dialogService.open(ModalVerDetalleFirmasComponent, {
      width: '70%',
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        idDocumento: this.config.data.tramite.idDocumentoVersiones,
      },
    });
  }

  private isEmpty(value: any): boolean {
    return (
      value == null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  }

  /**/
  protected iniciarFirma() {
    let mensaje: MensajeFirma = {
      titulo: 'FIRMAR',
      descripcion: '¿Está seguro de firmar el documento?',
    };
    const confirmar = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: mensaje.titulo,
        description: mensaje.descripcion,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    confirmar.onClose.subscribe((respuesta: string) => {
      if (respuesta === 'confirm') {
        this.firmarTramite();
      }
    });
  }

  private async firmarTramite(): Promise<void> {
    this.casoFiscal = await firstValueFrom(
      this.casoService.obtenerCasoFiscal(this.config.data.tramite.idCaso)
    );
    this.idActoTramiteEstado = this.casoFiscal.idActoTramiteEstado!;
    this.idActoTramiteCaso = this.casoFiscal.idActoTramiteCasoUltimo!;
    await this.obtenerDatosFirma(); 
    await this.obtenerDocumentoAFirmar(this.config.data.tramite.idDocumentoVersiones);
    await this.cargarDocumentoRepositorio();
    let body: FirmaInterface = {
      id: this.nombreDocumentoCargado,
      firma_url: `${BACKEND.FIRMA_CLIENTE}`,
      repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
      rol: this.datosFirma.cargoFirmador,
      motivo: this.datosFirma.motivoFirma,
      param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
      extension: 'pdf',
      posicionX: null,
      posicionY: null,
    };
    console.log('FirmaInterface ', body);
    setTimeout(() => this.spinner.show(), 0);
    this.firmaDigitalClienteService.sendDataSign.emit(body);
  }

  // private obtenerCasoFiscal(idCaso: String): Observable<Expediente> {
  //   return this.casoService
  //     .obtenerCasoFiscal(idCaso)
  //     .subscribe((response: Expediente) => {
  //       this.casoFiscal = response;
  //     });
  // }

  private async obtenerDatosFirma() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.firmaIndividualService.obtenerDatosFirma().subscribe({
          next: (resp) => {
            this.datosFirma = resp;
            resolve();
          },
          error: (error) => {
            this.spinner.hide();
          },
        })
      );
    });
  }

  private async obtenerDocumentoAFirmar(idDocumentoVersiones: string) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.firmaIndividualService
          .obtenerDocumentoAFirmar(idDocumentoVersiones)
          .subscribe({
            next: (resp) => {
              this.documentoAFirmarB64 = resp.archivo;
              this.datosCabecera = resp.datosCabecera;
              resolve();
            },
            error: (error) => {
              this.spinner.hide();
            },
          })
      );
    });
  }

  private async cargarDocumentoRepositorio() {
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      formData.append(
        'file',
        base64ToFile(this.documentoAFirmarB64)!,
        this.datosCabecera.nombreDocumentoFichero + '.pdf'
      );
      this.subscriptions.push(
        this.repositorioDocumentoService
          .guardarDocumentoRepositorio(formData)
          .subscribe({
            next: (resp) => {
              this.nombreDocumentoCargado = resp.data.nodeId;
              resolve();
            },
            error: (error) => {
              this.spinner.hide();
            },
          })
      );
    });
  }

  private async procesoFirma(realizado: string): Promise<void> {
    if (realizado === '0') {
      await this.spinner.show();
      await this.obtenerDocumentoFirmado();
      /**const file = new File(
        [this.documentoFirmado],
        this.datosCabecera.nombreDocumentoFichero + '.pdf',
        { type: 'application/pdf' }
      );**/
      const request: GuardarDocumentoRequest = {
        idCaso: this.config.data.tramite.idCaso,
        idActoTramiteEstado: this.idActoTramiteEstado!,
        idActoTramiteCaso: this.idActoTramiteCaso!,
        datosCabecera: this.datosCabecera,
        /**archivo: await archivoFileToB64(file),**/
        archivo: this.nombreDocumentoCargado,
      };
      await this.guardarDocumento(request);
      this.firmadoExitoso = true;
      this.gestionCasoService.obtenerCasoFiscal(this.config.data.tramite.idCaso);
      this.alertaDocumentoFirmado(this.mensajeFirma);
      await this.spinner.hide();
    }
    if (realizado === '1') {
      this.firmadoExitoso = false;
      await this.spinner.hide();
      alert(SLUG_SIGN.CANCEL);
    }
  }

  private async obtenerDocumentoFirmado() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.repositorioDocumentoService
          .verDocumentorepositorio(this.nombreDocumentoCargado)
          .subscribe({
            next: (resp) => {
              this.documentoFirmado = new Blob([resp], {
                type: 'application/pdf',
              });
              this.urlDocumentoFirmado =
                this.sanitizer.bypassSecurityTrustResourceUrl(
                  URL.createObjectURL(this.documentoFirmado)
                );
              resolve();
            },
            error: (error) => {
              this.spinner.hide();
            },
          })
      );
    });
  }

  private async guardarDocumento(request: GuardarDocumentoRequest) {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.firmaIndividualService.guardarDocumento(request).subscribe({
          next: (resp) => {
            this.compartido = {
              ...this.compartido,
              idMovimiento: resp.idMovimiento,
              idDocumentoVersiones: resp.idDocumentoVersiones,
              idDocumentoFirmante: resp.idDocumentoFirmante,
            };
            this.mensajeFirma = resp.mensajeFirma;
            resolve();
          },
          error: (error) => {
            this.dialogService.open(AlertaModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'error',
                title: `FIRMA NO REALIZADA`,
                description: 'No se realizó el proceso de firma.',
                confirmButtonText: 'Aceptar',
              },
            } as DynamicDialogConfig<AlertaData>);
            this.spinner.hide();
          },
        })
      );
    });
  }

  private alertaDocumentoFirmado(mensajeFirma: MensajeFirma) {
    const mostrarBotonCancelar =
      mensajeFirma.mostrarBotonCancelar!.trim() === '1';
    // this.referenciaModal
    let referencia = this.dialogService.open(AlertaModalComponent, {
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
        confirm: mostrarBotonCancelar,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.compartido = {
      ...this.compartido,
      esFirmado: this.firmadoExitoso,
      documento: this.documentoFirmado,
    };
    this.firmaIndividualService.notificarEsFirmado(this.compartido);

    referencia.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm' || resp === 'closedAction') {
          this.eventoCerrarModal();
          this.router.navigate([`app/bandeja-tramites/firmados`]).then(() => {
            window.location.reload();
          });
        }
      },
    });
  }
}
