import { Injectable } from '@angular/core';

import { RouterStateSnapshot, CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from "@angular/router";
import { Observable } from 'rxjs';
import { TokenService } from '../services/shared/token.service';
@Injectable({
  providedIn: 'root',
})
export class IsUnauthGuard implements CanActivate {
    constructor(private tokenService: TokenService, private router: Router) {}
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ):
      | Observable<boolean | UrlTree>
      | Promise<boolean | UrlTree>
      | boolean
      | UrlTree {
      console.log('en IsUnauthGuard');
      if (!this.tokenService.exist()) {
        return true;
      }
      this.router.navigateByUrl('/app');
      return false;
    }
      

}