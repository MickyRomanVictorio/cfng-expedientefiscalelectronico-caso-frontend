import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MetaInfo } from '@core/interfaces/comunes/casosFiscales';
import { BadgeModule } from 'primeng/badge';
import { FileInfoCaso } from '../file-info-caso/file-info-caso.component';

@Component({
  standalone: true,
  selector: 'app-pendientes-caso',
  templateUrl: './pendientes-caso.component.html',
  imports: [
    CommonModule,
    BadgeModule,
    FileInfoCaso,
  ]

})
export class PendientesCasoComponent {

  @Input()
  public metaInfo: MetaInfo[] = [
    { nombre: '', total: 0, nuevos: 0 },
    { nombre: '', total: 0, nuevos: 0 },
    { nombre: '', total: 0, nuevos: 0 }
  ];
  protected mostrarDetalle:boolean = false;

  constructor() { }

  protected eventoMostrarDetalle(event: Event) {
    event.stopPropagation();
    this.mostrarDetalle = !this.mostrarDetalle;
  }

  get totalPendientes() {
    return this.metaInfo[0].nuevos! + this.metaInfo[1].nuevos! + this.metaInfo[2].nuevos!;
  }

}
