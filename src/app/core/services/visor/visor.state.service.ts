import { Injectable } from '@angular/core';
import { DatosArchivo } from '@core/interfaces/visor/visor-interface';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisorStateService {

  private readonly mostrarDocumentoSub: Subject<DatosArchivo> = new Subject<DatosArchivo>();
  readonly mostrarDocumento$ = this.mostrarDocumentoSub.asObservable();

  private readonly descargarArchivoSub: Subject<DatosArchivo> = new Subject<DatosArchivo>();
  readonly descargarArchivo$ = this.descargarArchivoSub.asObservable();

  private readonly archivoSeleccionadoSub: Subject<{datosArchivo:DatosArchivo, event: CheckboxChangeEvent}> = new Subject<{datosArchivo:DatosArchivo, event: CheckboxChangeEvent}>();
  readonly archivoSeleccionado$ = this.archivoSeleccionadoSub.asObservable();

  private readonly abrirCargoSub: Subject<DatosArchivo> = new Subject<DatosArchivo>();
  readonly abrirCargo$ = this.abrirCargoSub.asObservable();

  archivoSeleccionado: DatosArchivo | null = null;


  archivoSeleccionadoChange(archivo: {datosArchivo:DatosArchivo, event: CheckboxChangeEvent}) {
    this.archivoSeleccionadoSub.next(archivo);
  }

  abrirDocumento(archivo: DatosArchivo) {
    this.abrirCargoSub.next(archivo);
  }

  constructor() { }

  mostrarDocumento(datoArchivo:DatosArchivo) {
    this.mostrarDocumentoSub.next(datoArchivo);
  };

  descargarArchivo(datoArchivo:DatosArchivo) {
    this.descargarArchivoSub.next(datoArchivo);
  };

}
