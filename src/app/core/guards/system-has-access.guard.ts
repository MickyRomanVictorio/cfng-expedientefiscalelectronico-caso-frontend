import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../services/shared/token.service';
import { CFE_NAVEGACION } from 'src/assets/data/cfe-navegacion';

@Injectable({
  providedIn: 'root',
})
export class SystemHasAccessGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    const _tokenDecoded: any = this.tokenService.getDecoded()
    const _user = _tokenDecoded.usuario
    let urlIngresado = state.url.split('/')[2]
    let sistemas = CFE_NAVEGACION.filter((nav) =>
      _user.sistemas.some((sistema:any) => sistema.codigo === nav.codigo)
    )

    let esPermitido = sistemas.find((sistema) => sistema.url.split('/')[2] === urlIngresado);

    if (esPermitido) {
      return true;
    }

    return false;
  }
}
