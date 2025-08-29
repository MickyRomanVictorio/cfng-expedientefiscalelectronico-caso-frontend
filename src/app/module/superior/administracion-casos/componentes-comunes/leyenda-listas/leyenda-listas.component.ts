import { modules } from 'ngx-cfng-core-lib';
import { Component, Input } from "@angular/core";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-leyenda-listas',
    templateUrl: './leyenda-listas.component.html',
   standalone: true,
    styleUrls: ['./leyenda-listas.component.scss'],
  imports: [
    CommonModule,
  ]
    

    })
export class LeyendaListasSuperiorComponent {
 @Input() leyenda: any;
}