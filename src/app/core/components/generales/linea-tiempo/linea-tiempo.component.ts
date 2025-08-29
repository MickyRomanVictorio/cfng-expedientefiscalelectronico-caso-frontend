import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';

@Component({
  standalone: true,
  selector: 'app-linea-tiempo',
  templateUrl: './linea-tiempo.component.html',
  styleUrls: ['./linea-tiempo.component.scss'],
  imports: [CommonModule],
})
export class TimeLineCasoComponent {

  @Input() etapas: any[] = [];
  @Input() etapaActual: string = '';
  @Input() etapaActiva: string = '';

  styles: any = null;

  color: string = '#008087';
  second_color: string = '#D1D2D2';

  style_for_selected = {
    'background-color': this.color,
    'border-color': this.color,
    color: 'white',
  };
  style_for_connector = { 'background-color': this.color };
  style_for_no_selected = { 'border-color': this.second_color };
  style_for_no_connector = { 'background-color': this.second_color };
  text_for_selected = { color: this.color, 'font-weight': 'bold' };
  text_for_no_selected = {};

  style_for_before = {
    'background-color': 'white',
    color: this.color,
    'border-color': this.color,
  };

  caseid: any;
  casoFiscal: CasoFiscal = {};

  constructor(
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    const caso = changes['etapas'];
    if (caso) {
      this.etapas = caso.currentValue;
    }
  }
  colorizeCode(code: string) {
    code = `${code}-0`;
    const parts = code.split('-');
    if (parts.length > 3) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `${parts[0]}-<span style='color:orange' >${parts[1]}-${parts[2]}</span>-${parts[3]}`
      );
    }
    return code;
  }

  index_encontrado: number | null = null;

  colorize(colorize_value: string, last: boolean, index: number) {
    this.index_encontrado = this.etapas.findIndex(
      (item) => item.codigo == this.etapaActual || item.codigo == this.etapaActiva
    );

    if (colorize_value == this.etapaActual || colorize_value == this.etapaActiva) {
      this.styles = [this.style_for_selected, this.text_for_selected];
      if (last) {
        this.styles.push(this.style_for_no_connector);
      }
    } else if (index < this.index_encontrado) {
      this.styles = [
        this.style_for_before,
        this.text_for_no_selected,
        this.style_for_connector,
      ];
    } else {
      this.styles = [this.style_for_no_selected, this.text_for_no_selected];
      if (last) {
        this.styles.push(this.style_for_no_connector);
      }
    }
    return this.styles;
  }

  labelManager(index: number) {
    if (index < this.index_encontrado!) {
      return true;
    }
    return false;
  }
  
}
