import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

//primeng
import { ButtonModule } from 'primeng/button';

//mpfn
import { SLUG_CONFIRM_RESPONSE } from '@constants/mesa-unica-despacho';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [CommonModule, ButtonModule, CmpLibModule],
  templateUrl: './modal-confirmacion.component.html',
  styleUrls: ['./modal-confirmacion.component.scss'],
})
export class ModalConfirmacionComponent {
  responses = SLUG_CONFIRM_RESPONSE;

  obtenerIcono = obtenerIcono;

  get warningIcon(): string {
    return 'assets/icons/warning.svg';
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

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
