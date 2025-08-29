import { Injectable } from '@angular/core';
import { ResumenCasoModel } from '@core/interfaces/comunes/resumenCasoModel';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResumenCasoService {
  private valorFuente = new BehaviorSubject<ResumenCasoModel[]>([]);
  valoresActuales = this.valorFuente.asObservable();
  
  cambiarValores(nuevosValores: ResumenCasoModel[]) {
    this.valorFuente.next(nuevosValores);
  }
}
