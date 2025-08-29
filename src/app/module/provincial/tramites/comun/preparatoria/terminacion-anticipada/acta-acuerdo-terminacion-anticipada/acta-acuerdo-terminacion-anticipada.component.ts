import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SujetosTerminacionAnticipadaComponent } from '@core/components/modals/sujetos-terminacion-anticipada/sujetos-terminacion-anticipada.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { CmpLibModule } from 'dist/cmp-lib';
import { icono, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { CalendarModule } from 'primeng/calendar';
import { DialogService } from 'primeng/dynamicdialog';
import { catchError, map, Observable, Subscription, tap, throwError } from 'rxjs';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { capitalizedFirstWord } from '@core/utils/string';
import { ActaAcuerdoTerminacionAnticipadaService } from '@core/services/provincial/tramites/comun/preliminar/terminacion-anticipada/acta-acuerdo-terminacion-anticipada.service';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ActaTramiteGenericoComponent } from '@modules/provincial/tramites/genericos/acta-tramite-generico/acta-tramite-generico.component';
import { FirmaDigitalClienteService } from 'dist/ngx-cfng-core-firma-digital';
@Component({
  selector: 'app-acta-acuerdo-terminacion-anticipada',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    FormsModule,
    CmpLibModule,
    DateMaskModule,
    ValidationModule,
    MensajeCompletarInformacionComponent,
    CheckboxModule,
    ActaTramiteGenericoComponent
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './acta-acuerdo-terminacion-anticipada.component.html',
  styleUrl: './acta-acuerdo-terminacion-anticipada.component.scss'
})
export class ActaAcuerdoTerminacionAnticipadaComponent {

  private readonly subscriptions: Subscription[] = []

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  private readonly fb = inject(FormBuilder)

  protected readonly actaAcuerdoTerminacionAnticipadaService = inject(ActaAcuerdoTerminacionAnticipadaService)

  private readonly firmaIndividualService =  inject(FirmaIndividualService)

  private readonly dialogService = inject(DialogService)

  private readonly tramiteService = inject(TramiteService)

  protected readonly firmaDigitalClienteService = inject(FirmaDigitalClienteService)

  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>();

  protected formRegistro: FormGroup

  public idCaso!: string

  public numeroCaso!: string

  public idActoTramiteCaso!: string

  public idEstadoTramite!: number

  public idEtapa!: string

  public etapa!: string

  public tramiteSeleccionado: TramiteProcesal | null = null

  protected sujetosProcesalesSeleccionadosIds: string[] = []

  private valoresGuardados!: any

  private valoresSujetosGuardados!: any

  public modoLecturaSujeto: boolean = false

  public seHanGuardadosDatos: boolean = false

  constructor(
  ) {
    this.formRegistro = this.fb.group({
      observaciones: ['', [Validators.maxLength(200)]],
      actaEscaneada: [false]
    });
  }
  ngOnInit(): void {

    this.obtenerDatosGuardadosTramite()

    this.peticionParaEjecutar.emit(() => this.guardarFormulario())

    if(this.tramiteEnModoVisor) {
      this.formRegistro.disable()
      this.habilitarFirmar(false)
      this.modoLecturaSujeto = true
    }

    this.formRegistro.valueChanges.subscribe(() => {
      this.activarGuardarTramite()
    });

    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.formRegistro.disable()
            this.modoLecturaSujeto = true
          }
        }
      )
    )

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected obtenerDatosGuardadosTramite(): void {
    this.subscriptions.push(
      this.actaAcuerdoTerminacionAnticipadaService
        .obtenerDatosTramite(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: any) => {
            if (resp) {
              this.formRegistro.get('observaciones')?.setValue(resp.observacion ?? '')
              this.sujetosProcesalesSeleccionadosIds = resp.sujetos as string[]
              //VALIDAR CAMBIOS GENERADOS
              this.valoresGuardados = this.formRegistro.getRawValue()
              this.valoresSujetosGuardados = resp.sujetos as string[]
              if(this.sujetosProcesalesSeleccionadosIds.length>0){
                this.formularioEditado(false);
                this.habilitarGuardar(false);
              }
            }
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'Se ha producido un error al obtener los datos guardados del trámite',
              'Aceptar'
            );
          },
        })
    );

  }

  protected abrirModalAgregarEditarSujeto() {
      const ref = this.dialogService.open(SujetosTerminacionAnticipadaComponent, {
        showHeader: false,
        data:
        { idCaso: this.idCaso,
          idActoTramiteCaso:this.idActoTramiteCaso,
          numeroCaso:this.numeroCaso,
          etapa: this.etapa,
          sujetosProcesalesSeleccionadosIds:this.sujetosProcesalesSeleccionadosIds,
          modoLectura:this.modoLecturaSujeto,
          idTramite:this.idTramite
        },
        contentStyle: { padding: '0', 'border-radius': '15px' }
      });

      ref.onClose.subscribe((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.sujetosProcesalesSeleccionadosIds = data;
          this.activarGuardarTramite()
        }
      });
  }

  protected requestTramite():any{
    return {
      idActoTramiteCaso:this.idActoTramiteCaso,
      observacion:this.formRegistro.get('observaciones')?.value,
      sujetos:this.sujetosProcesalesSeleccionadosIds,
      flgActaEscaneada:this.formRegistro.get('actaEscaneada')?.value
    };
  }

  protected guardarFormulario(): Observable<any> {
    if (this.formRegistro.invalid || this.sujetosProcesalesSeleccionadosIds.length == 0) {
      this.formRegistro.markAllAsTouched();
      return throwError(() => new Error('Error de validación de campos'));
    }

    return this.actaAcuerdoTerminacionAnticipadaService.registrarEditarTramite(this.requestTramite()).pipe(
      tap(() => {
        this.formularioEditado(false)
        this.modalDialogService.success(
          'Datos guardado correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
          'Aceptar'
        );
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


  protected counterReportChar(): number {
    return this.formRegistro.get('observaciones')!.value !== null
      ? this.formRegistro.get('observaciones')!.value.length
      : 0;
  }

  protected validarCambiosForm(): boolean {
    return JSON.stringify(this.valoresGuardados) !== JSON.stringify(this.formRegistro.getRawValue());
  }

  protected validarCambiosSujetos(): boolean {
    return JSON.stringify(this.valoresSujetosGuardados) !== JSON.stringify(this.sujetosProcesalesSeleccionadosIds);
  }

  protected activarGuardarTramite(): void {
    if(this.seHanGuardadosDatos){
      if(this.validarCambiosForm() || this.validarCambiosSujetos()){
        this.formularioEditado(true);
        this.habilitarGuardar(true)
      }
    }
    else if(this.formRegistro.valid && this.sujetosProcesalesSeleccionadosIds.length > 0){
      this.formularioEditado(true);
      this.habilitarGuardar(true)
    }
    else{
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

  protected actaEscaneadaFirmada(data: any): void {
    this.formRegistro.disable()
    this.modoLecturaSujeto = true
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  protected habilitarFirmar(valor: boolean) {
    this.tramiteService.habilitarFirmar = valor
  }

  protected icono(name: string): string {
      return icono(name);
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }
  protected get idTramite(): string  {
    return this.tramiteSeleccionado?.idTramite!
  }
}
