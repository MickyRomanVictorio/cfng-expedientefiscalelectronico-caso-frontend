import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { FormBuscarService } from "@services/provincial/bandeja-derivaciones/recibidos/form-buscar.service";

@Injectable()
export class DerivacionesRecibidosService {
  fs = inject(FormBuscarService)
  #cantDerivados = 0;
  #canAculumados = 0;

  private filtroRequestSubject = new BehaviorSubject<any>(this.fs.values);
  filtroRequest$ = this.filtroRequestSubject.asObservable();

  private textoBuscadoSubject = new BehaviorSubject<string>('');
  textoBuscado$ = this.textoBuscadoSubject.asObservable();

  enviarFiltroRequest(request: any) {
    this.filtroRequestSubject.next(request);
  }

  enviarTextoBuscado(texto: string) {
    this.textoBuscadoSubject.next(texto);
  }

  set cantDerivados(can: number) {
    this.#cantDerivados = can;
  }

  set canAculumados(can: number) {
    this.#canAculumados = can;
  }

  get cantDerivados() {
    return this.#cantDerivados;
  }

  get canAculumados() {
    return this.#canAculumados;
  }
}
