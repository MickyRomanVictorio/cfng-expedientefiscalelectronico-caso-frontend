import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CmpLibModule } from 'dist/cmp-lib';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-bandeja-superior',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    DateFormatPipe,
    SelectButtonModule,
    TableModule,
    ToastModule,
    TooltipModule,
  ],
  templateUrl: './bandeja-superior.component.html',
  styleUrl: './bandeja-superior.component.scss',
})
export class BandejaSuperiorComponent {
  @Input() registrosBandeja: any[] = [];
  @Input() titleDocumento: string = 'Reporte de plazos fiscales del despacho';

  public removeInvisibleCharacters(str: string): string {
    return str.replace(/[\u200B-\u200D\uFEFF]/g, '');
  }

}
