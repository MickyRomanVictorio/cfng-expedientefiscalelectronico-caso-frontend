import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { IconAsset } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { SeleccionarSujetosProcesalesComponent } from './seleccionar-sujetos-procesales/seleccionar-sujetos-procesales.component';
import { RequerimientoAdecuacionPrisionPreventivaService } from '@core/services/provincial/tramites/comun/preparatoria/requerimiento-adecuacion-prision-preventiva.service';
import { RequerimientoAdecuacionRequest, SujetoProcesalesAdecuacion } from '@core/interfaces/provincial/tramites/comun/preparatoria/requerimiento-adecuacion-prision-preventiva';

@Component({
  selector: 'app-requerimiento-adecuacion-prision-preventiva',
  standalone: true,
  imports: [
    CalendarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './requerimiento-adecuacion-prision-preventiva.component.html',
  styleUrl: './requerimiento-adecuacion-prision-preventiva.component.scss'
})
export class RequerimientoAdecuacionPrisionPreventivaComponent implements OnInit, OnDestroy {

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idEstadoTramite!: number;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() idActoTramiteCaso!: string;

  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  protected subscriptions: Subscription[] = [];
  protected cantidadSujetosTramite: number = 0;
  protected selectedSujetos: SujetoProcesalesAdecuacion[] = [];
  protected idSujetosAdecuacion: string[] = []

  protected readonly requerimientoService = inject(RequerimientoAdecuacionPrisionPreventivaService)
  protected readonly iconAsset = inject(IconAsset)
  protected readonly dialogService = inject(DialogService)
  protected readonly firmaIndividualService = inject(FirmaIndividualService)
  protected readonly tramiteService = inject(TramiteService)
  protected readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  constructor() {
  }

  ngOnInit(): void {
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());

    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.tramiteEnModoEdicion = false;
          }
        }
      )
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected habilitarFirmar(valor: boolean) {
    this.tramiteService.habilitarFirmar = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  public openModalSujetos(): void {
    const ref = this.dialogService.open(SeleccionarSujetosProcesalesComponent, {
      showHeader: false,
      closeOnEscape: false,
      data: {
        numeroCaso: this.numeroCaso,
        idCaso: this.idCaso,
        idActoTramiteCaso: this.idActoTramiteCaso,
        listSujetosProcesales: this.selectedSujetos,
        tramiteEnModoEdicion: this.tramiteEnModoEdicion,
        idEstadoTramite: this.idEstadoTramite
      },
    });

    ref.onClose.subscribe((data: SujetoProcesalesAdecuacion[]) => {
      this.selectedSujetos = data
      this.cantidadSujetosTramite = this.selectedSujetos.length ?? this.cantidadSujetosTramite;

      this.idSujetosAdecuacion = []
      data.forEach(d => this.idSujetosAdecuacion.push(d.idActoTramiteResultadoSujeto))

      if (this.cantidadSujetosTramite > 0) this.habilitarGuardar(true)
    });
  }

  protected guardarFormulario(): void {
    let request: RequerimientoAdecuacionRequest = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetosAdecuacion: this.idSujetosAdecuacion
    }

    this.subscriptions.push(
      this.requerimientoService.guardarRequerimientoAdecuacion(request).subscribe({
        next: resp => {
          this.formularioEditado(false)
          this.habilitarFirmar(true)
          this.modalDialogService.success(
            'Datos guardado correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
            'Aceptar'
          );
        },
        error: (error) => {
          this.modalDialogService.error(
            'Error en el servicio',
            error.error.message,
            'Aceptar'
          );
        }
      })
    );
  }
}
