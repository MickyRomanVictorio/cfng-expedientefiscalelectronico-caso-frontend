import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CodigoAlertaTramiteEnum,
  CodigoDestinoAlertaTramiteEnum,
  TipoOrigenAlertaTramiteEnum
} from '@core/constants/constants';
import { AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { ProcesarElevacionActuados } from '@core/interfaces/provincial/tramites/comun/calificacion/elevacion-actuados/procesar-elevacion-actuados';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { capitalizedFirstWord } from '@core/utils/string';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import {
  ElevacionActuadosService
} from '@services/provincial/tramites/comun/calificacion/elevacion-actuados/elevacion-actuados.service';
import { TRAMITES } from 'ngx-cfng-core-lib';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, Observable, of, Subject, Subscription, switchMap, takeUntil, throwError } from 'rxjs';

const {
  SOLICITUD_ELEVACION_ACTUADOS,
  DISPOSICION_ELEVACION_ACTUADOS,
  DISPOSICION_IMPROCEDENCIA_ELEVACION_ACTUADOS,
  DISPOSICION_IMPROCEDENCIA_ELEVACION_ACTUADOS2,
} = TRAMITES
// El trámite "DISPOSICIÓN DE IMPROCEDENCIA DE ELEVACIÓN DE ACTUADOS" hacia refencia al componente "ElevacionActuadosComponent", se ha cambiado para "DefaultTramiteComponent"
@Component({
  standalone: true,
  imports: [
    CommonModule,
    DynamicDialogModule,
    DropdownModule,
    ReactiveFormsModule,
    FormsModule,
    NgxCfngCoreModalDialogModule
  ],
  selector: 'app-elevacion-actuados',
  templateUrl: './elevacion-actuados.component.html',
  styleUrls: ['./elevacion-actuados.component.scss'],
  providers: [DialogService, DynamicDialogRef]
})
export class ElevacionActuadosComponent implements OnInit {

  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() numeroCaso: string = '';
  @Output() peticionParaEjecutar = new EventEmitter<(datos: Object) => Observable<any>>();
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() deshabilitado: boolean = false;

  public fiscaliasSuperiores: any[] = [];
  public fiscaliaSuperiorSeleccionada: string | null = null;
  private readonly suscripciones: Subscription[] = [];
  private desuscribir$ = new Subject<void>();
  constructor(
    private readonly elevacionActuadosService: ElevacionActuadosService,
    protected readonly tramiteService: TramiteService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly alertaService: AlertaService,
    private firmaIndividualService: FirmaIndividualService
  ) {
  }

  ngOnInit(): void {
    this.firmaIndividualService.esFirmadoCompartidoObservable.pipe(
      takeUntil(this.desuscribir$)
    ).subscribe(
      (respuesta: any) => {
        if (respuesta.esFirmado) {
          const request: AlertaGeneralRequestDTO = {
            idCaso: this.idCaso,
            numeroCaso: this.numeroCaso,
            idActoTramiteCaso: this.idActoTramiteCaso,
            codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_SUP_ELE1,
            idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
            destino: CodigoDestinoAlertaTramiteEnum.SUP_FISCAL_SUPERIOR,
          };
          this.registrarAlertas(request);
        }
      }
    );
    this.peticionParaEjecutar.emit(_ => this.guardarFormulario());
    //
    this.listarFiscaliasSiEsDisposicion();
    setTimeout(() => this.obtenerFiscaliaSuperiorSeleccionada(), 1000);
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  get esDisposicionElevacion(): boolean {
    return this.tramiteSeleccionado?.idTramite === DISPOSICION_ELEVACION_ACTUADOS
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

  private guardarFormulario(): Observable<any> {
    if (!this.fiscaliaSuperiorSeleccionada || this.fiscaliaSuperiorSeleccionada === null) {
      this.modalDialogService.error(
        'Fiscalía Superior a elevar',
        'Para continuar debe seleccionar la Fiscalía Superior a elevar.',
        'Aceptar'
      );
      return throwError(() => new Error('Falta completar los datos del formulario Fiscalía Superior a elevar'));
    }
    const datosParaRegistrar: ProcesarElevacionActuados = {
      etapa: this.etapa,
      idActoTramiteCaso: this.idActoTramiteCaso,
      fiscaliaSuperior: this.fiscaliaSuperiorSeleccionada
    };
    return this.elevacionActuadosService.guardarDisposicionElevacionActuados(datosParaRegistrar).pipe(
      switchMap(_ => {
        this.formularioEditado(false);
        this.modalDialogService.success(
          'Datos guardado correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
          'Aceptar'
        );
        return of('válido');
      }),
      catchError(error => {
        this.modalDialogService.error(
          'Fiscalía Superior a elevar',
          'Ocurrió un error al intentar guardar la disposición. Por favor intente de nuevo.',
          'Aceptar'
        );
        return throwError(() => new Error('Ocurrió un error al intentar guardar la disposición. Por favor intente de nuevo'));
      })
    );
  }

  protected eventoSeleccionarFiscaliaSuperior(event: any): void {
    const tieneValor = !!event.value; // convierte a booleano true si tiene algo
    this.formularioEditado(true)
    this.habilitarGuardar(tieneValor);
    const distritoFiscal = this.fiscaliasSuperiores.find(item => item.codigoEntidad === event.value);
    this.elevacionActuadosService.setData(distritoFiscal.nombreEntidad);
  }

  private listarFiscaliasSiEsDisposicion(): void {
    this.esDisposicionElevacion && this.listarFiscaliasSuperiores()
  }

  private listarFiscaliasSuperiores(): void {
    this.suscripciones.push(
      this.elevacionActuadosService.listarFiscaliasSuperiores(this.etapa).subscribe({
        next: resp => {
          this.fiscaliasSuperiores = resp;
        }
      })
    )
  }

  private obtenerFiscaliaSuperiorSeleccionada(): void {
    if (this.esDisposicionElevacion) {
      this.suscripciones.push(
        this.elevacionActuadosService.obtenerFiscaliaSuperiorSeleccionada(this.idActoTramiteCaso, this.etapa).subscribe({
          next: idFiscalSuperior => {
            if (idFiscalSuperior && idFiscalSuperior !== null) {
              this.fiscaliaSuperiorSeleccionada = idFiscalSuperior.toString();
              const distritoFiscal = this.fiscaliasSuperiores.find(item => item.codigoEntidad === this.fiscaliaSuperiorSeleccionada);
              this.elevacionActuadosService.setData(distritoFiscal.nombreEntidad);
              this.habilitarGuardar(true);
            }
          },
          error: error => {
            this.modalDialogService.error('Error', 'No pudo obtenerse el fiscal superior seleccionado, por favor seleccione nuevamente.');
          }
        })
      )
    }
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }
}
