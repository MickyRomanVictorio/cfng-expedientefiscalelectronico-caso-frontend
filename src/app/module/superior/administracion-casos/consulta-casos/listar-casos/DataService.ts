import { BehaviorSubject } from 'rxjs';
// DataService.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private modeGrid = new BehaviorSubject<boolean>(true);
  modeGrid$ = this.modeGrid.asObservable();

  actualizarPropiedad(valor: boolean) {
    this.modeGrid.next(valor);
  }
}