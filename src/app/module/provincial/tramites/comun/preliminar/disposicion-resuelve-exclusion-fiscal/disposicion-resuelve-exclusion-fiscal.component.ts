import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import {
  CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum,
  TipoOrigenAlertaTramiteEnum,
} from '@core/constants/constants';
import { TipoElevacionCodigo } from '@core/constants/superior';
import { AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { GenericResponseModel } from '@core/interfaces/comunes/GenericResponse';
import {
  DatosPronunciamiento
} from '@core/interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { RespuestaSuperiorDetalleService } from '@core/services/provincial/respuesta-superior/respuesta-superior-detalle.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { RespuestaCasoSupService } from '@core/services/reusables/reusable-respuesta-caso-sup.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { TokenService } from '@core/services/shared/token.service';
import { VisorEfeService } from '@core/services/visor/visor.service';
import { DateMaskModule } from '@directives/date-mask.module';
import { Catalogo } from '@interfaces/comunes/catalogo';
import {
  CfeDialogRespuesta, NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService
} from '@ngx-cfng-core-modal/dialog';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { MaestroService } from '@services/shared/maestro.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService, DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import {
  catchError, defer,
  firstValueFrom,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import {RadioButtonModule} from "primeng/radiobutton";
import {
  ExcluirFiscalCasoService
} from "@services/provincial/tramites/comun/preliminar/disposicion-resuelve-eclusion-fiscal.service";
import { ModalObservarExclusionComponent } from './observar/observar.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';

@Component({
  selector: 'app-disposicion-emitir-pronunciamiento-exclusion-fiscal',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
    DateMaskModule,
    CheckboxModule,
    CmpLibModule,
    TableModule,
    NgxCfngCoreModalDialogModule,
    ModalObservarExclusionComponent,
    RadioButtonModule
  ],
  providers: [DatePipe, DialogService],
  templateUrl: './disposicion-resuelve-exclusion-fiscal.component.html',
  styleUrls: ['./disposicion-resuelve-exclusion-fiscal.component.scss',],
})
export class DisposicionResuelveExclusionFiscalComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Output() peticionParaEjecutar = new EventEmitter<(datos: Object) => Observable<any>>();

  public suscripciones: Subscription[] = [];
  public casoFiscal: CasoFiscal | null = null;
  public formularioPronunciamiento!: FormGroup;
  protected referenciaModal!: DynamicDialogRef;
  public alertas: AlertaFormulario[] = [];
  public obtenerIcono = obtenerIcono;
  protected tipoResultado: Catalogo[] = [];
  protected pdfUrlTramite: SafeResourceUrl | null = null;
  protected ocultarBotones: boolean = false;
  protected idJerarquia: number = 0;
  protected idNode: string = '';
  protected observacionProvincial: string = '';
  private readonly desuscribir$ = new Subject<void>();
  protected datosPronunciamiento: any | null = null;
  public mostrarCamposFormulario: boolean = false;
  protected verFormularioObservar = signal<boolean>(false);

  constructor(
    private readonly reusablesAlertas: ReusablesAlertas,
    private readonly maestroService: MaestroService,
    private readonly formulario: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly excluirFiscalCasoService: ExcluirFiscalCasoService,
    protected readonly _sanitizer: DomSanitizer,
    protected readonly tramiteService: TramiteService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly visorEfeService: VisorEfeService,
    private readonly respuestaCasoService: RespuestaCasoSupService,
    private readonly alertaService: AlertaService,
    private readonly router: Router,
    private readonly tokenService: TokenService,
    private readonly firmaIndividualService: FirmaIndividualService,
    private readonly respuestaSuperiorDetalleService: RespuestaSuperiorDetalleService,
    private readonly dialogService: DialogService,
     private readonly gestionCasoService: GestionCasoService
  ) {}

  ngOnInit(): void {
    this.idJerarquia = parseInt(this.tokenService.getDecoded().usuario.codJerarquia);

    this.firmaIndividualService.esFirmadoCompartidoObservable.pipe(
      takeUntil(this.desuscribir$)
    ).subscribe(
      (respuesta: any) => {
        if (respuesta.esFirmado) {
          const request: AlertaGeneralRequestDTO = {
            idCaso: this.idCaso,
            numeroCaso: this.numeroCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_CC1,
            idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
            destino: CodigoDestinoAlertaTramiteEnum.SUP_DESPACHO_PROVINCIAL,
          };
          this.registrarAlertas(request);
          this.formularioPronunciamiento.disable();

        }
      }
    );
    this.crearFomulario();
    this.obtenerDatosFormulario();
    this.formularioEditado(true);
    this.peticionParaEjecutar.emit((_) => this.guardarFormulario());
    this.cargarTiposResultado();
  }

  guardarFormulario(): Observable<any> {
    const datos = this.formularioPronunciamiento.getRawValue();

    if (!datos.tipoResultado) {
      this.modalDialogService.error(
          'Resultado',
          'Para continuar debe seleccionar el resultado.',
          'Aceptar'
      );
      return throwError(() => new Error('Falta completar los datos del formulario'));
    }

    return defer(() =>
        this.modalDialogService.warning(
            'Confirmar devolución de caso a fiscalía provincial',
            `<b>¿Está seguro que desea realizar la devolución del caso ${this.numeroCaso} de exclusión fiscal a la ${this.datosPronunciamiento?.nombreFiscalia}?</b>.
              Por favor no olvide que al devolver el caso éste pasará a modo lectura y no podrá acceder a él, después no podrá revertir el cambio.`,
            'Si, confirmar', true, 'Cancelar'
        ).pipe(
            switchMap((resp) => {
              if (resp === 'cancelado') {
                this.tramiteService.formularioEditado = true;
                return of(null); // o throwError si quieres cortar el flujo
              } else {
                this.tramiteService.formularioEditado = false;
                return this.excluirFiscalCasoService.guardarFormulario({
                  idActoTramiteCaso: this.idActoTramiteCaso,
                  idTipoRespuesta: datos.tipoResultado
                });
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
              return throwError(() =>
                  new Error('Ocurrió un error al intentar guardar la disposición. Por favor intente de nuevo')
              );
            })
        )
    );
  }


  private crearFomulario(): void {
    this.formularioPronunciamiento = this.formulario.group({
      tipoResultado: ['', [Validators.required]],
      excluirFiscal: [false]
    });
  }

  public cargarTiposResultado() {
    this.maestroService.obtenerCatalogo('ID_N_TIPO_RESULTADO').subscribe({
      next: (resp) => {
        this.tipoResultado = resp.data.filter( (el:any)=> (el.id == 763 || el.id===765) );
      },
      error: (error) => {
        console.error('Error al cargar tipos de resultado:', error);
      },
    });
  }

  private obtenerDatosFormulario(): void {
    this.suscripciones.push(
      this.excluirFiscalCasoService
        .obtenerDatosFormulario(this.idActoTramiteCaso)
        .subscribe({
          next: (data) => {
            this.datosPronunciamiento = data;
            this.datosPronunciamiento.numeroCaso = this.numeroCaso;
            this.formularioPronunciamiento.patchValue({
              tipoResultado: data.idTipoRespuesta
            });
            if (
              this.datosPronunciamiento.flgResponder === 1 &&
              this.idJerarquia === 1
            ) {
              this.responderResuelveElevacion(this.datosPronunciamiento);
            }
            this.observacionProvincial = data.observacionProvincial!;
            if(data.idTipoRespuesta > 0){
              this.habilitarGuardar(true);
              this.formularioEditado(false);
            }

            if(this.idJerarquia === 1 || this.tramiteService.tramiteEnModoVisor){
              this.formularioPronunciamiento.get('tipoResultado')!.disable();
            }
          },
          error: (err) => {
            console.error('Error al obtener el formulario:', err);
          },
        })
    );
  }

  private responderResuelveElevacion(datos: DatosPronunciamiento): void {
    this.formularioPronunciamiento.disable();
  }

  protected eventoSeleccionarResultado(): void {
    this.habilitarGuardar(true);
    this.formularioEditado(true);
  }

  private habilitarGuardar(estado: boolean): void {
    this.tramiteService.habilitarGuardar = estado;
  }

  private formularioEditado(estado: boolean): void {
    this.tramiteService.formularioEditado = estado;
  }

  protected eventoObservarTramite(esModal: boolean = false): void {
    if (esModal) {
      const _ = this.dialogService.open(ModalObservarExclusionComponent, {
        width: '600px',
        showHeader: false,
        data: {
          datosPronunciamiento: this.datosPronunciamiento,
          esSoloLectura: this.idJerarquia === 2,
        },
      } as DynamicDialogConfig);
      return;
    }
    this.verFormularioObservar.set(true);
    this.ocultarBotones = true;
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
      idTipoElevacion: +TipoElevacionCodigo.ContiendaCompetencia,
      observacion: "",
      numeroCaso: this.numeroCaso
    }).subscribe({
      next: (_) => {
        this.modalDialogService.success('Disposición recibida', 'Se recibió correctamente la disposición', 'Aceptar').subscribe({
          next: (_) => {
            this.ocultarBotones = true;
            this.respuestaSuperiorDetalleService.notificarAccionFinalizada("");
            this.router.navigate([
              '/app/administracion-casos/consultar-casos-fiscales/calificacion/caso',
              this.idCaso,
              'acto-procesal',
            ]).then(() => {
              console.log('Redireccionando a la página de caso');
            //  window.location.reload();
            });
          }
        });
      },
      error: (_) => {
        this.modalDialogService.error('Error', 'No se pudo recibir la disposición', 'Aceptar');
      }
    });
  }

  registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  protected eventoObservarCancelar(): void {
    this.verFormularioObservar.set(false);
    this.ocultarBotones = false;
  }

  protected eventoObservarEnviar(datos: any): void {
    this.observarTramite(datos.observacion);
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
              'Se ha observado la disposición que resuelve la exclusión fiscal.',
              'Aceptar'
            )
            .subscribe({
              next: (_) => {
                const request: AlertaGeneralRequestDTO = {
                  idCaso: this.idCaso,
                  numeroCaso: this.numeroCaso,
                  idActoTramiteCaso: this.idActoTramiteCaso,
                  codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_CC3,
                  idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
                  destino: CodigoDestinoAlertaTramiteEnum.SUP_USUARIO_SUPERIOR
                };
                this.registrarAlertas(request);
                this.ocultarBotones = true;
                this.verFormularioObservar.set(false);
                this.respuestaSuperiorDetalleService.notificarAccionFinalizada("exito");
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

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

}
