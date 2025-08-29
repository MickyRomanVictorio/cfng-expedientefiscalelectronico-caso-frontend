import { Component, Input, OnInit } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  standalone: true,
  selector: 'app-barra-progreso-caso',
  templateUrl: './barra-progreso-caso.component.html',
  imports: [
    ProgressBarModule
  ]
})
export class BarraProgresoCasoComponent implements OnInit {

  @Input() inicio: number = 0;
  @Input() diasPlazo: number = 0;
  @Input() titulo: string = '';
  @Input() indicadorPlazo: number = 0;
  protected daysFromInit: number = 0;

  constructor() { }
  ngOnInit() {
    this.daysFromInit = this.inicio;
  }

  protected calculatePercentage(initialValue: number, difference: number) {
    if (initialValue > difference || initialValue === difference) { return 100 }
    return Math.round(initialValue / difference * 100);
  }
  protected getColor() {
    const value = this.indicadorPlazo;
    switch (value) {
      case 1:
        return 'greenbar';
      case 2:
        return 'yellowbar';
      case 3:
        return 'redbar';
      default:
        return 'yellowbar';
    }
  }
}
