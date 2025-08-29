import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { obtenerIcono } from '@utils/icon';
import { obtenerRutaParaEtapa } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-alertas-tramite',
  standalone: true,
  imports: [CmpLibModule, RouterLink],
  templateUrl: './alertas-tramite.component.html',
  styleUrls: ['./alertas-tramite.component.scss'],
})
export class AlertasTramiteComponent {
  @Input() alertas!: AlertaFormulario[];
  @Input() idCaso: string = '';
  @Input() idEtapa: string = '01';
  @Input() urlClass: string = 'cfe-url';
  protected obtenerIcono = obtenerIcono;

  constructor(private readonly sanitizer: DomSanitizer) {}

  protected obtenerTexto(texto: string): SafeHtml {
    const textoHtml = `<div>${texto
      .replaceAll('<<', '<span>')
      .replaceAll('>>', '</span>')}</div>`;
    return this.sanitizer.bypassSecurityTrustHtml(textoHtml);
  }

  protected obtenerUrl(urlRedireccion: string): string {
    return `${urlRedireccion
      .replace('[CASO]', this.idCaso)
      .replace('[ETAPA]', obtenerRutaParaEtapa(this.idEtapa))}`;
  }
}
