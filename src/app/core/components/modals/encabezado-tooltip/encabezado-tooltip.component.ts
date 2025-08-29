import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: true,
  selector: 'app-encabezado-tooltip',
  templateUrl: './encabezado-tooltip.component.html',
  imports: [CmpLibModule],
})
export class EncabezadoTooltipComponent implements OnInit {
  @Input() flag: boolean = false;
  @Input() titulo: string = '';
  @Input() referenciaModal: DynamicDialogRef | undefined = undefined;
  @Input() alCerrarModal: () => void = () => { };
  @Input() cierrateModal: void | undefined;

  public tituloModal: SafeHtml | undefined = undefined;
  public obtenerIcono = obtenerIcono;

  constructor(private sanitizador: DomSanitizer) { }

  ngOnInit(): void {
    this.obtenerTitulo();
  }

  private obtenerTitulo(): void {
    let tituloHtml = `${this.titulo}`;
    this.tituloModal = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
  }

  public cerrarModal(): void {
    // this.cierrateModal;
    this.alCerrarModal();
  }
}
