import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button, ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DateMaskModule } from '@directives/date-mask.module';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {
    MensajeCompletarInformacionComponent
} from '@components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import {
    MensajeInteroperabilidadPjComponent
} from '@components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import {
  NgxCfngCoreModalDialogModule,
} from '@ngx-cfng-core-modal/dialog';
import { MessagesModule } from 'primeng/messages';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { NgClass, NgIf } from '@angular/common';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-auto-resuelve-queja-denegatoria-apelacion-compartido',
  standalone: true,
    imports: [
      MessagesModule,
      CalendarModule,
      DateMaskModule,
      ButtonModule,
      FormsModule,
      ReactiveFormsModule,
      CmpLibModule,
      InputMaskModule,
      DropdownModule,
      InputTextareaModule,
      NgIf,
      MensajeInteroperabilidadPjComponent,
      MensajeCompletarInformacionComponent,
      NgxCfngCoreModalDialogModule,
      NgClass,
    ],
  templateUrl: './auto-resuelve-queja-denegatoria-apelacion-compartido.component.html'
})
export class AutoResuelveQuejaDenegatoriaApelacionCompartidoComponent {
  @Input() formulario!: FormGroup;
  @Input() tieneActoTramiteCasoDocumento = false;
  @Input() tramiteEstadoRecibido = false;
  @Input() tramiteSeleccionado: any;
  @Input() flCheckModal = false;
  @Input() longitudMaximaObservaciones = 500;
  @Input() cantidadCaracteresObservacion = 0;
  @Input() esPosibleEditarFormulario = false;
  @Input() tramiteGuardado = false;
  @Input() formularioValido = false;

  // Callbacks
  @Input() iconAsset!: any;
  @Output() onOpenModalSujetos = new EventEmitter<void>();
  @Output() onActualizarActoTramite = new EventEmitter<void>();
  @Output() onConfirmarRegistro = new EventEmitter<void>();

  openModalSujetos() {
    this.onOpenModalSujetos.emit();
  }

  modalActualizarActoYTramite() {
    this.onActualizarActoTramite.emit();
  }

  confirmarRegistroTramite() {
    this.onConfirmarRegistro.emit();
  }
}
