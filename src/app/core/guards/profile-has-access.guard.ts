import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree, } from '@angular/router';
import { SYSTEM } from '@constants/system';
import { findModuleNameByCode } from '@core/utils/modules';
import { modules } from 'ngx-cfng-core-lib';
import { Observable } from 'rxjs';
import { TokenService } from '../services/shared/token.service';


@Injectable({
  providedIn: 'root',
})
export class ProfileHasAccessGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const _tokenDecoded: any = this.tokenService.getDecoded();
    const _user = _tokenDecoded.usuario;
    const _system = _user.sistemas.find((system: any) => system.codigo === SYSTEM.EFE);
    const _hasAccess = _system.opciones.includes(route.data['module']);

    if (_hasAccess) {
      return true;
    }
    if (_system.opciones.length === 0) {
      this.router.navigateByUrl('/app/no-encontrado');
    } else {
      let _moduleName = findModuleNameByCode(modules, _system.opciones[0]);
      this.router.navigateByUrl(`/app/${_moduleName}`);
    }
    return false;
  }
}
