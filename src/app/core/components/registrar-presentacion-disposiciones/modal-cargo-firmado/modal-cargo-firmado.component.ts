import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SLUG_CONFIRM_RESPONSE } from '@constants/mesa-unica-despacho';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  standalone: true,
  selector: 'app-modal-cargo-firmado',
  templateUrl: './modal-cargo-firmado.component.html',
  styleUrls: ['./modal-cargo-firmado.component.scss'],
  imports: [CommonModule, ButtonModule, CmpLibModule],
})
export class ModalCargoFirmadoComponent {
  responses = SLUG_CONFIRM_RESPONSE;

  obtenerIcono = obtenerIcono;

  get warningIcon(): string {
    return 'assets/icons/warning.svg';
  }

  public datosUsuario: string;
  public tipoCopiaSeleccionada: string;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.datosUsuario = config.data.usuario;
    this.tipoCopiaSeleccionada = config.data.tipoCopia;
  }

  confirmModal(): void {
    this.ref.close(this.responses.OK);
  }

  cerrarModal(): void {
    if (this.config.data?.confirmar) {
      this.confirmModal();
    } else {
      this.ref.close();
    }
  }
}
