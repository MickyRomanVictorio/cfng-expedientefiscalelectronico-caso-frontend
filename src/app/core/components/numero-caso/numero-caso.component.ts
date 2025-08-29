import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import { StringUtil } from 'dist/ngx-cfng-core-lib';

type TipoEtiqueta = 'h3' | 'h2' | 'p' | 'span' | 'div';

@Component({
  selector: 'numero-caso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './numero-caso.component.html',
})
export class NumeroCasoComponent {

  @Input() numeroCaso!: string;
  @Input() tipoEtiqueta: TipoEtiqueta = 'span';
  @Input() fontSize: string = '1rem';

  casoSafeHtml!: SafeHtml;

  constructor(
    private sanitizer: DomSanitizer,
    private stringUtil: StringUtil
  ) {
  }

  ngOnInit(): void {
    this.casoSafeHtml = this.stringUtil.obtenerNumeroCaso(this.numeroCaso)
  }
}
