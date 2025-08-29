import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Constants} from 'ngx-cfng-core-lib';
import {SessionStorageService} from './session-storage.service';
import { TokenSession } from '@interfaces/shared/session.interface';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private storageService: SessionStorageService) {}

  get() {
    const _tokenName = this.storageService.getItem('token');
    return _tokenName;
  }

  getWithoutBearer() {
    const _tokenName = this.storageService.getItem('token');
    return _tokenName.split(' ')[1];
  }

  save(token: string) {
    this.storageService.createItem('token', token);
  }

  clear() {
    this.storageService.clearItem('token');
  }

  getDecoded(): TokenSession | any {
    const tokenString = sessionStorage.getItem(Constants.TOKEN_NAME);
    if (!tokenString) return null;

    const helper = new JwtHelperService();
    const token = JSON.parse(tokenString);
    return helper.decodeToken(token.token);
  }

  exist() {
    return this.storageService.existItem('token');
  }

  saveAplicacion(aplicacion: string) {
    this.storageService.createItem('aplication', aplicacion);
  }

  saveMonitoreado(esMonitoreado: string) {
    this.storageService.createItem('esMonitoreado',  esMonitoreado);
  }
   
  getEsMonitoreado(): string | null {
    const token = sessionStorage.getItem(Constants.TOKEN_NAME);
    if (token) {
      const data = JSON.parse(token);
      return data.esMonitoreado ?? null;
    }
  return null;
}

}
