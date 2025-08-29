import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DatosArchivo } from '@core/interfaces/visor/visor-interface';
import { VisorStateService } from '@core/services/visor/visor.state.service';
import { obtenerIcono } from '@core/utils/icon';
import { CmpLibModule } from 'dist/cmp-lib';

@Component({
  selector: 'app-boton-cargo',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule
  ],
  templateUrl: './boton-cargo.component.html',
  styleUrl: './boton-cargo.component.scss'
})
export class BotonCargoComponent implements OnInit {


  constructor(private readonly visorStateService: VisorStateService) { /** Empty */ }


  ngOnInit(): void {
    this.visorStateService.abrirCargo$.subscribe((documento: DatosArchivo) => {
      if (documento && documento.idDocumento != this.cargoDocumento?.idDocumento) {
        console.log('zzzzz');
        
       this.isOpen = false;
      } else {
        console.log('cccc');
        
      }
    })
  }

  isOpen = false;
  protected obtenerIcono = obtenerIcono;

  @Input() cargoDocumento?: DatosArchivo;
  @Input() tramite?: DatosArchivo;

  togglePanel() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.visorStateService.mostrarDocumento(this.cargoDocumento!);
    } else {
      this.visorStateService.mostrarDocumento(this.tramite!);
    }
    
  }

  abrirCargo(cargo: DatosArchivo) {  
    console.log("open open");
     
    this.visorStateService.abrirDocumento(cargo);
    this.visorStateService.mostrarDocumento(cargo);
  }

  descargarCargo(event: MouseEvent) {
    event.preventDefault();
    this.visorStateService.descargarArchivo(this.cargoDocumento!);
  }

}
