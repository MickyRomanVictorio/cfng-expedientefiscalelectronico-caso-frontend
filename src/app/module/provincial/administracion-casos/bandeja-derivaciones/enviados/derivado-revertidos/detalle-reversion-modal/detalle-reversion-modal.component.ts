import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DerivadoDevuelto } from '@interfaces/provincial/bandeja-derivacion/enviados/derivado-devueltos/DerivadoDevuelto';
import { obtenerCasoHtml } from '@utils/utils';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: true,
  selector: 'app-detalle-reversion-modal',
  templateUrl: './detalle-reversion-modal.component.html',
  styleUrls: ['./detalle-reversion-modal.component.scss'],
  imports: [CommonModule, ButtonModule],
})
export class DetalleReversionModalComponent implements OnInit {
  public title: SafeHtml | undefined = undefined;

  revertido!: DerivadoDevuelto;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizador: DomSanitizer
  )
  {
    this.revertido = this.config.data.revertido;
  }

  ngOnInit(): void {
    this.obtenerTitulo();
  }

  private obtenerTitulo(): void {
    const tituloHtml = `DETALLE DE REVERSIÓN (ES) - CASO: ${obtenerCasoHtml(this.revertido.coCaso!)}`;
    this.title = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
  }

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
