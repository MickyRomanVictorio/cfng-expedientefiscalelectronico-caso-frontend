import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

interface EstadoCaso {
  etapa: string;
  cantidad: number;
}
@Component({
  selector: 'app-estado-caso',
  standalone: true,
  imports: [CardModule,CommonModule],
  templateUrl: './estado-caso.component.html',
  styleUrl: './estado-caso.component.scss'
})
export class EstadoCasoComponent {

  @Input() estadosEnTramite: EstadoCaso[] = [];
  @Input() estadosResueltos: EstadoCaso[] = [];

}
