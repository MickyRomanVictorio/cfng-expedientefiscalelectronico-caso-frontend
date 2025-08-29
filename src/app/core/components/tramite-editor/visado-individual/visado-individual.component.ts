import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SLUG_SIGN } from '@constants/mesa-unica-despacho';
import { DatosCabecera } from '@interfaces/reusables/firma-digital/datos-cabecera.interface';
import { GuardarDocumentoRequest } from '@interfaces/reusables/firma-digital/guardar-documento-request.interface';
import { DatosVisado } from '@interfaces/reusables/visado-digital/datos-visado.interface';
import { VisadoIndividualService } from '@services/generales/visado-digital/visado-individual.service';
import { BACKEND } from '@environments/environment';
import { archivoFileToB64, base64ToFile } from '@utils/file';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { FirmaDigitalClienteComponent, FirmaDigitalClienteService, FirmaInterface } from 'ngx-cfng-core-firma-digital';
import { RepositorioDocumentoService } from '@core/services/generales/repositorio-documento.service';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { PosicionFirma } from '@core/interfaces/reusables/firma-digital/posicion-firma.interface';
import { IconUtil, StringUtil, TramiteEnviadoPor } from 'dist/ngx-cfng-core-lib';
import { GenericResponse } from '@core/interfaces/comunes/GenericResponse';

@Component({
  selector: 'app-visado-individual',
  standalone: true,
  imports: [
    CmpLibModule,
    FirmaDigitalClienteComponent,
    ButtonModule,
    NgxCfngCoreModalDialogModule
  ],
  providers: [FirmaDigitalClienteService, DialogService],
  templateUrl: './visado-individual.component.html',
})
export class VisadoIndividualComponent implements OnInit, OnDestroy {

  @Input() idCaso: string = '';
  @Input() idDocumentoVersiones: string = '';
  @Input() idActoTramiteEstado: string = '';
  @Input() idActoTramiteCaso: string = '';

  public subscriptions: Subscription[] = [];
  private datosVisado!: DatosVisado;
  private datosCabecera!: DatosCabecera;
  private documentoAFirmarB64!: string;

  private nombreDocumentoCargado!: string;
  private documentoFirmado!: Blob;
  public urlDocumentoFirmado: any;
  public firmadoExitoso: boolean = false;
  private posicionFirma!: PosicionFirma;
  private pendientesPorVisar: number = 0;
  protected procesarVisado: boolean = false;
  private readonly idBandejaActoTramite!: string;
  private readonly nombreTramite: string = "";
  private readonly tramiteEnviadoPor!: TramiteEnviadoPor;

