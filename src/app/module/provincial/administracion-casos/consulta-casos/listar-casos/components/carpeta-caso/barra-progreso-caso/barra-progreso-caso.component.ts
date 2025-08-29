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
  @Input() plazos: any[] = [];

  constructor() { }
  ngOnInit() {
  }

  protected calculatePercentage(initialValue: number, difference: number) {
    if (initialValue > difference || initialValue === difference) { return 100 }
    return Math.round(initialValue / difference * 100);
  }
  protected getColor(id: number) {
    const value = this.plazos[id].indSemaforo;
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
