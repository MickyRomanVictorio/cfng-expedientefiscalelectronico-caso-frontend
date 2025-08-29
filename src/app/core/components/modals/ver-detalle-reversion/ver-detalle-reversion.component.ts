import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { obtenerCasoHtml } from '@utils/utils';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-ver-detalle-reversion',
  templateUrl: './ver-detalle-reversion.component.html',
  styleUrls: ['./ver-detalle-reversion.component.scss'],
  standalone: true,
  imports: [CommonModule, ButtonModule],
})
export class VerDetalleReversionComponent implements OnInit {

  public title: SafeHtml | undefined = undefined;
  revertido!: any;

  constructor(
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
  ) {
    console.log('VerDetalleReversionComponent -> ', this.config.data.revertido);
    this.revertido = this.config.data.revertido;
  }

  ngOnInit(): void {
    /**this.obtenerElevacion(this.idBandejaDerivacion);**/
    this.obtenerTitulo();
  }

  private obtenerTitulo(): void {
    const tituloHtml = `DETALLE DE REVERSIÓN (ES) - CASO: ${obtenerCasoHtml(this.revertido.coCaso!)}`;
    this.title = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
  }

  /**private obtenerElevacion(idBandejaDerivacion: any): void {
    this.spinner.show();
    this.subscriptions.push(
      this.enviadosAcumuladosRevertidosService.obtenerReversion(idBandejaDerivacion)
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

  get alertIcon(): string {
    return `assets/icons/success.svg`;
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  public cancelAction(): void {
    this.ref.close('cancel');
  }

  public closeAction(evt: MouseEvent): void {
    evt.preventDefault();
    this.ref.close('closed');
  }
 

}
