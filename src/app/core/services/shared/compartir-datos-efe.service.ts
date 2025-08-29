import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompartirDatosEfe {
  public tabUrl: string = '';
  private compartirTabUrl = new Subject<any>();
  public urlTabCompartidaObservable = this.compartirTabUrl.asObservable();

  public notificarCambioTabUrl(url: '') {
    this.tabUrl = url;
    this.compartirTabUrl.next(url);
  }
}
