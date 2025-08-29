import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-grafica',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './grafica.component.html',
  styleUrl: './grafica.component.scss'
})
export class GraficaComponent {

  @Input() datos: any;

  options: any;

  ngOnInit() {

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.options = {
      cutout: '60%',
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    };

  }

}
