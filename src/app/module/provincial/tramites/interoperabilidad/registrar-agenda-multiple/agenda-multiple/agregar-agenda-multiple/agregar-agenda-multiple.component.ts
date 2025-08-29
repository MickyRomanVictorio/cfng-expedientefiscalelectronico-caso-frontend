import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { MaestroService } from '@core/services/shared/maestro.service';
import { MaestroInterface } from '@core/interfaces/comunes/maestro-interface';
import { JuzgadoPJInterface } from '@core/interfaces/comunes/juzgado-pj-interface';
import { CatalogoInterface } from '@core/interfaces/comunes/catalogo-interface';
import { AgendaNotificacionInterface } from '@core/interfaces/reusables/agenda-multiple/agenda-multiple.interface';
import { v4 as uuidv4 } from 'uuid';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { DateMaskModule } from '@directives/date-mask.module';

@Component({
  selector: 'app-agregar-agenda-multiple',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RadioButtonModule,
    InputTextareaModule,
    DateMaskModule,
    NgxCfngCoreModalDialogModule
  ],
  templateUrl: './agregar-agenda-multiple.component.html',
  styleUrl: './agregar-agenda-multiple.component.scss'
})
export class AgregarAgendaMultipleComponent implements OnInit, OnChanges {

  private readonly suscriptions: Subscription[] = [];
  protected readonly ID_TIPO_ACTIVIDAD_AGENDA_VIRTUAL: number = 1223;
  protected tipoActividadAgenda: CatalogoInterface[] = [];
  protected distritoPoderJudicial: MaestroInterface[] = [];
  protected juzgadoPoderJudicial: JuzgadoPJInterface[] = [];
  protected longitudMaximaObservaciones: number = 200;

  @Input()
  public agendasMultiples: AgendaNotificacionInterface[] = [];

  @Input()
  public modoLectura: boolean = false;

  @Input()
  public mostrarFechaNotificacion: boolean = false;

  @Input()
  public esEditableRecibido: boolean = false;

  @Input()
  public agendaNotificacion!: AgendaNotificacionInterface;

  @Output()
  public fechaNotificacion = new EventEmitter<string>();

  @Output()
  public validarListaAgenda = new EventEmitter<boolean>();
  
  protected formAgendaMultiple: FormGroup = new FormGroup({
    idRegistroTabla: new FormControl(null),
    idAgendaFiscal: new FormControl(null),
    fechaNotificacion: new FormControl(null),
    fechaHoraAudicencia: new FormControl(null, [Validators.required]),
    idTipoActividadAgenda: new FormControl(null, [Validators.required]),
    tipoActividadAgenda: new FormControl(null),
    urlReunion: new FormControl(null, [Validators.maxLength(250)]),
    idDistritoPJ: new FormControl(null, [Validators.required]),
    idJuzgadoPJ: new FormControl(null, [Validators.required]),
    observacion: new FormControl(null, [Validators.maxLength(this.longitudMaximaObservaciones)]),
    estadoAgendaFiscal: new FormControl('1'), //1 activo 0 inactivo o eliminado
  })

  constructor(
    private readonly maestroService: MaestroService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ( changes['modoLectura']?.currentValue ) this.deshabilitarFormulario();
    setTimeout(()=> { if ( changes['esEditableRecibido']?.currentValue ) this.obtenerFechaNotificacionRegistrado(); } , 0);
  }

  ngOnInit(): void {
    this.listarDistritoPoderJudicial();
    this.listarTipoActividadAgenda();
  }

  get textoAccionARealizar(): string {
    return this.modoLectura ? 'Aceptar': 'Agregar';
  }

  get cantidadCaracteresObservacion(): number {
    return this.formAgendaMultiple.get('observacion')!.value === null ? 0 : this.formAgendaMultiple.get('observacion')!.value.length;
  }

  get formularioValido(): boolean {
    return this.formAgendaMultiple.valid;
  }

  get fechaHoraAudienciaDuplicado(): boolean {
    return this.agendasMultiples.some(objeto =>
      objeto.fechaHoraAudicencia === this.formAgendaMultiple.get('fechaHoraAudicencia')!.value
    );
  }

  private obtenerFechaNotificacionRegistrado(): void {
    this.formAgendaMultiple.get('fechaNotificacion')?.setValue( this.agendasMultiples[0].fechaNotificacion );
  }

  private listarDistritoPoderJudicial(): void {
    this.suscriptions.push(
      this.maestroService.getDistritoJudicial().subscribe({
          next: resp => {
            this.distritoPoderJudicial = resp.data;
            if ( this.modoLectura ) this.cargarDatosAgendaNotificacion();
          },
          error: ( error ) => {
            this.distritoPoderJudicial = [];
        }})
      )
  }

