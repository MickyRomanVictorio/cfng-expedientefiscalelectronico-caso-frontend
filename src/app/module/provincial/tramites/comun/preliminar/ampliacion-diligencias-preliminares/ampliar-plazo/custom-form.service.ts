import {Injectable} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { calcularPlazoMaximoUtil } from "./calcular-plazo-maximo.util";

type eventModal = () => void;

export enum field {
  fechaini = 'fechaini',
  fechafin = 'fechafin',
  sede = 'sede',
  plazo = 'plazo',
  unidadMedida = 'unidadMedida',
  fechaFinCalculada ='fechaFinCalculada',
  descripcion = 'descripcion',
  complejidad = 'complejidad',
  canMax = 'canMax'
}

@Injectable()
export class CustomFormService {
  private _mensajePlasos = '';
  form: FormGroup | null = null;
  isOpenModal = false;
  calificarCaso:any = null;
  idCaso!: string;
  idActoTramiteEstado!: string;

  closeModal!: eventModal;
  openModal: eventModal | null = null;
  ampliarPlazo!: eventModal;

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.createFormulario();
  }

  createFormulario() {
    return  this.fb.group({
        [field.fechaini]: [null],
        [field.fechafin]: [null],
        [field.sede]: [{ value: null, disabled: false }, [ Validators.required]],
        [field.plazo]: [{ value: null, disabled: false },
          [ Validators.required,
            Validators.minLength(1),
            Validators.maxLength(3),
            Validators.min(1),
            Validators.pattern(/^[0-9]*$/)]],
        [field.unidadMedida]: [{ value: null, disabled: false }, [Validators.required]],
        [field.fechaFinCalculada]: [{ value: 'Se calculará al firmar la disposición', disabled: true }, [Validators.required]],
        [field.descripcion]: [{ value: null, disabled: false }, [Validators.required]],
        [field.complejidad]: [null],
        [field.canMax]: [null],
      },
      {
        validators: [this.checkUnidadMedida(), this.plazoMaximo()]
      }
    );
  }

  get fieldFecIni() {
    return this.form!.get(field.fechaini);
  }
  get fieldFecFin() {
    return this.form!.get(field.fechafin);
  }
  get fieldSede() {
    return this.form!.get(field.sede);
  }
  get fieldPlazo() {
    return this.form!.get(field.plazo);
  }
  get fieldUnidadMedida() {
    return this.form!.get(field.unidadMedida);
  }
  get fieldFechaFinCalculada() {
    return this.form!.get(field.fechaFinCalculada);
  }
  get fieldDescripcion() {
    return this.form!.get(field.descripcion);
  }

  get mensajePlazos() {
    return this._mensajePlasos;
  }
  set mensajePlazos(msg: string) {
    this._mensajePlasos = msg;
  }

  checkUnidadMedida() {
    return (form:any) => {
      const unidadmedida = form.get(field.unidadMedida).value;
      const plazo = form.get(field.plazo).value;
      if(plazo){
        return !Boolean(unidadmedida) ? { unidadMedidaCheck: true }: null;
      }
      return null;
    }
  }

  plazoMaximo() {
    return (form:any) => {
      const plazo = form.get(field.plazo).value;
      const uniMedida = form.get(field.unidadMedida).value;
      const complejidad = form.get(field.complejidad).value;
      const canMax = form.get(field.canMax).value;
      if(uniMedida && plazo && complejidad) {
        const { isPasoElmaximo, mensaje } = calcularPlazoMaximoUtil(Number(complejidad),
          Number(canMax), Number(uniMedida), Number(plazo)).build();
        this.mensajePlazos = mensaje!;
        return isPasoElmaximo ? { plazoMaximo: true }: null
      }
      return null;
    };
  }

}
