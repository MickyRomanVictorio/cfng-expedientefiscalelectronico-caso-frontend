import { NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { ConsultaCasosSharedService } from '@core/services/provincial/consulta-casos/consulta-casos-shared.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import {
  catchError,
  defer,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import { MensajeNotificacionService } from '@core/services/shared/mensaje.service';
import { ESTADO_REGISTRO, IconAsset, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MessagesModule } from 'primeng/messages';
import { CalendarModule } from 'primeng/calendar';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { ButtonModule } from 'primeng/button';
import { CmpLibModule } from 'dist/cmp-lib';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AlertaModalComponent } from '@core/components/modals/alerta-modal/alerta-modal.component';
import { AlertaData } from '@core/interfaces/comunes/alert';
import { NgClass, NgIf } from '@angular/common';
import { AutoResuelveCalificacionApelacionService } from '@core/services/provincial/cuadernos-incidentales/auto-resuelve-calificacion-apelacion/auto-resuelve-calificacion-apelacion.service';
import { ExcluirFiscalCasoService } from '@core/services/provincial/tramites/comun/preliminar/excluir-fiscal.service';
import { ExcluirFiscal } from '@core/interfaces/provincial/tramites/comun/preliminar/excluir-fiscal.interface';
import { AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import {
  CodigoAlertaTramiteEnum,
  CodigoDestinoAlertaTramiteEnum,
  TipoOrigenAlertaTramiteEnum,
} from '@core/constants/constants';
import { AlertaService } from '@core/services/shared/alerta.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';

@Component({
  standalone: true,
  selector: 'app-disposicion-exclusion-fiscal',
  templateUrl: './disposicion-exclusion-fiscal.component.html',
  imports: [
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    MessagesModule,
    CalendarModule,
    DateMaskModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    InputMaskModule,
    DropdownModule,
    InputTextareaModule,
    NgClass,
  ],
})
export class DisposicionExclusionFiscalComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() idActoTramiteCaso: string = '';
  @Input() idEstadoTramite!: number;
  @Input() numeroCaso: string = '';
  @Input() idActoTramiteProcesalEnlace: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null; //
  @Input() idDocumento: string[] = []; //
  @Input() tramiteEnModoEdicion: boolean = false;
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Output() ocultarBotonTramite = new EventEmitter<boolean>();

  protected refModal!: DynamicDialogRef;
  private readonly subscriptions: Subscription[] = [];
  protected fiscalias: any[] = [];
  protected maxlengthObservaciones: number = 200;
  protected formulario!: FormGroup;
  protected sujetosProcesales: any[] = [];
  protected tramiteGuardado: boolean = false;
  protected longitudMaximaObservaciones: number = 200;
  protected esSoloLectura: boolean = false;
  protected mostrarBotonelevar: boolean = false;
  private desuscribir$ = new Subject<void>();
  constructor(
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly autoResuelveCalificacionApelacionService: AutoResuelveCalificacionApelacionService,
    private readonly excluirFiscalService: ExcluirFiscalCasoService,
    // private readonly mensajeService: MensajeNotificacionService,
    // private readonly consultaCasosSharedService: ConsultaCasosSharedService,
    private readonly gestionCasoService: GestionCasoService,
    protected readonly iconAsset: IconAsset,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly alertaService: AlertaService,
    protected tramiteService: TramiteService,
    private readonly firmaIndividualService: FirmaIndividualService
  ) {}
  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      fechaSolicitud: [null, null],
      codFiscaliaSuperior: [null, Validators.required],
    });
    this.peticionParaEjecutar.emit((_) => {
      return this.guardarFormulario();
    });
    this.firmaIndividualService.esFirmadoCompartidoObservable
      .pipe(takeUntil(this.desuscribir$))
      .subscribe((respuesta: any) => {
        if (respuesta.esFirmado) {
          this.formulario.get('codFiscaliaSuperior')?.disable();
          this.gestionCasoService.obtenerCasoFiscalV2(this.idCaso);

          this.generarAlerta();
          this.esSoloLectura = true;
        }
      });
    this.getFiscalSuperiorAElevar();
    this.obtenerDatosFormulario();
    if (this.tramiteEstadoFirmado) {
      this.formulario.get('codFiscaliaSuperior')?.disable();
      this.formulario.get('fechaSolicitud')?.disable();
      this.habilitarGuardar(false);
      this.habilitarFirmar(false);
    }
  }
  get formularioValido(): boolean {
    if (this.formulario.valid) {
      this.habilitarGuardar(true);
    }
    return this.formulario.valid;
  }
  get tieneActoTramiteCasoDocumento(): boolean {
    return Boolean(this.idActoTramiteCaso);
  }
  protected habilitarGuardar(estado: boolean): void {
    this.tramiteService.habilitarGuardar = estado;
  }
  protected habilitarFirmar(estado: boolean): void {
    this.tramiteService.habilitarFirmar = estado;
  }
  get tramiteEstadoFirmado(): boolean {
    return (
      this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO ||
      this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO
    );
  }
  get cantidadCaracteresObservacion(): number {
    return this.formulario.get('observaciones')?.value?.length ?? 0;
  }
  private getFiscalSuperiorAElevar(): void {
    this.subscriptions.push(
      this.autoResuelveCalificacionApelacionService
        .listarFiscaliasSuperiores(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.fiscalias = resp;
            if (this.fiscalias.length === 1) {
              this.formulario
                .get('codFiscaliaSuperior')
                ?.setValue(this.fiscalias[0].id);
              this.habilitarGuardar(true);
            }
          },
          error: () => {
            this.fiscalias = [];
          },
        })
    );
  }
  private generarAlerta() {
    console.log('Generando alerta para elevar caso a fiscal superior');
    const request: AlertaGeneralRequestDTO = {
      idCaso: this.idCaso,
      numeroCaso: this.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_SUP_ELE1,
      idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
      destino: CodigoDestinoAlertaTramiteEnum.SUP_FISCAL_SUPERIOR,
    };
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  protected obtenerDatosFormulario(): void {
    this.subscriptions.push(
      this.excluirFiscalService
        .obtenerDatosFormulario(this.idCaso, this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.formulario.patchValue({
              fechaSolicitud: resp.fechaSolicitud,
              codFiscaliaSuperior: resp.codFiscaliaSuperior,
            });
            this.formularioValido;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  protected eventoElevarIncidenteAFiscalSuperior() {
    const nombreFiscalSuperior = this.fiscalias.find(
      (e) => e.id === this.formulario.get('codFiscaliaSuperior')!.value
    )?.nombre;

    const descripcion = `Despues de Firmar esta acción realiza la elevación del caso a la ${nombreFiscalSuperior}. Por favor, no olvide que al elevar el caso este pasará a modo lectura y no podrá acceder a él hasta que le sea devuelto. Después no podrá revertir el cambio.
      \n<b>'¿Está seguro de realizar este trámite?'</b>`;
    this.refModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `ELEVAR CASO A FISCAL SUPERIOR`,
        description: descripcion,
        confirmButtonText: 'Aceptar',
        confirm: true,
        cancelButtonText: 'Cancelar',
      },
    } as DynamicDialogConfig<AlertaData>);

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          const data: ExcluirFiscal = {
            idCaso: this.idCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            fechaSolicitud: this.formulario.get('fechaSolicitud')!.value,
            codFiscaliaSuperior: this.formulario.get('codFiscaliaSuperior')!
              .value,
            observaciones: this.formulario.get('observaciones')!.value,
          };
          this.subscriptions.push(
            this.excluirFiscalService.elevarFiscalSuperior(data).subscribe({
              next: (resp) => {
                this.tramiteGuardado = true;
                this.mostrarBotonelevar = false;
                this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
                this.generarAlerta();
                this.modalDialogService.success(
                  'ELEVACIÓN A FISCAL SUPERIOR',
                  `El caso fue elevado correctamente, recuerde que no tendrá acceso al caso hasta que sea devuelto`,
                  'Aceptar'
                );
                this.refModal.close();
              },
              error: (error) => {
                this.modalDialogService.error(
                  'ERROR EN EL SERVICIO',
                  error.error.message,
                  'Aceptar'
                );
              },
            })
          );
        }
      },
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  guardarFormulario(): Observable<any> {
    const nombreFiscalSuperior = this.fiscalias.find(
      (e) => e.id === this.formulario.get('codFiscaliaSuperior')!.value
    )?.nombre;

    const descripcion = `Despues de Firmar esta acción realiza la elevación del caso a la ${nombreFiscalSuperior}. Por favor, no olvide que al elevar el caso este pasará a modo lectura y no podrá acceder a él hasta que le sea devuelto. despues no podrá realizar ninguna acción sobre el cambio 
        \n<b>'¿Está seguro de realizar este trámite?'</b>`;
    const data: ExcluirFiscal = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaSolicitud: this.formulario.get('fechaSolicitud')!.value,
      codFiscaliaSuperior: this.formulario.get('codFiscaliaSuperior')!.value,
    };
    return defer(() =>
      this.modalDialogService
        .warning(
          `ELEVAR CASO A FISCAL SUPERIOR`,
          descripcion,
          'Aceptar',
          true,
          'Cancelar'
        )
        .pipe(
          switchMap((resp) => {
            if (resp === 'cancelado') {
              this.tramiteService.formularioEditado = true;
              return of(null); // o throwError si quieres cortar el flujo
            } else {
              this.tramiteService.formularioEditado = false;
              this.formulario.get('codFiscaliaSuperior')?.disable();
              return this.excluirFiscalService.guardarFormulario(data);
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
}
