import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';
import { IconAsset } from 'dist/ngx-cfng-core-lib';
import { DialogService } from 'primeng/dynamicdialog';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import {
  SeleccionarSujetoProcesalComponent
} from '@components/modals/cuadernos-incidentales/seleccionar-sujeto-procesal/seleccionar-sujeto-procesal.component';

import { Subscription } from 'rxjs';
import {
  ProlongacionPrisionPreventivaService
} from '@services/reusables/efe/prolongacion-prision-preventiva/prolongacion-prision-preventiva.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import {
  RequerimientoProlongacionRequest,
  ResultadoProlongacionPrisionPreventivaInterface
} from '@interfaces/reusables/prolongacion-prision-preventiva/ProlongacionPrisionPreventivaRequest';
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service';

@Component({
  selector: 'app-requerimiento-prolongacion-prision-preventiva',
  standalone: true,
  imports: [
    CalendarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './requerimiento-prolongacion-prision-preventiva.component.html',
  styleUrl: './requerimiento-prolongacion-prision-preventiva.component.scss'
})
export class RequerimientoProlongacionPrisionPreventivaComponent implements OnInit, OnDestroy {

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
  protected selectedSujetos: ResultadoProlongacionPrisionPreventivaInterface[] = [];

  constructor(protected iconAsset: IconAsset,
              private dialogService: DialogService,
              private tramiteService: TramiteService,
              private modalDialogService: NgxCfngCoreModalDialogService,
              private firmaIndividualService: FirmaIndividualService,
              private prolongacionPrisionPreventivaService: ProlongacionPrisionPreventivaService) {
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
    const ref = this.dialogService.open(SeleccionarSujetoProcesalComponent, {
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

    ref.onClose.subscribe((data: ResultadoProlongacionPrisionPreventivaInterface[]) => {
      this.selectedSujetos = data
      this.cantidadSujetosTramite = this.selectedSujetos.length ?? this.cantidadSujetosTramite;
      if (this.cantidadSujetosTramite > 0) this.habilitarGuardar(true)
    });
  }

  protected guardarFormulario(): void {
    let request: RequerimientoProlongacionRequest = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetosResultado: this.selectedSujetos
    }

    this.subscriptions.push(
      this.prolongacionPrisionPreventivaService.registrarTramite(request).subscribe({
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
