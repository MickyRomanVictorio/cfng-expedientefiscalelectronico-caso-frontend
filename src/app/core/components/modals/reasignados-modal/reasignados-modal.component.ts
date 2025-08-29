import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  standalone: true,
  selector: 'app-reasignados-modal',
  templateUrl: './reasignados-modal.component.html',
  styleUrls: ['./reasignados-modal.component.scss'],
  imports: [TableModule, EncabezadoModalComponent],
})
export class ReasignadosModalComponent implements OnInit {
  //public tipo: TipoDescripcionModal = this.config.data.tipo || 'anulacion';
  public titulo;
  public descripcion;
  public numeroCaso;
  public idCaso;
  public contenido;

  parts = [
    {
      numero: '1',
      origen: 'Luis Ramírez',
      destino: 'Gabriel Lozada',
      tipoAsignacion: 'Permanente',
      fechaAsignacion: '8 marzo 2023',
    },
    {
      numero: '2',
      origen: 'Roxana Ampa Laura',
      destino: 'Luis Ramírez',
      tipoAsignacion: 'Temporal',
      fechaAsignacion: '20 marzo 2023',
    },
    {
      numero: '3',
      origen: 'Gabriel Lozada',
      destino: 'Roxana Ampa Laura',
      tipoAsignacion: 'Permanente',
      fechaAsignacion: '20 abril 2023',
    },
  ];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizer: DomSanitizer
  ) {
    this.titulo = this.config.data.titulo;
    this.descripcion = this.config.data.descripcion;
    this.numeroCaso = this.config.data.caso;
    this.idCaso = this.config.data.idCaso;
    this.contenido = this.config.data.contenido;
  }

  ngOnInit() {
    console.log('this.config.data.caso: ', this.config.data.caso);
  }

  getCrimes(crimes: any[]) {
    return crimes.toString().replaceAll(',', ', ');
  }

  caso() {
    if (!this.config.data?.caso) return '';

    const caso = this.config.data?.caso.split('-');
    const casoHtml = `Historial de reasignación - Caso: ${caso[0]}-<span class="text-secondary">${caso[1]}-${caso[2]}</span>-${caso[3]}`;
    // const casoHtml = `Delitos y Partes - Caso: ${ caso[0] }-<span class="text-secondary">${ caso[1] }-${ caso[2] }</span>-${ caso[3] }`
    return this.sanitizer.bypassSecurityTrustHtml(casoHtml);
  }

  close() {
    this.ref.close();
  }
}
