import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApelacionNuevoService {
  private idCasoSubject = new BehaviorSubject<string>('');
  private existeNuevoSubject = new BehaviorSubject<boolean>(true);
  // Expone el observable para que los componentes puedan suscribirse
  public valueCaso$ = this.idCasoSubject.asObservable();
  public valueExisteNuevo$ = this.existeNuevoSubject.asObservable();
  // Método para actualizar el valor
  public updateValue(newValue: string): void {
    this.idCasoSubject.next(newValue);
  }
  public updateExisteNuevo(newValue: boolean): void {
    this.existeNuevoSubject.next(newValue);
  }
}