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
import { JwtHelperService } from '@auth0/angular-jwt';
import { DOMAIN_FRONT_HOME } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IsAuthGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    const paramToken = route.queryParams['token'];
    const helper = new JwtHelperService();

    if (paramToken) {
      if(!helper.isTokenExpired(paramToken)){
        let token = 'Bearer ' + paramToken;
        this.tokenService.save(token);

        //guardando el 'idAplication' en el sesion del token
        const idAplication = route.queryParams['idAplication'];
        this.tokenService.saveAplicacion(idAplication);

        //removiendo el session de 'menuData' para volver a consultar el api de las opciones
        sessionStorage.removeItem('menuData');

        this.router.navigateByUrl('/app');
        return true;
      }else{
        this.tokenService.clear();
        window.location.href = DOMAIN_FRONT_HOME;
        return false;
      }
    }

    if (
      this.tokenService.exist() &&
      !helper.isTokenExpired(this.tokenService.getWithoutBearer())
    ) {
      return true;
    } else {
      window.location.href = DOMAIN_FRONT_HOME;
      return false;
    }
  }
}
