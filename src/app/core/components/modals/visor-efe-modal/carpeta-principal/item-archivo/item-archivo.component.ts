import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatosArchivo } from '@core/interfaces/visor/visor-interface';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'dist/cmp-lib';
import { IconAsset } from 'dist/ngx-cfng-core-lib';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { BotonCargoComponent } from '../boton-cargo/boton-cargo.component';
import { CuadernoJuzgamientoComponent } from './cuaderno-juzgamiento/cuaderno-juzgamiento.component';
import { da } from 'date-fns/locale';

@Component({
  selector: 'app-item-archivo',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CheckboxModule,
    CmpLibModule,
    BotonCargoComponent,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    CuadernoJuzgamientoComponent
  ],
  templateUrl: './item-archivo.component.html',
  styleUrl: './item-archivo.component.scss'
})
export class ItemArchivoComponent implements OnInit {

 
  constructor(protected iconAsset: IconAsset) { /** Empty */ }
  



  @Input() etapa: any = null;
  obtenerIcono = obtenerIcono;


  cuadernosPrueba: DatosArchivo[] = [];
  cuadernosDebate: DatosArchivo[] = [];


  ngOnInit(): void {
    
    const datos = this.etapa.datosArchivo as DatosArchivo[];
    const totalCuadernosDePrueba = datos.filter(c => c.incorporaCuadernoPruebas == '1').length;
    this.cuadernosPrueba = datos.slice(0, totalCuadernosDePrueba / 2);
    this.cuadernosDebate = datos.slice(totalCuadernosDePrueba / 2, datos.length);

  }


  

}
