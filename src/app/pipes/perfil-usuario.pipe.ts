import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'perfilUsuario',
  standalone: true
})
export class PerfilUsuarioPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
