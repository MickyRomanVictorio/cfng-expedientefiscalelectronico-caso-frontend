import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DerivadoDevuelto } from '@interfaces/provincial/bandeja-derivacion/enviados/derivado-devueltos/DerivadoDevuelto';
import { obtenerCasoHtml } from '@utils/utils';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: true,
  selector: 'app-detalle-reversion-modal',
  templateUrl: './detalle-reversion-modal.component.html', 
  styleUrls: ['./detalle-reversion-modal.component.scss'],
  imports: [CommonModule, ButtonModule, DateFormatPipe],
})
export class DetalleReversionModalComponent implements OnInit {

  public title: SafeHtml | undefined = undefined;
  detalleReversion!: any;
  
  constructor(
    public referenciaModal: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
  ) {
    this.detalleReversion = this.config.data.revertido;
  }

  ngOnInit(): void {
    /**this.obtenerElevacion(this.idBandejaDerivacion);**/
    this.obtenerTitulo();
  }

  private obtenerTitulo(): void {
    const tituloHtml = `DETALLE DE REVERSIÓN (ES) - Caso: ${this.detalleReversion.coCaso ? obtenerCasoHtml(this.detalleReversion.coCaso) : ''}`;
    this.title = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
  }

  get alertIcon(): string {
    return `assets/icons/success.svg`;
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  public cancelAction(): void {
    this.referenciaModal.close('cancel');
  }

  public closeAction(evt: MouseEvent): void {
    evt.preventDefault();
    this.referenciaModal.close('closed');
  }
}
