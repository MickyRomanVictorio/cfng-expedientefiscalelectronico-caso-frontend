import { Routes } from '@angular/router';
import MonitoreoFiscalComponent from '@modules/reportes/reportes/monitoreo-fiscal/monitoreo-fiscal.component';

export const routes: Routes = [
  {
    path: '',
    component: MonitoreoFiscalComponent,
    children: [
      {
        path: '',
        redirectTo: 'carga-laboral',
        pathMatch: 'full',
      },
      {
        path: 'carga-laboral',
        loadChildren: () => import('./carga-laboral/carga-laboral-routes'),
      },
      {
        path: 'control-plazo',
        loadChildren: () => import('./control-plazo/control-plazo-routes'),
      },
      {
        path: 'acto-procesales-por-etapa',
        loadChildren: () => import('./acto-procesales-por-etapa/acto-procesales-por-etapa-routes'),
      },
    ],
  },
];
