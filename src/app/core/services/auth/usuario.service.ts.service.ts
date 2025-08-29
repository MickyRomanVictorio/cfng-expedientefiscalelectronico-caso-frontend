import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UsuarioAuth } from '@core/models/usuario-auth.model';
import { CARGO, Constants } from 'ngx-cfng-core-lib';

@Injectable({
  providedIn: 'root'
})
export class UsuarioAuthService {

  public obtenerDatosUsuario():UsuarioAuth{
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    return helper.decodeToken(token.token).usuario as UsuarioAuth;
  }

  public esCarsoSuperior(): boolean {
    return this.obtenerDatosUsuario().codCargo===CARGO.FISCAL_SUPERIOR;
  }
  public esJerarquiaSuperior(): boolean {
    return this.obtenerDatosUsuario().codJerarquia==='02';
  }

  public esJerarquiaProvincial(): boolean {
    return this.obtenerDatosUsuario().codJerarquia==='01';
  }

}
