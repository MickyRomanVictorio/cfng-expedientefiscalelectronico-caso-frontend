import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatosArchivo } from '@core/interfaces/visor/visor-interface';
import { VisorStateService } from '@core/services/visor/visor.state.service';
import { CmpLibModule } from 'dist/cmp-lib';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { BotonCargoComponent } from '../../boton-cargo/boton-cargo.component';
import { obtenerIcono } from '@core/utils/icon';
import { IconAsset } from 'dist/ngx-cfng-core-lib';

@Component({
  selector: 'app-cuaderno-juzgamiento',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    CheckboxModule,
    CmpLibModule,
    BotonCargoComponent
  ],
  templateUrl: './cuaderno-juzgamiento.component.html',
  styleUrl: './cuaderno-juzgamiento.component.scss',
  animations: [
    trigger('toggleCuaderno', [
      state('open', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      state('closed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      transition('open <=> closed', animate('300ms ease-in-out'))
    ])
  ]
})
export class CuadernoJuzgamientoComponent {

  @Input() titulo = "";
  @Input() cuadernosJuzgamiento: DatosArchivo[] = [];

  isCuadernoOpen = true;

  obtenerIcono = obtenerIcono


  constructor(private readonly visorStateService: VisorStateService, protected iconAsset: IconAsset) { /** Empty */ }

  toggleCuaderno(event: MouseEvent) {

    event.preventDefault();

    this.isCuadernoOpen = !this.isCuadernoOpen;
  }


  protected eventoSeleccionarFila(datosArchivo:DatosArchivo, event: CheckboxChangeEvent){   
    this.visorStateService.archivoSeleccionadoChange({datosArchivo, event}); 
  }

  protected eventoSeleccionarArchivo(datosArchivo:DatosArchivo) {  
    this.visorStateService.abrirDocumento(datosArchivo);
    this.visorStateService.mostrarDocumento(datosArchivo);
  }

  protected eventoDescargarArchivo(datosArchivo:DatosArchivo) {
    this.visorStateService.descargarArchivo(datosArchivo);
  }

  protected colorFondoFilaArchivo( datosArchivo:DatosArchivo) {   
    if(this.visorStateService?.archivoSeleccionado!==null && this.visorStateService?.archivoSeleccionado?.correlativo === datosArchivo.correlativo){
      return '#F7EED4';
    }
    return '#fff';    
  }



}
