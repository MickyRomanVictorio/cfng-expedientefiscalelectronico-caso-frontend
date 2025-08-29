import {Routes} from '@angular/router';
import {HomeComponent} from '@shared/layouts/home/home.component';
import {LayoutService} from '@core/interfaces/comunes/app-layout.service';
import {modules} from 'ngx-cfng-core-lib';
import {findModuleCodeByName} from '@core/utils/modules';
import {ProfileHasAccessGuard} from '@core/guards/profile-has-access.guard';
import {NotFoundComponent} from '@core/components/generales/not-found/not-found.component';
import { TramiteFormExitGuard } from '@guards/tramite-form-exit.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    providers: [ LayoutService ],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        data: { module: findModuleCodeByName(modules, 'inicio') },
        canActivate: [ ProfileHasAccessGuard ],
        loadChildren: () =>
          import('@modules/inicio/inicio-routes').then(
            (m) => m.routes
          ),
      },
      {
        path: 'indicador',
        data: { module: findModuleCodeByName(modules, 'indicador') },
        canActivate: [ ProfileHasAccessGuard ],
        loadComponent: () =>
          import('@components/generales/not-found/not-found.component').then(
            (m) => m.NotFoundComponent
          ),
      },
      {
        path: 'administracion-casos',
        data: { module: findModuleCodeByName(modules, 'administracion-casos') },
        canActivate: [ ProfileHasAccessGuard, TramiteFormExitGuard ],
        loadChildren: () =>
          import('@modules/provincial/administracion-casos/administracion-casos-routes').then(
            (m) => m.routes
          ),
      },
      {
        path: 'administracion-casossuperior',
        data: { module: findModuleCodeByName(modules, 'administracion-casossuperior') },
        canActivate: [ ProfileHasAccessGuard ],
        loadChildren: () =>
          import('@modules/superior/administracion-casos/administracion-casos-superior-routes').then(
            (m) => m.routes
          ),
      },
      {
        path: 'documentos-ingresados',
        data: { module: findModuleCodeByName(modules, 'documentos-ingresados') },
        canActivate: [ ProfileHasAccessGuard, TramiteFormExitGuard ],
        loadChildren: () =>
          import('@modules/provincial/documentos-ingresados/documentos-ingresados-routes').then(
            (m) => m.routes
          ),
      },
      {
        path: 'derivaciones',
        data: { module: findModuleCodeByName(modules, 'bandeja-derivacion') },
        canActivate: [ ProfileHasAccessGuard ],
        loadChildren: () =>
          import('@modules/provincial/administracion-casos/bandeja-derivaciones/bandeja-derivaciones.routes').then(
            (m) => m.routes
          ),
      },
      {
        path: 'bandeja-tramites',
        data: { module: findModuleCodeByName(modules, 'bandeja-tramites') },
        canActivate: [ ProfileHasAccessGuard, TramiteFormExitGuard ],
        loadChildren: () =>
          import('@modules/provincial/bandeja-tramites/bandeja-tramites.routes').then(
            (m) => m.routes
          ),
      },
      {
        path: 'reportes',
        data: { module: findModuleCodeByName(modules, 'reportes') },
        canActivate: [ ProfileHasAccessGuard, TramiteFormExitGuard ],
        loadChildren: () =>
          import('@modules/reportes/reportes/reportes-routes').then(
            (m) => m.routes
          ),
      },
    /*   {
        path: 'notificaciones',
        data: { module: findModuleCodeByName(modules, 'notificaciones') },
        canActivate: [ ProfileHasAccessGuard ],
        loadChildren: () =>
          import('./notificaciones/notificaciones-routes').then(
            (m) => m.routes
          ),
      }, */
      {
        path: 'no-encontrado',
        data: { module: findModuleCodeByName(modules, 'notFound') },
        component: NotFoundComponent,
      },
      {
        path: 'bandeja-alertas',
        data: { module: findModuleCodeByName(modules, 'alertas') },
        canActivate: [TramiteFormExitGuard],
        loadChildren: () =>
          import('@components/modals/alerta-caso-modal/alerta.routes').then(
            (m) => m.routes
          ),
      },
      {
        path: 'ayuda',
        data: { module: findModuleCodeByName(modules, 'ayuda') },
        canActivate: [TramiteFormExitGuard],
        loadChildren: () =>
          import('@modules/ayuda/ayuda.routes').then(
            (m) => m.routes
          ),
      }
    ],
  },
];
