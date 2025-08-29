import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class DocumentoVisadoService {

  private documentoVisadoSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  documentoVisado$ = this.documentoVisadoSubject.asObservable();

  actualizarDocumentoVisado(documentoVisado: any):void {
    this.documentoVisadoSubject.next(documentoVisado);
  }

  obtenerDocumentoVisado(): BehaviorSubject<any> {
    return this.documentoVisadoSubject;
  }
}
