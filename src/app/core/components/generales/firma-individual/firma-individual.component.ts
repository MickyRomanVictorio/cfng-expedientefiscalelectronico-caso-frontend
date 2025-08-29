import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {TRAMITES} from 'ngx-cfng-core-lib';
import {SLUG_SIGN} from '@constants/mesa-unica-despacho';
import {DatosCabecera} from '@interfaces/reusables/firma-digital/datos-cabecera.interface';
import { DatosFirma } from '@interfaces/reusables/firma-digital/datos-firma.interface';
import {FirmaIndividualCompartido} from '@interfaces/reusables/firma-digital/firma-individual-compartido.interface';
import {GuardarDocumentoRequest} from '@interfaces/reusables/firma-digital/guardar-documento-request.interface';
import {GestionCasoService} from '@services/shared/gestion-caso.service';
import {BACKEND} from '@environments/environment';
import {AlertaData} from '@interfaces/comunes/alert';
import {MensajeFirma} from '@interfaces/reusables/firma-digital/mensaje-firma.interface';
import {FirmaIndividualService} from '@services/firma-digital/firma-individual.service';
import {AlertaModalComponent} from '@components/modals/alerta-modal/alerta-modal.component';
import {base64ToFile} from '@utils/file';
import {obtenerIcono} from '@utils/icon';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import { ESTADO_REGISTRO } from 'ngx-cfng-core-lib';
import {NgxSpinnerService} from 'ngx-spinner';
import {DialogService, DynamicDialogConfig, DynamicDialogRef,} from 'primeng/dynamicdialog';
import { catchError, concatMap, delay, EMPTY, Observable, of, Subscription } from 'rxjs';
import {FirmaDigitalClienteComponent, FirmaDigitalClienteService, FirmaInterface} from 'ngx-cfng-core-firma-digital';
import {RepositorioDocumentoService} from '@core/services/generales/repositorio-documento.service';
import { Expediente } from '@core/utils/expediente';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { SkeletonModule } from 'primeng/skeleton';
import { tap } from 'rxjs/operators';
import { TooltipModule } from 'primeng/tooltip';
import { ElevacionActuadosService } from '@core/services/provincial/tramites/comun/calificacion/elevacion-actuados/elevacion-actuados.service';
import { ContiendaCompetenciaService } from '@core/services/provincial/tramites/comun/calificacion/contienda-competencia/contienda-competencia.service';
import { TERMINACION_ANTICIPADA } from '@core/types/efe/provincial/tramites/comun/preparatoria/terminacion-anticipada.type';
import { GestionarDerivacionService } from '@core/services/provincial/tramites/comun/calificacion/gestionar-derivacion/gestionar-derivacion.service';

@Component({
  selector: 'app-firma-individual',
  standalone: true,
  imports: [CmpLibModule, FirmaDigitalClienteComponent, SkeletonModule, TooltipModule],
  providers: [DialogService, FirmaDigitalClienteService],
  templateUrl: './firma-individual.component.html',
})
export class FirmaIndividualComponent implements OnInit, OnDestroy {

  @Input() idTramite: string = '';
  @Input() idDocumentoVersiones: string = '';

  private casoFiscal!: Expediente;
  private idCaso: string | null = null;
  private idActoTramiteEstado: string | null = null;
  private idActoTramiteCaso: string | null = null;
  public subscriptions: Subscription[] = [];
  private datosFirma!: DatosFirma;
  private datosCabecera!: DatosCabecera;
  private documentoAFirmarB64!: string;
  private nombreDocumentoCargado!: string;
  private documentoFirmado!: Blob;
  public urlDocumentoFirmado: any; //TODO: Evaluar eliminar
  private mensajeFirma!: MensajeFirma;
  public firmadoExitoso: boolean = false;
  public puedeFirmar: boolean = false;
  private compartido!: FirmaIndividualCompartido;
  public referenciaModal!: DynamicDialogRef;
  private firmarTiempo: any = null;
  DISPOSICION_CONTIENDA_COMPETENCIA: string = '000030';
  DISPOSICION_DERIVACION_INTERNA: string = '000042'
  DISPOSICION_DERIVACION_EXTERNA: string = '000043'

