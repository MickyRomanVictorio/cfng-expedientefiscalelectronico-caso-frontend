import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { CatalogoInterface } from '@core/interfaces/comunes/catalogo-interface';
import { MaestroService } from '@core/services/shared/maestro.service';
import { CmpLibModule } from 'dist/cmp-lib';
import { ESTADO_REGISTRO, getDateFromString, IconAsset } from 'dist/ngx-cfng-core-lib';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {
  catchError,
  map,
  Observable,
  Subscription,
  tap,
  throwError,
} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { NO_GRUPO_CATALOGO } from '@core/types/grupo-catalago';
import {
  GenericResponseList,
  GenericResponseModel,
} from '@core/interfaces/comunes/GenericResponse';
import { ActaInconcurrenciaTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preparatoria/acta-inconcurrencia-ta.service';
import { ActaInconcurrenciaTA } from '@core/interfaces/provincial/tramites/comun/preparatoria/acta-inconcurrencia-ta';
import { capitalizedFirstWord } from '@core/utils/string';
import { ID_N_TIPO_ACTIV_AGENDA } from '@core/types/tipo-citacion.type';
import { DialogService } from 'primeng/dynamicdialog';
import { SujetosActaInconcurrenciaTaComponent } from '@core/components/modals/sujetos-acta-inconcurrencia-ta/sujetos-acta-inconcurrencia-ta.component';
import { formatearFechaHoraLocal, obtenerFechaHoraTipoDate } from '@core/utils/date';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { CitacionReunionAcuerdoTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preliminar/terminacion-anticipada/citacion-reunion-acuerdo-terminacion-anticipada..service';
import { DropdownModule } from 'primeng/dropdown';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';

@Component({
  selector: 'app-acta-inconcurrencia-terminacion-anticipada',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CmpLibModule,
    CheckboxModule,
    ButtonModule,
    RadioButtonModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    DateMaskModule,
    DropdownModule
  ],
  templateUrl: './acta-inconcurrencia-terminacion-anticipada.component.html',
  styleUrl: './acta-inconcurrencia-terminacion-anticipada.component.scss',
})
export class ActaInconcurrenciaTerminacionAnticipadaComponent
  implements OnInit, OnDestroy
{
  @Input() idCaso!: string;
  @Input() numeroCaso!: string;
  @Input() idEtapa!: string;
  @Input() etapa!: string;
  @Input() idEstadoTramite!: number;
  @Input() idActoTramiteCaso!: string;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() deshabilitado: boolean = false;
  @Input() tramiteSeleccionado!: TramiteProcesal;
  @Input() validacionTramite!: ValidacionTramite;

  @Output() peticionParaEjecutar = new EventEmitter<() => any>();

  protected fechaNuevaReunionMinima: Date | null = null;
  protected listaCitasAgendadas: any = [];
  protected citaSeleccionada: any;
  protected fb = inject(FormBuilder);
  protected iconAsset = inject(IconAsset);
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  protected readonly tramiteService = inject(TramiteService);
  private readonly maestroService = inject(MaestroService);
  private readonly firmaIndividualService = inject(FirmaIndividualService);
  private readonly actaInconcurrenciaTaService = inject(ActaInconcurrenciaTerminacionAnticipadaService);
  protected readonly citacionReunionAcuerdoTerminacionAnticipadaService = inject(CitacionReunionAcuerdoTerminacionAnticipadaService);
    private readonly gestionCasoService = inject(GestionCasoService);
  
  private readonly dialogService = inject(DialogService);

  protected formulario!: FormGroup;
  public suscripciones: Subscription[] = [];
  protected listaTipoCitacion: CatalogoInterface[] = [];
  protected flagregistrar: boolean = false;
  protected tieneMinimoUnSujetoSeleccionado: boolean = false;
  protected formularioIncompleto: boolean = false;
  private obteniendoInformacion: boolean = false;
  private modoLectura: boolean = false;

  constructor() {
    this.formulario = this.fb.group({
      incluye: new FormControl(false),
      citasAgendadas: new FormControl([]),
      fechaNuevaReunion: new FormControl(null),
      tipoCitacion: new FormControl(null),
      urlReunion: new FormControl(null, [Validators.maxLength(100)]),
      lugar: new FormControl(null, [Validators.maxLength(100)]),
      observaciones: new FormControl(null, [Validators.maxLength(200)]),
    });
  }

  async ngOnInit(): Promise<void> {

    const fechaIngresoStr = this.gestionCasoService.expedienteActual.fechaHecho;
    this.fechaNuevaReunionMinima = getDateFromString(fechaIngresoStr);    
    

    this.listarCitasAgendadas();
    
    await this.listarTipoCitacion();
    
    this.obtenerDatosActaInconcurrencia();

    if (!this.esPosibleEditarFormulario) {
      this.formulario.disable();
      this.modoLectura = true;
    }

    this.formulario.valueChanges.subscribe(() => {
      
      if (!this.obteniendoInformacion) {
        this.formularioIncompleto = !(
          this.tieneMinimoUnSujetoSeleccionado && this.formulario.valid
        );
        this.formularioEditado(true);

        if (this.tieneMinimoUnSujetoSeleccionado && this.formulario.valid) {
          this.habilitarGuardar(true);
        } else {
          this.habilitarGuardar(false);
        }
      }
    });

    this.suscripciones.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.formulario.disable();
            this.modoLectura = true;
          }
        }
      )
    );

    this.peticionParaEjecutar.emit(() => this.guardarDatosActaIncocurrencia());
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite);
  }

  protected get cantidadCaracteresObservacion(): number {
    return this.formulario.get('observaciones')?.value?.length ?? 0;
  }

  protected get esPosibleEditarFormulario(): boolean {
    return (
      this.tramiteService.validacionTramite.idEstadoRegistro ===
      ESTADO_REGISTRO.BORRADOR
    );
  }

  protected get esReunionVirtual(): boolean {
    return (
      this.formulario.get('tipoCitacion')?.value ===
      ID_N_TIPO_ACTIV_AGENDA.VIRTUAL
    );
  }

  protected get caracteresRestantes(): number {
    return 200 - (this.formulario.get('observaciones')?.value?.length || 0);
  }

  openModalSujetos() {
    const ref = this.dialogService.open(SujetosActaInconcurrenciaTaComponent, {
      showHeader: false,
      data: {
        idActoTramiteCaso: this.idActoTramiteCaso,
        numeroCaso: this.numeroCaso,
        modoLectura: this.modoLectura,
        formularioValido: this.formulario.valid,
      },
      contentStyle: { padding: '0', 'border-radius': '15px' },
    });

    ref.onClose.subscribe((data?: boolean) => {
      if (data !== undefined) {
        this.tieneMinimoUnSujetoSeleccionado = true;
      }
      this.formularioIncompleto = !(
        this.tieneMinimoUnSujetoSeleccionado && this.formulario.valid
      );

      if (this.tieneMinimoUnSujetoSeleccionado && this.formulario.valid) {
        this.habilitarGuardar(true);
      } else {
        this.habilitarGuardar(false);
      }
    });
  }

  tipoCitacionValido(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    return valor === ID_N_TIPO_ACTIV_AGENDA.VIRTUAL ||
      valor === ID_N_TIPO_ACTIV_AGENDA.PRESENCIAL
      ? null
      : { tipoCitacionInvalido: true };
  }

  cambioIncluye() {
    const incluye = this.formulario.get('incluye')?.value;

    const citaAgendadaCtrl = this.formulario.get('citaAgendada');
    const fechaNuevaReunionCtrl = this.formulario.get('fechaNuevaReunion');
    const tipoCitacionCtrl = this.formulario.get('tipoCitacion');

    citaAgendadaCtrl?.setValue(null);
    fechaNuevaReunionCtrl?.setValue(null);
    tipoCitacionCtrl?.setValue(null);

    if (incluye) {
      citaAgendadaCtrl?.setValidators([Validators.required]);
      fechaNuevaReunionCtrl?.setValidators([Validators.required]);
      tipoCitacionCtrl?.setValidators([this.tipoCitacionValido]);
    } else {
      citaAgendadaCtrl?.clearValidators();
      fechaNuevaReunionCtrl?.clearValidators();
      tipoCitacionCtrl?.clearValidators();
    }

    citaAgendadaCtrl?.updateValueAndValidity();
    fechaNuevaReunionCtrl?.updateValueAndValidity();
    tipoCitacionCtrl?.updateValueAndValidity();
  }

  tipoCitacionOnchange(): void {
    this.formulario.get('urlReunion')?.setValue(null);
  }

  private listarTipoCitacion(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.suscripciones.push(
        this.maestroService
          .getCatalogo(NO_GRUPO_CATALOGO.TIPO_ACTIV_AGENDA)
          .subscribe({
            next: (resp: GenericResponseList<CatalogoInterface>) => {
              this.listaTipoCitacion = resp.data;
              resolve();
            },
            error: (err) => {
              this.listaTipoCitacion = [];
              reject(new Error(err));
            },
          })
      );
    });
  }

  protected listarCitasAgendadas(): void {
    this.suscripciones.push(
      this.citacionReunionAcuerdoTerminacionAnticipadaService
        .listarCitasAgendadas(this.idCaso)
        .subscribe({
          next: (resp: any) => {
            this.listaCitasAgendadas = resp;
            if (this.listaCitasAgendadas.length == 1) {
              this.citaSeleccionada = this.listaCitasAgendadas[0];
              this.formulario.get('citasAgendadas')?.setValue(this.listaCitasAgendadas[0].idAgendaFiscal)
            }
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'Se ha producido un error al listar las citas agendadas',
              'Aceptar'
            );
          },
        })
    );
  }

  protected cambiarCitaAgendada(idAgendaFiscal: string) {
    this.citaSeleccionada = this.listaCitasAgendadas.find((cita: any) => cita.idAgendaFiscal === idAgendaFiscal);
  }

  private obtenerDatosActaInconcurrencia() {
    this.suscripciones.push(
      this.actaInconcurrenciaTaService
        .obtenerActa(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: GenericResponseModel<ActaInconcurrenciaTA>) => {
            this.obteniendoInformacion = true;
            this.formulario.patchValue({
              incluye: !!resp.data.incluyeAgendaReprogramacion,
              fechaNuevaReunion: resp.data.fechaNuevaReunion,
              tipoCitacion: resp.data.tipoReunion,
              urlReunion: resp.data.urlReunion,
              lugar: resp.data.lugar,
              observaciones: resp.data.observaciones,
            });

             if (resp.data.incluyeAgendaReprogramacion) {
                this.formulario.get('citaAgendadaC')?.setValidators([Validators.required]);
                this.formulario.get('fechaNuevaReunion')?.setValidators([Validators.required]);
                this.formulario.get('tipoCitacion')?.setValidators([Validators.required]);               
              } else {
                this.formulario.get('citaAgendada')?.clearValidators();
                this.formulario.get('fechaNuevaReunion')?.clearValidators();
                this.formulario.get('tipoCitacion')?.clearValidators();                
              }
              
            if(resp.data.idAgendaFiscalCitacion && resp.data.idAgendaFiscalCitacion !== null){
              this.citaSeleccionada = this.listaCitasAgendadas.find((cita: any) => cita.idAgendaFiscal === resp.data.idAgendaFiscalCitacion);
            }
            
            this.formularioIncompleto = resp.data.formularioIncompleto;
            this.tieneMinimoUnSujetoSeleccionado = resp.data.sujetosCompletos;

            if (!this.formularioIncompleto) {
              this.formularioEditado(false);
            } else {
              this.formularioEditado(true);

              if (resp.data.sujetosCompletos && this.formulario.valid) {
                this.habilitarGuardar(true);
              } else {
                this.habilitarGuardar(false);
              }
            }

            this.obteniendoInformacion = false;
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'No se pudo obtener la información del trámite : <b>' +
                this.nombreTramite() +
                '</b>.',
              'Aceptar'
            );
          },
        })
    );
  }

  private guardarDatosActaIncocurrencia(): Observable<any> {
    let data: ActaInconcurrenciaTA = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      incluyeAgendaReprogramacion: this.formulario.get('incluye')?.value,
      idAgendaFiscalCitacion: this.citaSeleccionada.idAgendaFiscal,
      fechaNuevaReunion: formatearFechaHoraLocal(
        this.formulario.get('fechaNuevaReunion')?.value
      ),
      tipoReunion: this.formulario.get('tipoCitacion')?.value,
      lugar: this.formulario.get('lugar')?.value,
      observaciones: this.formulario.get('observaciones')?.value,
      urlReunion: this.formulario.get('urlReunion')?.value,
      formularioIncompleto: this.formularioIncompleto,
      sujetosCompletos: this.tieneMinimoUnSujetoSeleccionado,
    };

    return this.actaInconcurrenciaTaService.guardarActa(data).pipe(
      tap(() => {
        this.formularioIncompleto
          ? this.formularioEditado(true)
          : this.formularioEditado(false);
        this.modalDialogService.success(
          'Datos guardado correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' +
            this.nombreTramite() +
            '</b>.',
          'Aceptar'
        );
      }),
      map(() => 'válido'),
      catchError(() => {
        this.modalDialogService.error(
          'Error',
          'No se pudo guardar la información para el trámite: <b>' +
            this.nombreTramite() +
            '</b>.',
          'Aceptar'
        );
        return throwError(() => new Error('Error al guardar'));
      })
    );
  }
}
