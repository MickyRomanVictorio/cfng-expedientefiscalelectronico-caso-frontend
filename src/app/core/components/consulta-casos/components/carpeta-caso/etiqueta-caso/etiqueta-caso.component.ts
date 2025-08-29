import { NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { EtiquetaClasesCss } from '@core/constants/superior';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ObservacionProvincialComponent } from '../observacion-provincial/observacion-provincial.component';
import { CasoEtiqueta, CasoFiscal } from '@core/components/consulta-casos/models/listar-casos.model';

@Component({
  selector: 'app-etiqueta-caso',
  standalone: true,
  imports: [
    NgStyle
  ],
  templateUrl: './etiqueta-caso.component.html',
  styleUrl: './etiqueta-caso.component.scss'
})
export class EtiquetaCasoComponent{

  public etiqueta = input<CasoEtiqueta>();
  public perfilJerarquia = input<PerfilJerarquia>(PerfilJerarquia.Provincial);
  protected etiquetaClasesCss = EtiquetaClasesCss;
  protected referenciaModal!: DynamicDialogRef;
  protected respuestaEvento = output<any>();

  constructor(
    private readonly dialogService: DialogService
  ) { 
  }

  /**
   * Analiza una cadena de texto CSS y devuelve un objeto con estilos RGB.
   *
   * @param cssText - Una cadena que contiene dos valores RGB separados por un '|'.
   *                   El primer valor se utiliza para el color del texto y el
   *                   segundo para el color de fondo.
   * @returns Un objeto con las propiedades 'background-color' y 'color' configuradas
   *          con los valores RGB respectivos extraídos de la cadena de entrada.
   */
  protected colorEtiquetaRgb(cssText:string){
    const cssColor = cssText.split('|');
    return {
      'background-color': `rgb(${cssColor[1]})`,
      'color': `rgb(${cssColor[0]})`
    };
  }

  protected eventoRespuesta(event: Event, etiqueta:CasoEtiqueta):void{
    this.respuestaEvento.emit({
      event, etiqueta
    });
  }

}
