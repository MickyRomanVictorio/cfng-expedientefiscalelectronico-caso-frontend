import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-indicadores',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule],
  templateUrl: './indicadores.component.html',
  styleUrl: './indicadores.component.scss'
})
export class IndicadoresComponent {

  @Input() pendientes: number = 0;
  @Input() totales: number = 0;
  @Input() resueltos: number = 0;
  @Input() tramites: number = 0;
  @Output() cardSelected = new EventEmitter<number>();

  public onCardClick(tipo: number) {
    this.cardSelected.emit(tipo);
  }

}
