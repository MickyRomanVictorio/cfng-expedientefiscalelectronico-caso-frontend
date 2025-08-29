import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Makes the service available application-wide
})
export class BandejaTramitesSharedService {
  private readonly idBandejaEstadoSubject = new BehaviorSubject<number>(0);
  private readonly bandejaPendienteRevisarContador =
    new BehaviorSubject<number>(0);
  private readonly bandejaPendienteVisarContador = new BehaviorSubject<number>(
    0
  );

  // Observable for components to subscribe to
  get idBandejaEstado$(): Observable<number> {
    return this.idBandejaEstadoSubject.asObservable();
  }

  // Method to update the value
  updateBandejaEstado(index: number): void {
    this.idBandejaEstadoSubject.next(index);
  }

  updateBandejaPendienteRevisarContador(index: number): void {
    this.bandejaPendienteRevisarContador.next(index);
  }

  get bandejaPendienteRevisarContador$(): Observable<number> {
    return this.bandejaPendienteRevisarContador.asObservable();
  }

  updateBandejaPendienteVisarContador(index: number): void {
    this.bandejaPendienteVisarContador.next(index);
  }

  get bandejaPendienteVisarContador$(): Observable<number> {
    return this.bandejaPendienteVisarContador.asObservable();
  }

  get idBandejaEstadoActual(): number {
    return this.idBandejaEstadoSubject.getValue();
  }
}
