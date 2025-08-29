import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { Component } from '@angular/core';
import { obtenerIcono } from '@core/utils/icon';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CasoFiscal } from '@core/components/consulta-casos/models/listar-casos.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { obtenerCasoHtml } from 'ngx-cfng-core-lib';

@Component({
  selector: 'app-observacion-provincial',
  standalone: true,
  imports: [
    CmpLibModule
  ],
  templateUrl: './observacion-provincial.component.html',
  styleUrl: './observacion-provincial.component.scss'
})
export class ObservacionProvincialComponent {

  protected caso:CasoFiscal;

  protected obtenerIcono = obtenerIcono;

  constructor(
    protected ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly sanitizer: DomSanitizer
  ){
    this.caso = this.config.data.caso;
  }

    protected codigoHtml(codigo: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(obtenerCasoHtml(codigo));
    }

}
