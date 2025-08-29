import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export const registrarPlazoErrorValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const unidadMedidaControl = control.get('unidadMedida');

  if (!unidadMedidaControl) {
    return null;
  }

  const unidadMedidaValue = unidadMedidaControl.value;
  if (unidadMedidaValue == '') {
    return { unidadMedidaCheck: true };
  }

  if (unidadMedidaValue == null) {
    return { unidadMedidaCheck: true };
  }

  return null;
};

// @Injectable({ providedIn: 'root' })
// export class RegistrarPlazoErrorValidators {
//     public unidadMedidaCheck(): ValidatorFn {
//         return (formGroup: FormGroup) => {
//             const unidadMedidaControl = formGroup.get('unidadMedida');

//             if (!unidadMedidaControl) {
//                 return null;
//             }

//             const unidadMedidaValue = unidadMedidaControl.value;
//             if (!unidadMedidaValue) {
//                 return null;
//             }

//             if (unidadMedidaValue == null) {
//                 return { unidadMedidaCheck: true };
//             }

//             return null;
//         }
//     }
// }
