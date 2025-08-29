import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-consulta-casos-elevados',
  template: `
    <router-outlet></router-outlet>
  `,
  imports: [
    RouterOutlet
  ]
})
export class ConsultaCasosElevadosComponent{
}
