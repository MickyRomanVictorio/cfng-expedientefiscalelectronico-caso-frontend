import { Component, input, Input, OnInit, SimpleChanges } from '@angular/core';
import { obtenerIcono } from '@utils/icon';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule, DatePipe } from '@angular/common';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

enum TabActivoEnum {
  RESUMEN = 0,
  DETALLE = 1,
}

@Component({
  selector: 'app-bandeja',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    DateFormatPipe,
    ButtonModule,
    TableModule,
    ToastModule,
    TooltipModule,
  ],
  templateUrl: './bandeja.component.html',
  styleUrl: './bandeja.component.scss',
  providers: [MessageService],
})
export class BandejaComponent {
  @Input() tabActivo: number = 0;
  @Input() titleDocumento: string = 'Reporte de plazos fiscales del despacho';
  @Input() registrosBandeja: any[] = [];

  ngOnInit(): void {}

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  protected exportarPdfExcel(file: string) {}
}
