import { CanActivateFn, Router } from '@angular/router';
import { TIPOS_DENUNCIA } from '@core/constants/mesa-turno';
import { inject } from "@angular/core";

export const tipoDenunciaGuard: CanActivateFn = (route, state) => {
  const param = route.paramMap.get('tipoDenuncia');

  const tipos = Object.keys(TIPOS_DENUNCIA);

  if (!tipos.includes(param!)) {
    return inject(Router).createUrlTree(['app/mesa-turno/no-encontrado']);
  }
  route.data = {id: TIPOS_DENUNCIA[param!].id};
  return true;
};
