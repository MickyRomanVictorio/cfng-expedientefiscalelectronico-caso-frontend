import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ListaCuadernoEjecucionComponent } from './cuaderno-ejecucion/lista-cuaderno-ejecucion/lista-cuaderno-ejecucion.component';

@Component({
  selector: 'app-seguimiento-ejecucion',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    TooltipModule,
    OverlayPanelModule,
    ListaCuadernoEjecucionComponent
  ],
  templateUrl: './seguimiento-ejecucion.component.html',
  styleUrl: './seguimiento-ejecucion.component.scss'
})
export class SeguimientoEjecucionComponent {

  protected readonly iconUtil = inject(IconUtil)
  
}