  constructor(
    private readonly firmaIndividualService: FirmaIndividualService,
    private readonly tramiteService: TramiteService,
    public readonly firmaDigitalClienteService: FirmaDigitalClienteService,
    private readonly dialogService: DialogService,
    private readonly spinner: NgxSpinnerService,
    private readonly sanitizer: DomSanitizer,
    private readonly router: Router,
    private readonly gestionCasoService: GestionCasoService,
    private readonly repositorioDocumentoService: RepositorioDocumentoService,
    private readonly elevacionActuadosService: ElevacionActuadosService,
    private readonly contiendaCompetenciaService: ContiendaCompetenciaService,
    private readonly gestionarDerivacion: GestionarDerivacionService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  ngOnInit() {
    this.cargarPermisosFirmar();
    this.subscriptions.push(
      this.firmaDigitalClienteService.processSignClient.subscribe(
        async (data: any) => {
          await this.procesoFirma(data);
        }
      )
    );
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  public assetIcon(icon: string): string {
    return `assets/icons/${icon}.svg`;
  }

  get habilitarFirmar(): boolean {
    return this.tramiteService.habilitarFirmar && this.puedeFirmar;
  }

  protected cargarPermisosFirmar(): void {
    this.subscriptions.push(
      this.firmaIndividualService.obtenerConfiguracionFirma(this.idDocumentoVersiones).subscribe({
        next: (resp) => {
          this.puedeFirmar = resp.puedeFirmmar;
        }
      })
    );
  }

  public preValidacionFirma(): void {
    this.firmaIndividualService.ejecutarValidacion().subscribe({
      next: async (confirmar) => {
        if (confirmar) {
          await this.iniciarFirma();
        }
      }
    })
  }

  async iniciarFirma() {
    if (
      TRAMITES.DISPOSICION_ELEVACION_ACTUADOS === this.idTramite ||
      TRAMITES.DISPOSICION_DESACUMULACION === this.idTramite ||
      TRAMITES.DISPOSICION_ACUMULACION === this.idTramite ||
      TRAMITES.DISPOSICION_DERIVACION_INTERNA === this.idTramite ||
      TRAMITES.DISPOSICION_DERIVACION_EXTERNA === this.idTramite ||
      TRAMITES.DISPOSICION_DERIVACION_JUZGADO_PAZ_LETRADO === this.idTramite ||
      TRAMITES.REQUERIMIENTO_INCOACION === this.idTramite ||
      TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_ACUERDO === this.idTramite ||
      TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_NO_ACUERDO === this.idTramite ||
      this.DISPOSICION_CONTIENDA_COMPETENCIA === this.idTramite ||
      this.DISPOSICION_DERIVACION_INTERNA === this.idTramite
    ) {
      let mensaje: MensajeFirma = this.obtenerMensaje();
      const confirmar = this.dialogService.open(AlertaModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: mensaje.icono ?? 'warning',
          title: mensaje.titulo,
          description: mensaje.descripcion,
          confirmButtonText: mensaje.textoBotonConfirmar ?? 'Aceptar',
          cancelButtonText: mensaje.textoBotonCancelar ?? 'Cancelar',
          confirm: true,
        },
      } as DynamicDialogConfig<AlertaData>);

      confirmar.onClose.subscribe(async (respuesta: string) => {
        if (respuesta === 'confirm') {
          await this.preFirmar();
        }
        else if (respuesta === 'cancel') {
          await this.firmaMultipleDenegada()
        }
      });
    } else {
      await this.preFirmar();
    }
  }

