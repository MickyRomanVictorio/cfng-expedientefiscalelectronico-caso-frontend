import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DetalleNotificacion } from '@interfaces/provincial/bandeja-tramites/DetalleNotificacion';
import { BandejaTramitesService } from '@services/provincial/bandeja-tramites/bandeja-tramites.service';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    EncabezadoModalComponent,
    TableModule,
    CapitalizePipe,
  ],
  selector: 'app-detalle-notificacion',
  templateUrl: './detalle-notificacion.component.html',
  styleUrls: ['./detalle-notificacion.component.scss'],
})
export class  DetalleNotificacionComponent implements OnInit, OnDestroy {
  public numeroCaso: string;
  public idCaso: string;
  public detallesNotificacion: DetalleNotificacion[] = [];
  public cargandoTabla: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    public referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private dialogService: DialogService,
    private bandejaService: BandejaTramitesService
  ) {
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.idCaso = this.configuracion.data?.idCaso;
  }

  ngOnDestroy(): void {}
  ngOnInit(): void {
    this.obtenerDetallesNotificacion();
  }

  private obtenerDetallesNotificacion(): void {
    this.detallesNotificacion = [];
    this.cargandoTabla = true;
    this.subscriptions.push(
      this.bandejaService.obtenerDetallesNotificacion(this.idCaso).subscribe({
        next: (resp) => {
          this.cargandoTabla = false;
          this.detallesNotificacion = resp;
          console.log(this.detallesNotificacion);
        },
        error: (error) => {
          console.log(error);
          this.cargandoTabla = false;
        },
      })
    );
  }

  public obtenerClaseDeCedula(name: string): string {
    return name.toLowerCase();
  }

  public obtenerClaseDeEstado(name: string): string {
    const nombreFormateado = name.replace(/\s+/g, '-');
    const resultado = nombreFormateado.toLowerCase();
    return resultado;
  }

  debeTenerBorde(estado: string): boolean {
    const estadosConBorde = [
      'derivado',
      'recuperado',
      'rechazado',
      'pendiente',
      'bajo-puerta',
      'motivado',
    ];
    return estadosConBorde.includes(estado);
  }
}
