import { NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { CmpLibModule } from 'dist/cmp-lib';
import { NgxCfngCoreModalDialogModule } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-consentido-formulario-base',
  standalone: true,
  templateUrl: './consentido-formulario-base.component.html',
   imports: [
      MessagesModule,
      CalendarModule,
      DateMaskModule,
      ButtonModule,
      FormsModule,
      ReactiveFormsModule,
      NgClass,
      CmpLibModule,
      InputMaskModule,
      DropdownModule,
      InputTextareaModule,
      MensajeInteroperabilidadPjComponent,
      MensajeCompletarInformacionComponent,
      NgxCfngCoreModalDialogModule,
    ],
})
export class ConsentidoFormularioBaseComponent {
  @Input() formulario!: FormGroup;
  @Input() tramiteSeleccionado: any;
  @Input() tieneActoTramiteCasoDocumento = false;
  @Input() tramiteEstadoRecibido = false;
  @Input() flCheckModal = false;
  @Input() esPosibleEditarFormulario = false;
  @Input() tramiteGuardado = false;
  @Input() formularioValido = false;
  @Input() longitudMaximaObservaciones = 500;
  @Input() cantidadCaracteresObservacion = 0;
  @Input() iconAsset: any;
  @Input() labelConsentido = 'Consentido';
  @Input() labelBtnConsentido = 'Seleccionar consentido';

  @Output() openModalSujetos = new EventEmitter<void>();
  @Output() modalActualizarActoYTramite = new EventEmitter<void>();
  @Output() confirmarRegistroTramite = new EventEmitter<void>();
}