  private obtenerMensaje(): MensajeFirma {
    let mensaje!: MensajeFirma;
    if (TRAMITES.DISPOSICION_ELEVACION_ACTUADOS === this.idTramite) {
      this.elevacionActuadosService.getData$().subscribe(valor => {
        const descripcionExtra = valor ? ` a la <b>${valor}</b>` : '';
        mensaje = {
          titulo: 'ELEVAR CASO A FISCAL SUPERIOR',
          descripcion: `Esta acción realiza la elevación del caso${descripcionExtra}. Por favor no olvide que al elevar el caso éste pasará a modo lectura y no podrá acceder a él hasta que le sea devuelto, después no podrá revertir el cambio ¿Está seguro de realizar este trámite?`,
        };
      });
    } else if (TRAMITES.DISPOSICION_DESACUMULACION === this.idTramite) {
      mensaje = {
        titulo: 'DESACUMULAR CASO',
        descripcion:
          `Esta acción realiza la desacumulación del caso ${this.gestionCasoService.casoActual.numeroCaso}, después no podrá revertir el cambio ¿Está seguro de realizar esta acción?.`,
      };
    } else if (TRAMITES.DISPOSICION_ACUMULACION === this.idTramite) {
      mensaje = {
        titulo: 'CONFIRMAR ASOCIACIÓN',
        descripcion:
          '¿Está seguro que desea acumular el caso? Esta acción solo se podrá revertir con una desacumulación.',
      };
    } else if (
      TRAMITES.DISPOSICION_DERIVACION_JUZGADO_PAZ_LETRADO === this.idTramite
    ) {
      mensaje = {
        titulo: 'DERIVACIÓN A JPL',
        descripcion:
          'A continuación, se procederá a crear el trámite de Disposición de derivación a JPL. ¿Está seguro de realizar la siguiente acción?.',
      };
    }else if (
      TRAMITES.REQUERIMIENTO_INCOACION === this.idTramite
    ) {
      mensaje = {
        titulo: 'El caso cambiará de naturaleza',
        descripcion:
          'Al firmar el Requerimiento de incoación a proceso inmediato se cambiará la naturaleza del proceso a “especial”, desea continuar?',
      };
    }else if (
      this.DISPOSICION_CONTIENDA_COMPETENCIA === this.idTramite
    ) {
      this.contiendaCompetenciaService.notificarMensajeAdvertenciaObservable.subscribe(valor => {
        const descripcionExtra = valor ? ` a la <b>${valor}</b>` : ''
        mensaje = {
          titulo: 'ELEVAR CASO POR CONTIENDA',
          descripcion:
            `Esta acción realizará la elevación del caso ${ descripcionExtra }. ¿Está seguro de continuar?`,
        }
      })
    }
    else if (
      this.DISPOSICION_DERIVACION_INTERNA === this.idTramite
    ) {
      this.gestionarDerivacion.notificarMensajeAdvertenciaObservable.subscribe(valor => {
        const descripcionExtra = valor ? ` para acumular ` : ''
        mensaje = {
          titulo: 'DERIVACIÓN INTERNA',
          descripcion:
            `A continuación, se procederá a crear el trámite de Disposición de derivación interna y el trámite será derivado ${descripcionExtra}¿Está seguro de realizar la siguiente acción?`,
        }
      })
    }
    else if (
      this.DISPOSICION_DERIVACION_EXTERNA === this.idTramite
    ) {
      this.gestionarDerivacion.notificarMensajeAdvertenciaObservable.subscribe(valor => {
        const descripcionExtra = valor ? ` para acumular ` : ''
        mensaje = {
          titulo: 'DERIVACIÓN EXTERNA',
          descripcion:
            `A continuación, se procederá a crear el trámite de Disposición de derivación externa y el trámite será derivado ${descripcionExtra}¿Está seguro de realizar la siguiente acción?`,
        }
      })
    }
    else if (
       TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_ACUERDO === this.idTramite || TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_NO_ACUERDO
    ) {
      mensaje = {
        titulo: 'CANTIDAD DE FIRMAS',
        descripcion:'¿Este trámite va requerir de más firmas?',
        icono:'info',
        textoBotonCancelar:'No',
        textoBotonConfirmar:'Si'
      };
    }
    return mensaje;
  }
  async firmaMultipleDenegada(){
    if(TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_ACUERDO === this.idTramite ||
      TERMINACION_ANTICIPADA.ID_TRAMITE_ACTA_NO_ACUERDO === this.idTramite){
         await this.preFirmar();
      }
  }

