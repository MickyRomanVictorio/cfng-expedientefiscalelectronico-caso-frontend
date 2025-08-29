import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'  // Esto asegura que el servicio esté disponible en toda la aplicación
})
export class validateMessageService {
  // Usamos un Subject para enviar datos
  private validacionSource = new Subject<boolean>();

  // Observable para que los componentes se suscriban
  validacion$ = this.validacionSource.asObservable();

  constructor() { }

  // Método para emitir un valor
  cambiarValidacion(validado: boolean) {
    this.validacionSource.next(validado);
  }

}
