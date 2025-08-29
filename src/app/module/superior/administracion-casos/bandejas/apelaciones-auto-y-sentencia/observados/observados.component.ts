import { Component } from '@angular/core';
import { CasosObservadosComponent } from '../../casos-observados/casos-observados.component';

@Component({
  selector: 'app-observados',
  standalone: true,
  imports: [
    CasosObservadosComponent
  ],
  template: `
    <app-casos-observados></app-casos-observados>
  `
})
export class ObservadosComponent {
}