  async preFirmar(): Promise<void> {
    this.tramiteService.habilitarFirmar = false;
    this.spinner.show().then();
    this.validarFirma();
  }

  validarFirma(): void {
    this.gestionCasoService.obtenerCasoFiscalV2(this.gestionCasoService.casoActual.idCaso).pipe(
      tap(() => this.spinner.show()),
      tap(() => this.casoFiscal = this.gestionCasoService.expedienteActual),
      delay(500)
    ).subscribe({
      next: () => {
        clearTimeout(this.firmarTiempo);
        if (this.casoFiscal.idEstadoRegistro && this.casoFiscal.idEstadoRegistro == ESTADO_REGISTRO.BORRADOR) {
          this.tramiteService.showLoading();
          this.spinner.show().then();
          this.firmarTiempo = setTimeout(() => {
            this.firmarTramite();
          }, 10000);
        } else {
          this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'warning',
              title: 'FIRMAR TRÁMITE',
              description: 'El trámite no se encuentra en estado BORRADOR',
              confirmButtonText: 'Aceptar',
              confirm: false,
            },
          } as DynamicDialogConfig<AlertaData>);
          this.tramiteService.habilitarFirmar = true;
          this.spinner.hide().then();
        }
      }
    });
  }

  private firmarTramite(): void {
    this.idCaso = this.casoFiscal.idCaso!;
    this.idActoTramiteEstado = this.casoFiscal.idActoTramiteEstado!;
    this.idActoTramiteCaso = this.casoFiscal.idActoTramiteCasoUltimo!;
    this.spinner.show().then();
    this.subscriptions.push(
      this.obtenerDatosFirma().pipe(
        concatMap((resp) => this.obtenerDocumentoAFirmar(this.idDocumentoVersiones)),
        concatMap((resp) => this.cargarDocumentoRepositorio())
      ).subscribe({
        next: () => {
          this.spinner.show();
          let body: FirmaInterface = {
            id: this.nombreDocumentoCargado,
            firma_url: `${BACKEND.FIRMA_CLIENTE}`,
            repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
            rol: this.datosFirma.cargoFirmador,
            motivo: this.datosFirma.motivoFirma,
            param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
            extension: 'pdf',
            posicionX: null,
            posicionY: null
          };
          console.log('FirmaInterface ',body);
          this.firmaDigitalClienteService.sendDataSign.emit(body);
        },
        complete: () => this.spinner.show(),
        error: () => {
          this.spinner.hide();
          this.tramiteService.habilitarFirmar = true;
          this.tramiteService.endLoading();
        }
      })
    );
  }

  private obtenerDatosFirma(): Observable<any> {
    this.spinner.show().then();
    return this.firmaIndividualService.obtenerDatosFirma().pipe(
      tap((resp) => {
        this.spinner.show();
        this.datosFirma = resp;
      }),
      catchError((error) => {
        this.spinner.hide();
        this.tramiteService.habilitarFirmar = true;
        this.tramiteService.endLoading();
        console.log(error);
        return of(EMPTY);
      })
    );
  }

  private obtenerDocumentoAFirmar(idDocumentoVersiones: string): Observable<any> {
    this.spinner.show().then();
    return this.firmaIndividualService.obtenerDocumentoAFirmar(idDocumentoVersiones).pipe(
      tap((resp) => {
        this.spinner.show();
        this.documentoAFirmarB64 = resp.archivo;
        this.datosCabecera = resp.datosCabecera;
      }),
      catchError((error) => {
        this.spinner.hide();
        this.tramiteService.habilitarFirmar = true;
        this.tramiteService.endLoading();
        console.log(error);
        return of(EMPTY);
      })
    );
  }

  private cargarDocumentoRepositorio(): Observable<any> {
    this.spinner.show().then();
    const formData = new FormData();
    formData.append('file',
      base64ToFile(this.documentoAFirmarB64)!,
      this.datosCabecera.nombreDocumentoFichero + '.pdf'
    );
    return this.repositorioDocumentoService.guardarDocumentoRepositorio(formData).pipe(
      tap((resp) => {
        this.spinner.show();
        this.nombreDocumentoCargado = resp.data.nodeId
      }),
      catchError((error) => {
        this.spinner.hide();
        this.tramiteService.habilitarFirmar = true;
        this.tramiteService.endLoading();
        console.log(error);
        return of(EMPTY);
      })
    );
  }

  async procesoFirma(realizado: string): Promise<void> {
    if (realizado === '0') {
      await this.spinner.show();
      await this.obtenerDocumentoFirmado();
      const request: GuardarDocumentoRequest = {
        idCaso: this.idCaso!,
        idActoTramiteEstado: this.idActoTramiteEstado!,
        idActoTramiteCaso: this.idActoTramiteCaso!,
        datosCabecera: this.datosCabecera,
        archivo: this.nombreDocumentoCargado
      };
      await this.guardarDocumento(request);
      this.firmadoExitoso = true;
      this.gestionCasoService.obtenerCasoFiscal(this.idCaso!);
      await this.spinner.show();
      this.alertaDocumentoFirmado(this.mensajeFirma);
      this.tramiteService.endLoading();
      this.tramiteService.habilitarFirmar = true;
      await this.spinner.hide();
    }
    if (realizado === '1') {
      this.firmadoExitoso = false;
      await this.spinner.hide();
      this.tramiteService.endLoading();
      this.tramiteService.habilitarFirmar = true;
      alert(SLUG_SIGN.CANCEL);
    }
  }

  private alertaDocumentoFirmado(mensajeFirma: MensajeFirma) {
    const mostrarBotonCancelar = mensajeFirma.mostrarBotonCancelar ? mensajeFirma.mostrarBotonCancelar!.trim() === '1' : false;
    const mostrarBotonSegundoConfirmar = mensajeFirma.mostrarBotonSegundoConfirmar ? mensajeFirma.mostrarBotonSegundoConfirmar.trim() === '1' : false;
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
        confirmSecondButtonText: mensajeFirma.textoBotonSegundoConfirmar,
        cancelButtonText: mensajeFirma.textoBotonCancelar,
        confirm: mostrarBotonCancelar,
        confirmSecond: mostrarBotonSegundoConfirmar,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.compartido = {
      ...this.compartido,
      esFirmado: this.firmadoExitoso,
      documento: this.documentoFirmado,
    };
    this.firmaIndividualService.notificarEsFirmado(this.compartido);
    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (mensajeFirma.idTipoAccion !== null) {
          if (resp === 'confirm' || (resp === 'closedAction' && !mostrarBotonCancelar)) {
            // ya no debería realizar un reload, el componente lee la etapa del caso y de acuerdo a eso se setea el menu
            this.router.navigate([mensajeFirma.accion]).then(() => {
              window.location.reload();
            });
          }

          if (resp === 'confirm2') {
            this.router.navigate([mensajeFirma.accionSegundoConfirmar]).then(() => {
              window.location.reload();
            });
          }
        }
      },
    });
  }

  private async obtenerDocumentoFirmado() {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.repositorioDocumentoService
          .verDocumentorepositorio(this.nombreDocumentoCargado)
          .subscribe({
            next: (resp) => {
              this.spinner.show();
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
              console.log(error);
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
            this.spinner.show();
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
            console.log(error);
          },
        })
      );
    });
  }
}
