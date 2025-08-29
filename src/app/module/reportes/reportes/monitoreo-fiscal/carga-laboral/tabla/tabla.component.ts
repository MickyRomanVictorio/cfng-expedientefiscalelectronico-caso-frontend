import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { TableModule } from 'primeng/table';

type ExportFormat = 'PDF' | 'Excel';
interface InfoTable {
  fechaInicio: any;
  fechaFin: any;
  distritoFiscal: any;
  dependenciaFiscal: any;
  getTotalResueltos: () => number | any;
  getPorcentajeResueltosFormateado: () => string | any;
  getTotalEnTramite: () => number | any;
  getPorcentajeEnTramiteFormateado: () => string | any;
  getGrandTotal: () => number | any;
}
const infoTablaDefault = {
  fechaInicio: '',
  fechaFin: '',
  distritoFiscal: '',
  dependenciaFiscal: '',
  getTotalResueltos: () => false,
  getPorcentajeResueltosFormateado: () => false,
  getTotalEnTramite: () => false,
  getPorcentajeEnTramiteFormateado: () => false,
  getGrandTotal: () => false,
};

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, TableModule, CmpLibModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.scss',
})
export class TablaComponent {
  data = input<any>();
  executeExport = input<(value: ExportFormat) => void>();
  tablaInfo = input<InfoTable>(infoTablaDefault);

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  exportarTipo(value: ExportFormat) {
    if (this.executeExport()) {
      this.executeExport()!(value);
    }
  }
}
