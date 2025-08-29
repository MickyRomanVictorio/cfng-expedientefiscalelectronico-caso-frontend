import { Routes } from '@angular/router';
import { IsAuthGuard } from '@core/guards/is-auth.guard';

export const routes: Routes = [
  {
    path: '',
    children: [

      { path: '', redirectTo: 'app', pathMatch: 'full' },
      {
        path: 'app',
        canActivate: [ IsAuthGuard ],
        loadChildren: () =>
          import('@modules/modulos-routes').then((m) => m.routes),
      },

    ]
  },
];
