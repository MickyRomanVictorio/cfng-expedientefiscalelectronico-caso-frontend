import { Component, Input } from '@angular/core';
import { CasoFiscal, Etiqueta } from '@core/interfaces/comunes/casosFiscales';
import { DialogService } from 'primeng/dynamicdialog';
//import { DesacumularFirstComponent } from '@components/modals/desacumular-first/desacumular-first';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
@Component({
  standalone: true,
  selector: 'app-etiqueta-caso',
  templateUrl: './etiqueta-caso.component.html',
  styleUrls: ['./etiqueta-caso.component.scss'],
  imports:[
    CommonModule,
    ButtonModule,
    TagModule
  ],
  providers: [DialogService]
})
export class EtiquetaCasoComponent {

  @Input()
  labels: Etiqueta[] = []

  @Input()
  caso: string = ""

  @Input()
  acumulado:string = ""

  @Input()
  casoFiscal!:CasoFiscal;

  constructor(private dialogService: DialogService) { }

  openOverlay() {
    //MODIFICADO
    /*this.dialogService.open(DesacumularFirstComponent, {
      showHeader:false,
      width: '50%',
      contentStyle: { 'max-height': '500px', 'overflow': 'auto', 'border-radius':'20px'},
      baseZIndex: 10000,
      data: {
        Acumulado:this.acumulado,
        Caso:this.caso
      }
    });*/
  }

  getClass(id: number) {
    switch (id) {
      case 1:
      case 2:
        return "bg-blue-700";
      case 3:
        return "bg-purple-400";
      case 4:
        return "";
      case 5:
        return "bg-red-500";
      case 6:
        return "bg-black-alpha-70";
      default:
        return "";
    }
  }

  getTextColor(hexColor: string): string {
    // Convert the hexadecimal color to RGB values
    hexColor = hexColor.replace(/^#/, '');
    const r = parseInt(hexColor.slice(0, 2), 16) / 255;
    const g = parseInt(hexColor.slice(2, 4), 16) / 255;
    const b = parseInt(hexColor.slice(4, 6), 16) / 255;

    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Decide text color based on background luminance
    if (luminance > 0.5) {
      return 'black'; // Use black text for light backgrounds
    } else {
      return 'white'; // Use white text for dark backgrounds
    }
  }
}
