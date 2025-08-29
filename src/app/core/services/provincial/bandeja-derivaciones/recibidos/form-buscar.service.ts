import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {DatePipe} from "@angular/common";

enum field {
  busqueda = 'busqueda',
  tipoFecha = 'tipoFecha',
  fechaDesde ='fechaDesde',
  fechaHasta = 'fechaHasta',
  tipoDerivacion = 'tipoDerivacion'
}

@Injectable()
export class FormBuscarService {
  field = field;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.form = this.createFormulario();
  }

  // Método para crear el formulario
  createFormulario() {
    const fechaHasta = new Date();
    const fechaDesde = new Date(fechaHasta.getFullYear(), fechaHasta.getMonth() - 1, fechaHasta.getDate());
    return this.fb.group({
      [field.busqueda]: [''],
      [field.tipoFecha]: ['1'],
      [field.fechaDesde]: [this.datePipe.transform(fechaDesde, 'dd/MM/yyyy')],
      [field.fechaHasta]: [this.datePipe.transform(fechaHasta, 'dd/MM/yyyy')],
      [field.tipoDerivacion]: [1],
    });
  }

  // Getter para obtener los valores del formulario
  get values() {
    const request = structuredClone(this.form.getRawValue());
    return request;
  }

  // Métodos de acceso a cada control del formulario, con encadenamiento opcional
  get fieldBuscar() {
    return this.form?.get(field.busqueda);
  }
  get fieldTipoFecha() {
    return this.form?.get(field.tipoFecha);
  }
  get fieldFechaDesde() {
    return this.form?.get(field.fechaDesde);
  }
  get fieldFechaHasta() {
    return this.form?.get(field.fechaHasta);
  }
  get fieldTipoDerivacion() {
    return this.form?.get(field.tipoDerivacion);
  }

}
