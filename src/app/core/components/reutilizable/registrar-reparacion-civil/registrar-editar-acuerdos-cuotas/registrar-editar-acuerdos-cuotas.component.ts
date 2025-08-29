import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CmpLibModule } from 'dist/cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DigitOnlyModule } from '@core/directives/digit-only.module';
import { TableModule } from 'primeng/table';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { valid } from '@core/utils/string';
import { BehaviorSubject, map, Subscription } from 'rxjs';
import { DatosEditarReparacionCivil } from '@core/interfaces/reusables/reparacion-civil/datos-editar-reparacion-civil';
import { DatosReparacionCivilInput } from '@core/interfaces/reusables/reparacion-civil/datos-reparacion-civil-input';
import { RegistrarAcuerdoActaComponent } from '../../registrar-acuerdo-acta/registrar-acuerdo-acta.component';
import { DatosAcuerdoActa } from '@core/interfaces/reusables/acuerdo-acta/datos-acuerdo-acta';
@Component({
  selector: 'app-registrar-editar-acuerdos-cuotas',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    MessagesModule,
    InputTextareaModule,
    RadioButtonModule,
    InputTextModule,
    CalendarModule,
    CheckboxModule,
    DigitOnlyModule,
    TableModule,
    DateMaskModule,
    RegistrarAcuerdoActaComponent
  ],
  templateUrl: './registrar-editar-acuerdos-cuotas.component.html',
  styleUrl: './registrar-editar-acuerdos-cuotas.component.scss'
})
export class RegistrarEditarAcuerdosCuotasComponent {

  @Input() data!: DatosReparacionCivilInput;

  @Input() modoLectura!: boolean;

  @Input() enviarDatosAcuerdoActa!: BehaviorSubject<DatosEditarReparacionCivil | null>;

  datosEditarReparacionCivil: DatosEditarReparacionCivil | null = null;

  @Output() enviarEstadoBoton = new EventEmitter<boolean>();

  @ViewChild(RegistrarAcuerdoActaComponent) registrarAcuerdoActaComponent!: RegistrarAcuerdoActaComponent;

  private readonly subscriptions: Subscription[] = [];

  valid = valid;

  ngOnInit() {
    this.subscriptions.push(
      this.enviarDatosAcuerdoActa.subscribe((datosAcuerdoActa) => {
        this.datosEditarReparacionCivil = datosAcuerdoActa ?? null;
      })
    );
  }

  enviarEstadoBotonAccion(valor: boolean) {
    this.enviarEstadoBoton.next(valor);
  }

  enviarinformacionActoAcuerdo(): BehaviorSubject<DatosAcuerdoActa | null> {
    const mappedSubject = new BehaviorSubject<DatosAcuerdoActa | null>(null);
    this.enviarDatosAcuerdoActa.pipe(
      map((datosEditar) => {
        if (!datosEditar) {
          return null;
        }
        return {
          idAcuerdosActa: datosEditar.idAcuerdosActa,
          idSujetoCaso:null,
          reparacionCivil: {
            pendienteRegistrar: datosEditar.pendienteRegistrar,
            codReparacionCivil: datosEditar.codReparacionCivil,
            idReparacionCivil: datosEditar.idReparacionCivil,
          },
        } as DatosAcuerdoActa;
      })
    ).subscribe(mappedSubject);
    return mappedSubject;
  }

  async guardarAcuerdoActaReparacionCivil(idReparacionCivil: string = ''): Promise<DatosEditarReparacionCivil | null> {
    return this.registrarAcuerdoActaComponent.guardarAcuerdoActaReparacionCivil(idReparacionCivil);
  }

}
