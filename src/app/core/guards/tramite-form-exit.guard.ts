import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { concatMap, Observable, of } from 'rxjs';
import { TramiteService } from '@services/provincial/tramites/tramite.service';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class TramiteFormExitGuard implements CanActivate, CanDeactivate<CanComponentDeactivate> {
  constructor(private router: Router,
              private tramiteService: TramiteService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.tramiteService.tabConValidacion()) {
      return this.tramiteService.ejecutarValidacion().pipe(
        concatMap((confirmar) => {
          if (confirmar) {
            this.tramiteService.limpiarValidacion();
          }
          return of(confirmar);
        })
      );
    } else {
      return true;
    }
  }

  canDeactivate(component: CanComponentDeactivate): Observable<boolean> {
    return component.canDeactivate();
  }
}
