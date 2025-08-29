import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { PlazosEtapasDetalleDet } from '@modules/reportes/reportes/monitoreo-fiscal/models/carga-laboral.model';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-detalle-etapa',
  standalone: true,
  imports: [CommonModule, CmpLibModule, TableModule],
  templateUrl: './detalle-etapa.component.html',
  styleUrls: ['./detalle-etapa.component.scss'],
})
export class DetalleEtapaComponent {
  detalleEtapa: any[] = [];
  nombreFiscal: string = '';
  detallesAgrupados: any;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    protected iconUtil: IconUtil
  ) {
    if (this.config.data) {
      // this.detalleEtapa = this.config.data.detalles || [];
      // this.nombreFiscal = this.config.data.nombreFiscal || '';
      this.nombreFiscal = this.config.data.nombreFiscal;
      this.agruparDatos(this.config.data.detalles);
    }
    // this.agruparDatos(data.detalles);
  }

  private agruparDatos(detalles: PlazosEtapasDetalleDet[]) {
    // Inicializar un objeto para cada indicador
    const grupos = {
      VERDE: {
        indicador: 'VERDE',
        asignacion: 0,
        recepcion: 0,
        calificacion: 0,
        preliminarFiscal: 0,
        preliminarPnp: 0,
        preparatoria: 0,
        preparatoriaConcluido: 0,
        total: 0,
      },
      AMBAR: {
        indicador: 'AMBAR',
        asignacion: 0,
        recepcion: 0,
        calificacion: 0,
        preliminarFiscal: 0,
        preliminarPnp: 0,
        preparatoria: 0,
        preparatoriaConcluido: 0,
        total: 0,
      },
      ROJO: {
        indicador: 'ROJO',
        asignacion: 0,
        recepcion: 0,
        calificacion: 0,
        preliminarFiscal: 0,
        preliminarPnp: 0,
        preparatoria: 0,
        preparatoriaConcluido: 0,
        total: 0,
      },
    };
    // console.log('grupos: ', grupos);

    detalles.forEach((detalle) => {
      let indicador: 'VERDE' | 'AMBAR' | 'ROJO' | null = null;

      if (detalle.plazoVerde > 0) indicador = 'VERDE';
      else if (detalle.plazoAmbar > 0) indicador = 'AMBAR';
      else if (detalle.plazoRojo > 0) indicador = 'ROJO';

      if (indicador) {
        grupos[indicador].asignacion += detalle.asignacion;
        grupos[indicador].recepcion += detalle.recepcion;
        grupos[indicador].calificacion += detalle.calificacion;
        grupos[indicador].preliminarFiscal += detalle.preliminarFiscal;
        grupos[indicador].preliminarPnp += detalle.preliminarPnp;
        grupos[indicador].preparatoria += detalle.preparatoria;
        grupos[indicador].preparatoriaConcluido +=
          detalle.preparatoriaConcluido;
        grupos[indicador].total += detalle.total;
      }
    });

    this.detalleEtapa = Object.values(grupos);
    // console.log('detalleEtapa: ', this.detalleEtapa);
  }

  private sumarEnIndicador(indicador: string, detalle: PlazosEtapasDetalleDet) {
    const item = this.detalleEtapa.find((x) => x.indicador === indicador);
    if (item) {
      item.asignacion += detalle.asignacion;
      item.recepcion += detalle.recepcion;
      item.calificacion += detalle.calificacion;
      item.preliminarFiscal += detalle.preliminarFiscal;
      item.preliminarPnp += detalle.preliminarPnp;
      item.preparatoria += detalle.preparatoria;
      item.preparatoriaConcluido += detalle.preparatoriaConcluido;
      item.total += detalle.total;
    }
  }

  close() {
    this.ref.close();
  }
}
