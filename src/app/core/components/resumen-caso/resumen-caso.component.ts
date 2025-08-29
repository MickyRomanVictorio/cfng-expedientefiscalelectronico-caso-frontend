import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ResumenCasoModel } from '@core/interfaces/comunes/resumenCasoModel';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  standalone: true,
  imports: [CommonModule, CmpLibModule],
  selector: 'app-resumen-caso',
  templateUrl: './resumen-caso.component.html',
})
export class ResumenCasoComponent implements OnInit {
  hoverEffect = false;
  @Input() resumenes: ResumenCasoModel[] = [];

  ngOnInit(): void {}

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }
}
