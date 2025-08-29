import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { DialogService } from 'primeng/dynamicdialog';
import { AcumulacionesCasoComponent } from '../../acumulaciones-caso/acumulaciones-caso.component';

@Component({
  standalone: true,
  selector: 'app-etiqueta-acciones-caso',
  templateUrl: './etiqueta-acciones-caso.component.html',
  styleUrls: ['./etiqueta-acciones-caso.component.scss'],
  imports:[
    CommonModule,
  ],
  providers: [DialogService]
})
export class EtiquetaAccionesCasoComponent implements OnInit {

  @Input()
  casoFiscal!: CasoFiscal;

  constructor(private dialogService: DialogService) { }

  ngOnInit() {
  }

  obtenerMetodoCaso(){
    this.mostrarModalVerAcumulacionesCaso();
  }

  private mostrarModalVerAcumulacionesCaso() {
    const ref = this.dialogService.open(AcumulacionesCasoComponent, {
      showHeader: false,
      styleClass: 'p-dialog--lg',
      data: {
        casoFiscal: this.casoFiscal,
      }
    });
  }

}
