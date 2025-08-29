import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-encabezado-modal',
  standalone: true,
  templateUrl: './encabezado-modal.component.html',
  styleUrls: ['./encabezado-modal.component.scss'],
  imports: [CmpLibModule],
})
export class EncabezadoModalComponent implements OnInit {

  @Input() flag: boolean = false
  @Input() titulo: string = ''
  @Input() soloTitulo: boolean = false
  @Input() tituloSinEtiquetaCaso: boolean = false
  @Input() datoComplementario: string = ''
  @Input() numeroCaso: string = '00000000-0000-0000-0'
  @Input() referenciaModal: DynamicDialogRef | undefined = undefined
  @Input() sinReferencia: boolean = false
  @Input() alCerrarModal: () => void = () => { }
  @Input() tituloSize: string = '1.5rem'

  public tituloModal: SafeHtml | undefined = undefined;
  public obtenerIcono = obtenerIcono;

  constructor(private sanitizador: DomSanitizer) { }

  ngOnInit(): void {
    this.obtenerTitulo();
  }

  private obtenerTitulo(): void {

    let tituloHtml = `${this.titulo}`;

    if (!this.soloTitulo) {
      if (this.tituloSinEtiquetaCaso) {

        tituloHtml += this.numeroCaso !== '00000000-0000-0000-0' ? ` ${obtenerCasoHtml(this.numeroCaso)}` : ''

      } else {

        if (this.flag) {
          tituloHtml += this.numeroCaso !== '00000000-0000-0000-0' ? ` caso N° ${obtenerCasoHtml(this.numeroCaso)}` : ''
        }
        if (!this.flag) {
          tituloHtml += this.numeroCaso !== '00000000-0000-0000-0' ? ` caso: ${obtenerCasoHtml(this.numeroCaso)}` : ''
        }
      }
    }
    this.tituloModal = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);

  }

  public cerrarModal(): void {
    if (this.sinReferencia) {
      this.alCerrarModal()
      return
    }
    this.alCerrarModal();
    this.referenciaModal!.close();
  }
}
