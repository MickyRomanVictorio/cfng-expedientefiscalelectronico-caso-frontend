import { Injectable } from '@angular/core';
import { SLUG_MESA_PARTES } from '@constants/mesa-unica-despacho';

@Injectable({
  providedIn: 'root',
})
export class PerfilActivoService {

  perfilActivo: number = 0

  get mesa(): string{
    return this.perfilActivo === SLUG_MESA_PARTES.DESPACHO ? 'mesa-despacho' : 'mesa-unica'
  }

}
