import { Injectable } from '@angular/core';
import { ApiBaseService } from '@core/services/shared/api.base.service';
import { TokenService } from '@core/services/shared/token.service';
import { BACKEND } from '@environments/environment';
import { Constants } from 'dist/ngx-cfng-core-lib';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CasosMonitoreadosService {

  private esMonitoreadoSubject = new BehaviorSubject<string>('0');
  esMonitoreado$ = this.esMonitoreadoSubject.asObservable();

  private url = `${BACKEND.CFE_EFE_SUPERIOR}`;

  constructor(
    private apiBase: ApiBaseService,
    private tokenService: TokenService,
  ) { 
    this.esMonitoreadoSubject = this.getSubject();
  }

  public obtenerCasosMonitoreados(datos:any): Observable<any> {
    return this.apiBase.post(this.url+'/v1/e/caso/consultacasosmonitoreados', datos);
  }

  private getSubject(): BehaviorSubject<string> {
    // Lee el sessionStorage y parsea el JSON
    const raw = sessionStorage.getItem(Constants.TOKEN_NAME);
    let esMonitoreado = '0';

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        esMonitoreado = parsed.esMonitoreado ?? '0';
      } catch (e) {
        console.error('Error parseando sessionStorage', e);
      }
    }

    return new BehaviorSubject<string>(esMonitoreado);
  }

  setEsMonitoreado(valor: '0' | '1'): void {
    this.tokenService.saveMonitoreado(valor);
    this.esMonitoreadoSubject.next(valor);
  }

  getEsMonitoreado(): string | null {
    return this.esMonitoreadoSubject.getValue();
  }

  clearEsMonitoreado() {
    // 1. Limpias el BehaviorSubject
    this.esMonitoreadoSubject.next('0');
    // 2. Actualizar solo la propiedad en sessionStorage
    const raw = sessionStorage.getItem(Constants.TOKEN_NAME);
    if (raw) {
       this.tokenService.saveMonitoreado('0');
    }
  }

}
