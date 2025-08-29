import { CommonModule, NgClass } from '@angular/common';
import { Component, input, output, effect } from '@angular/core';
import { getCapitalized } from 'dist/ngx-cfng-core-lib';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-indicador',
  standalone: true,
  imports: [NgClass, CommonModule, AccordionModule],
  templateUrl: './indicador.component.html',
  styleUrl: './indicador.component.scss',
})
export class IndicadorComponent {
  public listaIndicadores = input<any[]>([]);
  public index = input<number>(0);
  public redireccionarBandeja = output<void>();

  protected indicador: any = [];
  protected colorIcono: any = '';

  protected icons: any = {
    fondoAmarillo: 'elevacionActuados.svg',
    fondoVerde: 'apelaciones.svg',
    fondoAzul: 'contiendaCompetencia.svg',
    fondoPlomo: 'elevacionesConsulta.svg',
    fondoRojo: 'solicitudesExclusion.svg',
    fondoGuinda: 'retiroAcusacion.svg',
  };

  private readonly colores = [
    '#F19700',
    '#058664',
    '#05106c',
    '#CFD5DB',
    '#C1292E',
    '#353535',
    '#963CBE',
  ];

  constructor() {
    // 📌 Observa los cambios en listaIndicadores y actualiza el indicador
    effect(() => {
      const _listaIndicadores = this.listaIndicadores();
      const _index = this.index();

      if (_listaIndicadores.length > _index) {
        this.indicador = _listaIndicadores[_index];
        this.colorIcono = this.colores[_index] || '#000'; // Color por defecto si el índice es mayor
      }
    });
  }
  
  protected expanded = false;
  isAccordionOpen = false;

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }
  onTabOpen(event: any) {
    this.expanded = true;
  }

  onTabClose(event: any) {
    this.expanded = false;
  }
  protected getIcon(icon: string) {
    if (this.icons[icon] === undefined) {
      return '';
    }
    return `assets/icons/${this.icons[icon]}`;
  }

  protected goToBandeja() {
    this.redireccionarBandeja.emit();
  }
  getTituloConSalto(titulo: string): string {
    if (!titulo || typeof titulo !== 'string') {
      return '';
    }
    const palabras = titulo.split(' ');
    if (palabras.length > 1) {
      return getCapitalized(
        palabras.slice(0, 1).join(' ') + '<br>' + palabras.slice(1).join(' ')
      );
    }
    return getCapitalized (titulo);
  }
  convertirMasDetalles(
    masDetalles: any
  ): { textoValor: string; numeroValor: any }[] {
    if (!masDetalles || typeof masDetalles !== 'object') return [];

    const resultado: { textoValor: string; numeroValor: any }[] = [];

    Object.entries(masDetalles).forEach(([key, value]) => {
      if (
        key === 'idTipoElevacion' ||
        key === 'tipoContenido' ||
        (typeof value === 'number' && value < 0)
      )
        return;
      let textoValor = '';
      switch (key) {
        case 'ncarpetaPrincipal':
          textoValor = 'Carpeta Principal';
          break;
        case 'ncuadernosExtremos':
          textoValor = 'Cuadernos Extremos';
          break;
        case 'ncontiendaNegativa':
          textoValor = 'Contienda Negativa';
          break;
        case 'ncontiendaPositiva':
          textoValor = 'Contienda Positiva';
          break;
      }
      resultado.push({
        textoValor: textoValor,
        numeroValor: value,
      });
    });

    return resultado;
  }
}
