import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import {
  ESTADO_REGISTRO,
  IconAsset,
} from 'dist/ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  catchError, concatMap,
  defer,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { DisposicionResuelveRetiroAcusacionModalComponent } from './disposicion-resuelve-retiro-acusacion-modal/disposicion-resuelve-retiro-acusacion-modal.component';
import { CheckboxModule } from 'primeng/checkbox';
import { AutoSobreseimientoDefinitivoService } from '@core/services/provincial/tramites/comun/juzgamiento/auto-sobreseimiento-definitivo/auto-sobreseimiento.service';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants';
import { AlertaService } from '@core/services/shared/alerta.service';
import { TokenService } from '@services/shared/token.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RespuestaCasoSupService } from '@services/reusables/reusable-respuesta-caso-sup.service';
import { TipoElevacionCodigo } from '@constants/superior';
import { Router } from '@angular/router';
import { etapaInfo } from '@constants/menu';
import {
  RespuestaSuperiorDetalleService
} from '@services/provincial/respuesta-superior/respuesta-superior-detalle.service';
import {
  ObservarComponent
} from '@modules/provincial/tramites/comun/preliminar/disposicion-emitir-pronunciamiento-elevacion-actuados/observar/observar.component';
import {
  DatosPronunciamiento
} from '@interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados';
import { UsuarioAuthService } from '@services/auth/usuario.service.ts.service';