  constructor(
    private readonly visadoIndividualService: VisadoIndividualService,
    public firmaDigitalClienteService: FirmaDigitalClienteService,
    private readonly referenciaModal: DynamicDialogRef,
    protected iconUtil: IconUtil,
    protected stringUtil: StringUtil,
    private readonly spinner: NgxSpinnerService,
    private readonly sanitizer: DomSanitizer,
    public config: DynamicDialogConfig,
    private readonly repositorioDocumentoService: RepositorioDocumentoService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
    this.idCaso = this.config.data.idCaso;
    this.idDocumentoVersiones = this.config.data.idDocumentoVersiones;
    this.idActoTramiteCaso = this.config.data.idActoTramiteCaso;
    this.idBandejaActoTramite = this.config.data.idBandejaActoTramite;
    this.nombreTramite = this.config.data.noTramite;
    this.tramiteEnviadoPor = this.config.data.tramiteEnviadoPor;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  ngOnInit() {
    this.validarVisado();
    this.subscriptions.push(
      this.firmaDigitalClienteService.processSignClient.subscribe((data: any) => {
          this.procesoFirma(data);
      })
    );
  }

  private validarVisado(): void {
    this.subscriptions.push(
      this.visadoIndividualService.validarVisado( this.idBandejaActoTramite )
      .subscribe({
        next: (resp: GenericResponse) => {
          let mensaje: string = '¿Está seguro de continuar con el proceso?';
          if (resp.code == 0) mensaje = 'Esta acción generará la cabecera del documento, el cual contiene: distrito geográfico, la fecha de emisión, tipo de documento y número de documento ¿Desea continuar?';
          this.modalConfirmacionPrimerVisado( mensaje )
        },
        error: (error) => {
          this.modalErrorProceso(error.error.message);
        },
      })
    );
  }

  private visarTramite(): void {
    this.procesarVisado = true;
    this.obtenerDatosFirma();
  }

  private modalConfirmacionPrimerVisado(mensaje: string): void {
    const primervisado = this.modalDialogService.warning('Visar trámite',
      mensaje,
      'Confirmar',
      true,
      'Cancelar')
    primervisado.subscribe({
       next: (resp: CfeDialogRespuesta) => {
         if (resp === CfeDialogRespuesta.Confirmado) this.visarTramite();
         else this.cerrarModal();
       },
     });
  }

  private ejecutarVisado(): void {
    setTimeout(()=>{ this.spinner.show(); },0)
    const requestVisado: FirmaInterface = {
      id: this.nombreDocumentoCargado,
      firma_url: `${BACKEND.FIRMA_CLIENTE}`,
      repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
      rol: this.datosVisado.cargoFirmador,
      motivo: this.datosVisado.motivoFirma,
      param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
      extension: 'pdf',
      posicionX: this.posicionFirma.posicionX,
      posicionY: this.posicionFirma.posicionY,
      pagina: this.posicionFirma.pagina,
      estiloFirma: 2,
      posicionVisible: this.posicionFirma.firmaManual
    };
    this.firmaDigitalClienteService.sendDataSign.emit(requestVisado);
  }

  private obtenerDatosFirma(): void {
      this.subscriptions.push(
        this.visadoIndividualService.obtenerDatosVisado()
        .subscribe({
          next: (resp) => {
            this.datosVisado = resp;
            this.obtenerDocumentoAFirmar(this.idDocumentoVersiones);
          },
          error: (error) => {
            this.modalErrorProceso('Sucedió un error en el proceso, por favor intente nuevamente');
          },
        })
      );
  }

  private obtenerDocumentoAFirmar(idDocumentoVersiones: string): void {
      this.subscriptions.push(
        this.visadoIndividualService.obtenerDocumentoVisar(idDocumentoVersiones)
          .subscribe({
            next: (resp) => {
              this.documentoAFirmarB64 = resp.archivo;
              this.datosCabecera = resp.datosCabecera;
              this.posicionFirma = resp.posicionFirma;
              this.cargarDocumentoRepositorio();
            },
            error: (error) => {
              this.modalErrorProceso('Sucedió un error en el proceso, por favor intente nuevamente');
            },
          })
      );
  }

  private modalErrorProceso(mensaje: string): void {
    this.modalDialogService.error('Error en el proceso', mensaje, 'Aceptar');
    this.cerrarModal();
  }

  private cargarDocumentoRepositorio(): void {
      const formData = new FormData();
      formData.append(
        'file',
        base64ToFile(this.documentoAFirmarB64)!,
        this.datosCabecera.nombreDocumentoFichero + '.pdf'
      );
      this.subscriptions.push(
        this.repositorioDocumentoService.guardarDocumentoRepositorio(formData)
          .subscribe({
            next: (resp) => {
              this.nombreDocumentoCargado = resp.data.nodeId;
              this.ejecutarVisado();
            },
            error: (error) => {
              this.modalErrorProceso('Sucedió un error en el proceso, por favor intente nuevamente');
            },
          })
      );
  }


  async procesoFirma(realizado: string): Promise<void> {
    this.spinner.show()
    if (realizado === '0') {
      await this.obtenerDocumentoFirmado();
      const file = new File(
        [this.documentoFirmado],
        this.datosCabecera.nombreDocumentoFichero + '.pdf',
        { type: 'application/pdf' }
      );

      const request: GuardarDocumentoRequest = {
        idBandejaActoTramite: this.idBandejaActoTramite,
        idCaso: this.idCaso,
        idActoTramiteEstado: this.idActoTramiteEstado,
        idActoTramiteCaso: this.idActoTramiteCaso,
        datosCabecera: this.datosCabecera,
        archivo: await archivoFileToB64(file),
        posicionFirma: this.posicionFirma
      };

      await this.guardarDocumento(request);
      this.firmadoExitoso = true;
      this.cerrarModal();
      this.alertaDocumentoFirmado();
    }
    if (realizado === '1') {
      this.firmadoExitoso = false;
      alert(SLUG_SIGN.CANCEL);
      this.cerrarModal();
    }
  }

  private alertaDocumentoFirmado() {
    let seEnvioA: string = '.';
    if ( this.pendientesPorVisar == 0 ) {
      seEnvioA = ` y se envió a ${this.tramiteEnviadoPor.dePerfil} ${this.tramiteEnviadoPor.nombreCompleto}`;
    }
    this.modalDialogService.success('PROCESO CORRECTO',
      `Se visó correctamente <strong>${this.stringUtil.capitalizedFirstWord(this.nombreTramite)}</strong>${seEnvioA}`,
      'Aceptar')
  }

  private async obtenerDocumentoFirmado() {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
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
              console.log(error);
            },
          })
      );
    });
  }

  private async guardarDocumento(request: GuardarDocumentoRequest) {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.subscriptions.push(
        this.visadoIndividualService.guardarDocumentoVisado(request).subscribe({
          next: (resp: GenericResponse) => {
            this.pendientesPorVisar = resp.code;
             resolve();
          },
          error: (error) => {
            this.modalErrorProceso('Sucedió un error en el proceso, por favor intente nuevamente');
          },
        })
      );
    });
  }

  protected cerrarModal(): void {
    this.referenciaModal.close({code: this.firmadoExitoso, urlDocumentoFirmado: this.urlDocumentoFirmado});
  }
}
