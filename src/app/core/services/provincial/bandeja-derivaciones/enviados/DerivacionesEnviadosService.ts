import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { ApiBaseService } from "@services/shared/api.base.service";
@Injectable({
  providedIn: 'root'
})
export class DerivacionesEnviadosService {

  constructor(private apiBase: ApiBaseService) {
  }

  private filtroRequestSubject = new BehaviorSubject<any>(null);
  filtroRequest$ = this.filtroRequestSubject.asObservable();

  private textoBuscadoSubject = new BehaviorSubject<string>('');
  textoBuscado$ = this.textoBuscadoSubject.asObservable();

  enviarFiltroRequest(request: any) {
    this.filtroRequestSubject.next(request);
  }

  enviarTextoBuscado(texto: string) {
    this.textoBuscadoSubject.next(texto);
  }

  // Método para obtener el texto de búsqueda actual
  obtenerTextoBuscado(): string {
    return this.textoBuscadoSubject.value?.trim();
  }

}
