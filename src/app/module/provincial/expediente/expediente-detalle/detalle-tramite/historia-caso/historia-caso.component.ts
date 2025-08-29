import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {TabMenuModule} from "primeng/tabmenu";

@Component({
  selector: 'app-tabpanel-historial-caso',
  styles: [`
    :host { display: block; margin-top: 1rem }
  `],
  template: `
    <p-tabMenu [model]="items" class="cfe-tabs-view-anidado"></p-tabMenu>
    <router-outlet></router-outlet>
  `,
  imports: [
    RouterOutlet,
    TabMenuModule
  ],
  standalone: true
})
export class HistoriaCasoComponent {
  items = [
    {
      label: "Tramites Activos",
      routerLink: "activos"
    },
    {
      label: "Tramites Eliminados",
      routerLink: "eliminados"
    },
  ]
}
