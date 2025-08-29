import { Component } from '@angular/core';
import {IconUtil } from 'ngx-cfng-core-lib';
import { obtenerCodigoCasoHtml } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-sujetos-detalle',
  standalone: true,
  imports: [
    CmpLibModule,
    TableModule
  ],
  templateUrl: './sujetos-detalle.component.html',
  styleUrls: ['./sujetos-detalle.component.scss']
})
export class SujetosDetalleComponent {

  protected obtenerCodigoCasoHtml = obtenerCodigoCasoHtml;
  protected datosEntrada:any;
  protected listaSujetos:any[] = [];
  private buscarTextTiempo:any = null;

  constructor(
    protected dynamicDialogRef: DynamicDialogRef,
    public dynamicDialogConfig: DynamicDialogConfig,
    protected iconUtil: IconUtil
  ){
    this.datosEntrada = this.dynamicDialogConfig.data;
    this.listaSujetos = [... this.datosEntrada.sujetosProcesales ];
  }

  protected eventoBuscarText(e:Event){
    const valor = (e.target as HTMLInputElement).value;
    clearTimeout(this.buscarTextTiempo);
    if(valor===''){
      this.listaSujetos = this.datosEntrada.sujetosProcesales;
      return;
    }
    this.buscarTextTiempo = setTimeout(() => {

      this.listaSujetos = this.datosEntrada.sujetosProcesales.filter((data:any) =>
        Object.values(data).some(
           (atributoValor: any) =>
              (typeof atributoValor === 'string' || typeof atributoValor === 'number') &&
                atributoValor?.toString()?.toLowerCase().includes(valor.toLowerCase())
        )
      );

    }, 500);

  }

}
