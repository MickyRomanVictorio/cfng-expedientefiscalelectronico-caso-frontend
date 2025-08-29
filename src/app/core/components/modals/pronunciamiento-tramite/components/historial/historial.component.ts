import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { JsonPipe } from '@angular/common';
import { Component, input, OnInit, output, signal } from '@angular/core';
import { IconUtil } from 'ngx-cfng-core-lib';
import { TableModule } from 'primeng/table';
import { PronunciamientoTramiteService } from '@core/services/superior/casos-elevados/pronunciamiento-tramite.service';
import {capitalized} from "@utils/string";
import {ButtonDirective} from "primeng/button";
import {
  TramiteActivo
} from "@interfaces/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/tramites-activos/tramites-activos.interface";
import {
  VerSujetosProcesalesTramiteComponent
} from "@modules/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/components/ver-sujetos-procesales-tramite/ver-sujetos-procesales-tramite.component";
import {DialogService} from "primeng/dynamicdialog";
import {
  HistorialTramiteModalComponent
} from "@components/modals/historial-tramite-modal/historial-tramite-modal.component";
import {
  PreviewResolucionModalComponent
} from "@modules/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/tramites-activos/preview-resolucion-modal/preview-resolucion-modal.component";
import {Expediente} from "@utils/expediente";
import {GestionCasoService} from "@services/shared/gestion-caso.service";

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    TableModule,
    CmpLibModule,
    ButtonDirective
  ],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss'
})
export class HistorialComponent implements OnInit {

  public idCaso = input<string>('');

  protected datos = signal<any[]>([]);
  public seleccionado = output<any>();
  private caso!: Expediente;

  constructor(
    protected readonly iconUtil: IconUtil,
    private readonly pronunciamientoTramiteService:PronunciamientoTramiteService,
    private readonly dialogService: DialogService,
    private readonly gestionCasoService: GestionCasoService,
  ) { }

  ngOnInit(): void {
    this.pronunciamientoTramiteService.obtenerPestaniaHistorial( this.idCaso() ).subscribe({
      next: (rs) => {
       this.datos.set(rs.registrosHistorial?rs.registrosHistorial:[]);
      }
    });
  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  protected eventoSeleccionar(datos:any):void{
    this.seleccionado.emit(datos);
  }

  protected readonly capitalized = capitalized;
  protected idIngresoPorMesa: number = 1366;
  protected idIngresoPorFical: number = 1365;

  protected formatoFechaF(f: string): string {
    if (!f) return '-';
    const d = new Date(f);
    if (isNaN(d.getTime())) return '-';
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = d.toLocaleString('es-ES', { month: 'short' });
    const anio = d.getFullYear();
    let horas = d.getHours();
    const min = d.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
    horas = horas % 12;
    horas = horas ? horas : 12;
    const horaStr = horas.toString().padStart(2, '0');
    return `${dia} ${mes} ${anio} ${horaStr}:${min} ${ampm}`;
  }

  protected verSujetosProcesalesTramite(tramiteActivo: TramiteActivo): void {
    this.dialogService.open(VerSujetosProcesalesTramiteComponent, {
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        idActoTramiteCaso: tramiteActivo.idActoTramiteCaso,
      },
    });
  }

  protected verHistorialTramite(tramite: any): void {
    this.caso = this.gestionCasoService.casoActual;
    this.dialogService.open(HistorialTramiteModalComponent, {
      showHeader: false,
      contentStyle: { 'border-radius': '15px' },
      data: {
        idCaso: this.caso.idCaso,
        numeroCaso: this.caso.numeroCaso,
        idTramite: tramite.idActoTramiteCaso,
        titulo: tramite.descTramite,
      },
    });
  }

  protected verDocumentosAdjuntos(tramiteActivo: TramiteActivo): void {
    this.dialogService.open(PreviewResolucionModalComponent, {
      showHeader: false,
      width: '1000px',
      height: '95%',
      contentStyle: {
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      },
      data: {
        idActoTramiteCaso: tramiteActivo.idActoTramiteCaso,
        titulo: 'RESOLUCIÓN ADJUNTA',
      }
    })

  }

  protected async previsualizarTramite(tramiteActivo: TramiteActivo) {
    const tramite = {
      idActoTramiteCaso: tramiteActivo.idActoTramiteCaso,
      isTramiteEnModoEdicion: false
    }
    this.seleccionado.emit(tramite);
  }

  protected async editarTramite(tramiteActivo: TramiteActivo) {
    const tramite = {
      idActoTramiteCaso: tramiteActivo.idActoTramiteCaso,
      isTramiteEnModoEdicion: true
    }
    this.seleccionado.emit(tramite);
  }

  protected async eliminarTramite(tramiteActivo: TramiteActivo) {
    console.log('eliminarTramite', tramiteActivo)
  }

}