  private listarJuzgadoPoderJudicial(idDistritoPJ: number): void {
    this.suscriptions.push(
      this.maestroService.getJuzgadosPorDistritoJudicial( idDistritoPJ ).subscribe({
          next: resp => {
            this.juzgadoPoderJudicial = resp.data;
            if ( this.modoLectura ) this.formAgendaMultiple.patchValue({idJuzgadoPJ: this.agendaNotificacion.idJuzgadoPJ});
          },
          error: ( error ) => {
            this.juzgadoPoderJudicial = [];
        }})
      )
  }

  private listarTipoActividadAgenda(): void {
    this.suscriptions.push(
      this.maestroService.getCatalogo('ID_N_TIPO_ACTIV_AGENDA').subscribe({
          next: resp => {
            this.tipoActividadAgenda = resp.data;
            this.cargarDatosInicialesTipoActividad();
          },
          error: ( error ) => {
            this.tipoActividadAgenda = [];
        }})
      )
  }

  private cargarDatosAgendaNotificacion(): void {
    if ( this.agendaNotificacion ) {
      this.formAgendaMultiple.patchValue({
        fechaHoraAudicencia: this.agendaNotificacion.fechaHoraAudicencia,
        urlReunion: this.agendaNotificacion.urlReunion,
        observacion: this.agendaNotificacion.observacion,
        idDistritoPJ: this.agendaNotificacion.idDistritoPJ
      });
      this.listarJuzgadoPoderJudicial( this.agendaNotificacion.idDistritoPJ )
    }
  }

  protected alCambiarFechaNotificacion(event: any): void {
    this.fechaNotificacion.emit(event);
  }

  private deshabilitarFormulario(): void {
    this.formAgendaMultiple.get('fechaNotificacion')?.disable();
    this.formAgendaMultiple.get('fechaHoraAudicencia')?.disable();
    this.formAgendaMultiple.get('idTipoActividadAgenda')?.disable();
    this.formAgendaMultiple.get('urlReunion')?.disable();
    this.formAgendaMultiple.get('idDistritoPJ')?.disable();
    this.formAgendaMultiple.get('idJuzgadoPJ')?.disable();
    this.formAgendaMultiple.get('observacion')?.disable();
  }

  private cargarDatosInicialesTipoActividad(): void {
    if ( this.modoLectura ) {
      this.formAgendaMultiple.patchValue({
        idTipoActividadAgenda: this.agendaNotificacion.idTipoActividadAgenda,
        tipoActividadAgenda: this.agendaNotificacion.tipoActividadAgenda,
       });
    } else {
      this.formAgendaMultiple.patchValue({
        idTipoActividadAgenda: this.ID_TIPO_ACTIVIDAD_AGENDA_VIRTUAL,
        tipoActividadAgenda: this.tipoActividadAgenda.find(item => item.id === this.ID_TIPO_ACTIVIDAD_AGENDA_VIRTUAL)?.coDescripcion
       });
    }
  }

  private resetearFormularioDespuesDeAgregar(): void {
    this.formAgendaMultiple.patchValue({
      idRegistroTabla: null,
      urlReunion: null,
      observacion: null
     });
     this.formAgendaMultiple.get('fechaHoraAudicencia')?.reset();
  }

  protected alCambiarDistritoJudicial(event: any): void {
    this.listarJuzgadoPoderJudicial( event.value );
  }

  protected alCambiarTipoActividadAgenda(event: any): void {
    this.formAgendaMultiple.get('tipoActividadAgenda')?.setValue(this.tipoActividadAgenda.find(item => item.id === event.value)?.coDescripcion )
    if ( event.value !== this.ID_TIPO_ACTIVIDAD_AGENDA_VIRTUAL ) this.formAgendaMultiple.get('urlReunion')?.setValue(null);
  }

  protected validarAgregarAgendaNotificacion(): void {
    if ( this.fechaHoraAudienciaDuplicado ) this.abrirModalFechaHoraDuplicado();
    else this.agregarAgendaNotificacion();
  }

  private abrirModalFechaHoraDuplicado(): void {
    const dialog = this.modalDialogService.question("Fecha y hora de agenda duplicada", "La fecha y hora de programación que está ingresando ya se encuentra registrada. ¿Está seguro que desea realizar la siguiente acción? ", 'Aceptar', 'Cancelar');
    dialog.subscribe({
      next:( resp: CfeDialogRespuesta )=> {
         if ( resp === CfeDialogRespuesta.Confirmado ) this.agregarAgendaNotificacion();
      }
    });
  }

  private agregarAgendaNotificacion(): void {
    this.formAgendaMultiple.get('idRegistroTabla')?.setValue( uuidv4() );
    this.agendasMultiples.push( this.formAgendaMultiple.getRawValue() );
    this.resetearFormularioDespuesDeAgregar();
    this.cargarDatosInicialesTipoActividad();
    this.validarListaAgenda.emit(true)
  }

}
