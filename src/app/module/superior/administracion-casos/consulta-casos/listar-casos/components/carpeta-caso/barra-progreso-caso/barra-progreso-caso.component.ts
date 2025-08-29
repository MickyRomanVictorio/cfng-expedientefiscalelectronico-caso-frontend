import { Component, Input, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  standalone: true,
  selector: 'app-barra-progreso-caso',
  templateUrl: './barra-progreso-caso.component.html',
  styleUrls: ['./barra-progreso-caso.component.scss'],
  imports: [
    CommonModule,
    ProgressBarModule
  ]
})
export class BarraProgresoCasoComponent implements OnInit {

  @Input() inicio!: number;
  @Input() diasPlazo!: number;
  @Input() titulo!: string;
  @Input() indicadorPlazo!: number;


  protected daysFromInit = 0;
  protected display = true;

  ngOnInit() {
    if (this.diasPlazo < 1) {
      this.display = false;
    }
    this.daysFromInit = this.inicio
  }

  calculatePercentage(initialValue:number, difference:number) {
    if(initialValue > difference || initialValue === difference ){ return 100 }
    return Math.round(initialValue / difference * 100);
  }

  getColor() {
    const value = this.indicadorPlazo;
    //console.log("value", value);
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
