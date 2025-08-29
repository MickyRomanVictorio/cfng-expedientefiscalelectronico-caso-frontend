import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Alerta } from '@interfaces/comunes/alerta';

@Injectable({
  providedIn: 'root',
})
export class AlertaSharedService {
  private itemsSource = new BehaviorSubject<Alerta[]>([]);
  currentItems = this.itemsSource.asObservable();

  constructor() {}

  changeItems(items: Alerta[]) {
    this.itemsSource.next(items);
  }
}
