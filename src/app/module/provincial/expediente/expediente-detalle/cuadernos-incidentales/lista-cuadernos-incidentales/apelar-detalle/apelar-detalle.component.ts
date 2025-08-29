import {Component, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {IconAsset} from 'ngx-cfng-core-lib';
import {IconUtil } from 'ngx-cfng-core-lib';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-apelar-detalle',
  standalone: true,
  imports: [
    CmpLibModule,
    TableModule,
    NgIf
  ],
  templateUrl: './apelar-detalle.component.html',
  styleUrls: ['./apelar-detalle.component.scss']
})
export class ApelarDetalleComponent implements OnInit {

  protected datosEntrada:any;
  protected listaImputados:any[] = [];
  protected iconoRelojSvg:SafeHtml | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    protected dynamicDialogRef: DynamicDialogRef,
    public dynamicDialogConfig: DynamicDialogConfig,
    private iconAsset: IconAsset,
    protected iconUtil: IconUtil
  ){
    this.datosEntrada = this.dynamicDialogConfig.data;
    this.listaImputados = [...datosDemo];
  }

  ngOnInit(): void {
    this.iconoRelojPersonalizar();
  }

  private iconoRelojPersonalizar(){
    fetch(this.iconAsset.obtenerRutaIcono('icon_clock').toString()).then(rs => rs.text()).then(r => {
      r = r.replaceAll('#333333','#2B8DE3');
      this.iconoRelojSvg = this.sanitizer.bypassSecurityTrustHtml(r);
    });
  }

}
//
const datosDemo=[
 {
  plazoVerncer:true,
  imputado:'Cristian Tineo, Guevara, Lizette Pereiro Torres',
  fechaNotificacion:'15/05/2023',
  conteoRegersivo:'0d: 18h: 23m: 26s'
 },
 {
  plazoVerncer:true,
  imputado:'Renato Vargas Alfaro',
  fechaNotificacion:'20/05/2023',
  conteoRegersivo:'0d: 2h: 20m: 15s'
 },
 {
  plazoVerncer:false,
  imputado:'Gabriel Lozada',
  fechaNotificacion:'30/05/2023',
  conteoRegersivo:'10d: 10h: 15m: 26s'
 },
 {
  plazoVerncer:false,
  imputado:'David Marcelo Reyes',
  fechaNotificacion:'15/07/2023',
  conteoRegersivo:'2d: 10h: 15m: 26s'
 }
];
