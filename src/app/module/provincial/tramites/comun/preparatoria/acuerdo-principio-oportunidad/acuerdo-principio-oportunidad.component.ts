import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import {
  DialogService,
} from 'primeng/dynamicdialog';
import { map, Observable, of, Subscription, tap, } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { AcuerdoReparatorioComponent } from '@core/components/modals/acuerdo-reparatorio/acuerdo-reparatorio.component';
import { ESTADO_REGISTRO, icono } from 'dist/ngx-cfng-core-lib';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { REPARACION_CIVIL } from '@core/types/reutilizable/reparacion-civil.type';
import { RegistrarReparacionCivilService } from '@core/services/reusables/otros/registrar-reparacion-civil.service';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';
import { capitalizedFirstWord } from '@core/utils/string';
@Component({
  standalone: true,
  imports: [CommonModule, ButtonModule, MensajeGenericoComponent],
  selector: 'app-acuerdo-principio-oportunidad',
  templateUrl: './acuerdo-principio-oportunidad.component.html',
  styleUrls: ['./acuerdo-principio-oportunidad.component.scss'],
  providers: [NgxCfngCoreModalDialogService]

})
export class AcuerdoPrincipioOportunidadComponent implements OnInit, OnDestroy {
  @Output() peticionParaEjecutar = new EventEmitter<() => any>();
  private readonly subscriptions: Subscription[] = [];
  public tramiteSeleccionado!: TramiteProcesal;
  public idCaso!: string;
  public idActoTramiteCaso!: string;
  public numeroCaso!: string;
  public idEstadoTramite!: number;
  public modoLectura!: boolean;
  public validGuardarTramite: boolean = false;
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  constructor(
    private readonly dialogService: DialogService,
    protected tramiteService: TramiteService,
    private readonly registrarReparacionCivilService: RegistrarReparacionCivilService,
    private readonly firmaIndividualService: FirmaIndividualService,
  ) { }

  ngOnInit() {
    this.modoLectura = this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;

    this.peticionParaEjecutar.emit(() => this.guardarFormulario())

    this.validarGuardarTramite(true);
    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.modoLectura = true;
          }
        }
      )
    )

    if(this.tramiteService.tramiteEnModoVisor){
      this.habilitarFirmar(false)
      this.modoLectura=true
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  verAcuerdos() {
    const ref = this.dialogService.open(
      AcuerdoReparatorioComponent,
      {
        showHeader: false,
        contentStyle: { padding: '0', 'border-radius': '15px' },
        data: {
          idCaso: this.idCaso,
          idActoTramiteCaso: this.idActoTramiteCaso,
          numeroCaso: this.numeroCaso,
          tipo: REPARACION_CIVIL.PRINCIPIO_OPORTUNIDAD,
          modoLectura: this.modoLectura
        }
      }
    );
    ref.onClose.subscribe((confirm) => {
      this.validarGuardarTramite();
    });
  }

  protected validarGuardarTramite(iniciando: boolean = false) {
    this.subscriptions.push(
      this.registrarReparacionCivilService.validarAcuerdoActaDeudores(this.idCaso, this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.validGuardarTramite = resp as boolean;
          if (iniciando) {
            if (this.validGuardarTramite) {
              this.formularioEditado(false);
            } else {
              this.formularioEditado(true);
            }
            this.habilitarGuardar(false);
          } else {
            this.formularioEditado(true);
            this.habilitarGuardar(this.validGuardarTramite);
          }
        },
        error: error => {
          this.modalDialogService.error("ERROR", "Error al intentar validar los datos de la reparación civil", 'Aceptar');
        }
      })
    );
  }

  protected guardarFormulario(): Observable<any> {
    return of(null).pipe(
      tap(() => {
        this.formularioEditado(false)
        this.habilitarGuardar(false)
        this.modalDialogService.success(
          'Datos guardado correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
          'Aceptar'
        );
      }),
      map(() => 'válido')
    );
  }

  protected icono(name: string): string {
    return icono(name);
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }
  protected habilitarFirmar(valor: boolean) {
    this.tramiteService.habilitarFirmar = valor
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }
}
