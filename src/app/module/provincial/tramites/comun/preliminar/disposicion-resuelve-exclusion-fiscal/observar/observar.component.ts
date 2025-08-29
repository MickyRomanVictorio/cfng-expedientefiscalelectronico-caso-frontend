import { NgClass } from '@angular/common';
import { Component, input, model, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosPronunciamiento } from '@core/interfaces/provincial/tramites/elevacion-actuados/DisposicionResuelveElevacionActuados';
import { NgxCfngCoreModalDialogModule } from '@ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';

/**
 * Componente para gestionar la observación del pronunciamiento
 * Puede funcionar tanto en modo modal como embebido en otro componente
 */
@Component({
  selector: 'app-observar-exclusion-fiscal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    RadioButtonModule,
    DropdownModule,
    CheckboxModule,
    InputTextareaModule,
    InputTextModule,
    ButtonModule,
    NgxCfngCoreModalDialogModule
  ],
  templateUrl: './observar.component.html',
  styleUrl: './observar.component.scss'
})
export class ModalObservarExclusionComponent implements OnInit {

  protected maxObservacion: number = 1000;
  protected formulario!: FormGroup;
  protected caracteresRestantes: number = this.maxObservacion;
  //
  public datosPronunciamiento = model<DatosPronunciamiento | null>(null);
  public esSoloLectura = model<boolean>(false);
  public esModal = input<boolean>(true);
  //
  public cerrar = output<void>();
  public observar = output<any>();
  //
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly config?: DynamicDialogConfig,
    private readonly dialogRef?: DynamicDialogRef
  ) {
    if (this.config) {
      this.datosPronunciamiento.set(this.config.data.datosPronunciamiento);
      this.esSoloLectura.set(this.config.data.esSoloLectura);
    }
  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      observacion: [{
        value: this.esSoloLectura() ? this.datosPronunciamiento()?.observacionProvincial : '',
        disabled: this.esSoloLectura()
      }, [ Validators.required, Validators.minLength(10), Validators.maxLength(1000) ] ],
    });
  }

  protected eventoCerrar(): void {
    if (this.esModal() && this.dialogRef) {
      this.dialogRef.close(); // Cierra el modal
    } else {
      this.cerrar.emit(); // Notifica al padre cuando no es modal
    }
  }

  protected eventoObservar(): void {
    if (this.formulario.valid) {
      if (this.esModal() && this.dialogRef) {
        this.dialogRef.close({ aceptar: true, datos: this.formulario.value }); // Cierra el modal
      } else {
        this.observar.emit(this.formulario.value); // Envía datos al componente padre
      }
    }
  }

  protected eventoObservacion(): void {
    const valor = this.formulario.get('observacion')?.value || '';
    this.caracteresRestantes = this.maxObservacion - valor.length;
  }

}