@Component({
  standalone: true,
  selector: 'app-disposicion-resuelve-retiro-acusacion',
  templateUrl: './disposicion-resuelve-retiro-acusacion.component.html',
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    CmpLibModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    CalendarModule,
    NgxCfngCoreModalDialogModule,
    InputTextareaModule,
    CheckboxModule,
  ],
  providers: [DatePipe],
})
export class DisposicionResuelveRetiroAcusacionComponent
  implements OnInit, OnDestroy
{
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() numeroCaso: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() tramiteEnModoEdicion: boolean = false;
  @Input() idEstadoTramite: number = 0;

  @Output() peticionParaEjecutar = new EventEmitter<
    (datos: Object) => Observable<any>
  >();
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dialogService = inject(DialogService);
  private readonly tokenService = inject(TokenService);
  private readonly alertaService = inject(AlertaService);
  private readonly tramiteService = inject(TramiteService);
  private readonly usuarioAuthService = inject(UsuarioAuthService);
  private readonly firmaIndividualService =  inject(FirmaIndividualService);
  private readonly respuestaCasoService = inject(RespuestaCasoSupService);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly respuestaSuperiorDetalleService = inject(RespuestaSuperiorDetalleService);
  private readonly autoSobreseimientoDefinitivoService = inject(AutoSobreseimientoDefinitivoService);
  protected selectedSujetos: any = [];

  protected ocultarBotones: boolean = false;
  protected idJerarquia: number = 0;
  protected pdfUrlTramite: SafeResourceUrl | null = null;
  protected datosPronunciamiento: DatosPronunciamiento | null = null;
  protected readonly iconAsset = inject(IconAsset);
  private readonly suscripciones: Subscription[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected cantidadSujetosTramite: number = 0;
  protected modalValidado: boolean = false;

  private readonly desuscribir$ = new Subject<void>();
  protected formularioAutoResuelve: FormGroup = new FormGroup({
    idActoTramiteCaso: new FormControl(null, [Validators.required]),
    excluirFiscal: new FormControl(null, []),
    observaciones: new FormControl(null, [
      Validators.maxLength(this.longitudMaximaObservaciones),
    ]),
  });

  ngOnInit(): void {
    this.idJerarquia = parseInt(this.tokenService.getDecoded().usuario.codJerarquia);
    this.tramiteService.validacionTramite.verEditor = this.idJerarquia == 2;
    this.peticionParaEjecutar.emit((_) => this.guardarFormulario());
    this.tieneActoTramiteCasoDocumento && this.obtenerDetalleActoTramiteCaso();
    this.tramiteService.habilitarGuardar = true;
    this.firmaIndividualService.esFirmadoCompartidoObservable.pipe(
          takeUntil(this.desuscribir$)
        ).subscribe(
          (respuesta: any) => {
            if (respuesta.esFirmado) {
              const request: AlertaGeneralRequestDTO = {
                idCaso: this.idCaso,
                numeroCaso: this.numeroCaso,
                idActoTramiteCaso: this.idActoTramiteCaso,
                codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_SUP_PRON_RET1,
                idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
                destino: CodigoDestinoAlertaTramiteEnum.SUP_DESPACHO_PROVINCIAL,
              };
              this.registrarAlertas(request);
              this.formularioAutoResuelve.disable();

            }
          }
        );
    this.habilitarGuardar(this.formularioValidoGuardar());
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO;
  }

  get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  get cantidadCaracteresObservacion(): number {
    return this.formularioAutoResuelve.get('observaciones')?.value?.length ?? 0;
  }

  get esPosibleEditarFormulario(): boolean {
    return this.tramiteEnModoEdicion;
  }

  get formularioValido(): boolean {
    return (
      this.formularioAutoResuelve.valid &&
      this.selectedSujetos &&
      this.selectedSujetos.length > 0
    );
  }

  get nombreBoton(): string {
    return !this.tramiteEstadoFirmado && !this.tramiteEstadoRecibido ? 'Registrar pronunciamiento' : 'Ver pronunciamiento';
  }

  get obtenerTitulo(): string {
    const titulo = this.tramiteSeleccionado?.nombreTramite ?? '';
    return titulo.charAt(0).toUpperCase() + titulo.slice(1).toLowerCase();
  }

  private get nombreFiscal(): string {
    return this.usuarioAuthService.obtenerDatosUsuario().fiscal;
  }

  private registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  private formularioValidoGuardar(): boolean {
    return this.formularioAutoResuelve.valid && this.modalValidado;
  }

  private habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  private deshabilitarFormulario(): void {
    this.formularioAutoResuelve.disable();
  }

  private guardarFormulario(): Observable<any> {
    const datos = this.formularioAutoResuelve.getRawValue();
      const data: any = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      excluirFiscal: datos.excluirFiscal? '1' : '0',
      observacion: datos.observaciones
    };
    return defer(() =>
      this.modalDialogService
        .warning(
          'Confirmar devolución de caso a fiscalía provincial',
          `<b>¿Está seguro que desea realizar la devolución del caso ${this.numeroCaso} de retiro acusación a la fiscalía provincial?</b>.
            Por favor no olvide que al devolver el caso éste pasará a modo lectura y no podrá acceder a él, después no podrá revertir el cambio.`,
          'Si, confirmar', true, 'Cancelar'
        )
        .pipe(
          switchMap((resp) => {
            if (resp === 'cancelado') {
              this.tramiteService.formularioEditado = true;
              return of(null); // o throwError si quieres cortar el flujo
            } else {
              this.tramiteService.formularioEditado = false;
              this.tramiteService.habilitarFirmar = this.modalValidado;
              return this.autoSobreseimientoDefinitivoService.registrarDisposicion(
                data
              );
            }
          }),
          catchError((error) => {
            this.modalDialogService.error(
              'Pronunciamiento',
              error?.error?.message && error.status === 422
                ? error.error.message
                : 'Ocurrió un error al intentar guardar los datos.',
              'Aceptar'
            );
            return throwError(
              () =>
                new Error(
                  'Ocurrió un error al intentar guardar la disposición. Por favor intente de nuevo'
                )
            );
          })
        )
    );
  }

  private obtenerDetalleActoTramiteCaso() {
    this.formularioAutoResuelve
      .get('idActoTramiteCaso')
      ?.setValue(this.idActoTramiteCaso);
    this.obtenerAutoResuelveRequerimiento();
  }

  private obtenerAutoResuelveRequerimiento(): void {
    this.suscripciones.push(
      this.autoSobreseimientoDefinitivoService
        .obtenerDatosDisposicion(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            console.log('Respuesta de obtener datos disposicion', resp);
            this.establecerValoresFormularioRecibido(resp);
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'No se puede obtener los datos',
              'Aceptar'
            );
          },
        })
    );
  }

  private establecerValoresFormularioRecibido(data: any): void {
    this.formularioAutoResuelve.patchValue({
      idActoTramiteCaso: data.idActoTramiteCaso,
      excluirFiscal: data.excluirFiscal === '1',
      observaciones: data.observacion,
    });

    this.datosPronunciamiento = data;
    this.modalValidado = data.modalValidado === '1';
    this.tramiteService.formularioEditado = true;
    this.habilitarGuardar(this.formularioValidoGuardar());
    !this.esPosibleEditarFormulario && this.deshabilitarFormulario();
    this.cargarPDF();
  }

  cargarPDF(): void {
    if (this.tramiteEstadoFirmado) {
      this.suscripciones.push(
        this.tramiteService.descargarDocumento(this.tramiteService.tramiteRegistrado.idDocumentoVersiones || '').subscribe({
          next: (resp) => {
            const documento = this.base64ToBlob(resp.archivo, 'application/pdf');
            this.pdfUrlTramite = this.sanitizer.bypassSecurityTrustResourceUrl(
              URL.createObjectURL(documento)
            );
          }
        })
      );
    }
  }

  private base64ToBlob(base64: string, type: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: type });
  }

  public openModalSujetos(): void {
    const ref = this.dialogService.open(
      DisposicionResuelveRetiroAcusacionModalComponent,
      {
        showHeader: false,
        closeOnEscape: false,
        contentStyle: { padding: '0px', 'border-radius': '15px' },
        data: {
          numeroCuadernoCaso: this.numeroCaso,
          idCaso: this.idCaso,
          idActoTramiteCaso: this.idActoTramiteCaso,
          idTramite: '',
          idEstadoTramite: this.idEstadoTramite,
          listSujetosProcesales: this.selectedSujetos,
          soloLectura: !this.tramiteEnModoEdicion,
          esRechazaParcial: !this.modalValidado  ,
        },
      }
    );

    ref.onClose.subscribe((data) => {
      if (data?.modalValidado) {
        this.modalValidado = data?.modalValidado ?? false;
      }

      this.tramiteService.formularioEditado = true;
      this.habilitarGuardar(this.formularioValidoGuardar());
    });
  }

  protected eventoObservarTramite() {
    const modalDetalle = this.dialogService.open(ObservarComponent, {
      showHeader: false,
      styleClass: 'p-dialog--lg',
      data: {
        esModal: false,
        datosPronunciamiento: this.datosPronunciamiento,
        esSoloLectura: false,
        minCaracteres: 1
      }
    });

    modalDetalle.onClose.subscribe({
      next: (rs) => {
        if (rs?.aceptar) {
          this.observarTramite(rs.datos.observacion);
        } else {
          this.observarCancelar();
        }
      }
    });
  }

  private observarCancelar(): void {
    this.ocultarBotones = false;
  }

  private observarTramite(observacion: string): void {
    this.respuestaCasoService
      .observarCaso({
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        idTipoElevacion: +TipoElevacionCodigo.ContiendaCompetencia,
        observacion: observacion,
        numeroCaso: this.numeroCaso,
      })
      .subscribe({
        next: (_) => {
          this.modalDialogService
            .success(
              'Disposición observada',
              'Se ha observado la disposición que resuelve el retiro de acusación.',
              'Aceptar'
            )
            .subscribe({
              next: (_) => {
                this.ocultarBotones = true;
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("exito");

                setTimeout(() => {
                  const request: AlertaGeneralRequestDTO = {
                    idCaso: this.idCaso,
                    numeroCaso: this.numeroCaso,
                    idActoTramiteCaso: this.idActoTramiteCaso,
                    codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_CC3,
                    idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
                    destino: CodigoDestinoAlertaTramiteEnum.SUP_USUARIO_SUPERIOR,
                    data: [{ campo: 'NOMBRE_FISCAL_PROVINCIAL', valor: this.nombreFiscal }]
                  };
                  this.registrarAlertas(request);
                }, 0);

              },
            });
        },
        error: (_) => {
          this.modalDialogService.error(
            'Error',
            'No se pudo recibir la disposición',
            'Aceptar'
          );
        },
      });
  }

  protected eventoRecibirTramite() {
    this.modalDialogService
      .warning(
        'Confirmar acción',
        'Por favor confirme la acción de recibir el trámite',
        'Aceptar',
        true,
        'Cancelar'
      )
      .subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.recibirTramite();
          }
        },
      });
  }

  private recibirTramite(): void {
    this.respuestaCasoService.aceptarCaso({
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      idTipoElevacion: +TipoElevacionCodigo.RetiroAcusacion,
      observacion: '',
      numeroCaso: this.numeroCaso
    }).pipe(
      concatMap(() => this.solucionarAlerta())
    ).subscribe({
      next: (_) => {
        this.modalDialogService.success('Disposición recibida', 'Se recibió correctamente la disposición', 'Aceptar').subscribe({
          next: (_) => {
            this.ocultarBotones = true;
            this.respuestaSuperiorDetalleService.notificarAccionFinalizada("aceptarCaso");
            const path = etapaInfo(this.idEtapa).path;
            this.router.navigate([`/app/administracion-casos/consultar-casos-fiscales/${path}/caso`, this.idCaso, 'acto-procesal',]).then(() => {
              window.location.reload();
            });
          }
        });
      },
      error: (_) => {
        this.modalDialogService.error('Error', 'No se pudo recibir la disposición', 'Aceptar');
      }
    });
  }

  solucionarAlerta(): Observable<any> {
    const alerta: Alerta = {
      codigoDespacho: this.tokenService.getDecoded().usuario.codDespacho,
      idAsignado: this.tokenService.getDecoded().usuario.usuario,
      codigoCaso: this.numeroCaso,
      codigoUsuarioDestino: '',
      fechaCreacion: '',
      texto: ''
    }
    return this.alertaService
      .solucionarAlerta(alerta)
      .pipe(takeUntil(this.desuscribir$));
  }
}
