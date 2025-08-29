import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { DetalleRecibidoReversion } from '@interfaces/provincial/bandeja-derivacion/recibidos/acumulado-revertidos/DetalleRecibidoAcumuladoRevertido';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { obtenerCasoHtml } from '@core/utils/utils';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DateFormatPipe } from 'dist/ngx-cfng-core-lib';

@Component({
  selector: 'app-ver-caso-recibido-reversion',
  templateUrl: './ver-caso-recibido-reversion.component.html',
  standalone: true,
  imports: [CommonModule, ButtonModule, DateFormatPipe],
}) 
export class VerCasoRecibidoReversionComponent implements OnInit {

  public title: SafeHtml | undefined = undefined;
  detalleReversion!: any;

  constructor(
    public referenciaModal: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
  ) {
    console.log('VerCasoRecibidoReversionComponent -> ', this.config.data.revertido);
    this.detalleReversion = this.config.data.revertido;
  }

  ngOnInit(): void {
    /**this.obtenerElevacion(this.idBandejaDerivacion);**/
    this.obtenerTitulo();
  }

  private obtenerTitulo(): void {
    const tituloHtml = `DETALLE DE REVERSIÓN (ES) - Caso: ${this.detalleReversion.caso ? obtenerCasoHtml(this.detalleReversion.caso) : ''}`;
    this.title = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
  }

  /**private obtenerElevacion(idBandejaDerivacion: any): void {
    this.spinner.show();
    this.subscriptions.push(
      this.recibidosAcumuladosRevertidosService
        .obtenerReversion(idBandejaDerivacion)
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            this.detalleReversion = resp;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }**/

  /**public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }**/

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
