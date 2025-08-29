import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RespuestaSuperiorDetalleService {

  private readonly accionFinalizadaSubject = new Subject<string>();

  constructor() { }

  public notificarAccionFinalizada(finalizado: string): void {
    this.accionFinalizadaSubject.next(finalizado);
  }

  public obtenerAccionFinalizada$(): Observable<string> {
    return this.accionFinalizadaSubject.asObservable();
  }

}
