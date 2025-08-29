import { Routes } from "@angular/router";
import { BandejaDerivacionesEnviadosComponent } from "./enviados/bandeja-derivaciones-enviados/bandeja-derivaciones-enviados.component";
import { BandejaDerivacionesRecibidosComponent } from "./recibidos/bandeja-derivaciones-recibidos/bandeja-derivaciones-recibidos.component";

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'enviados',
        component: BandejaDerivacionesEnviadosComponent,
        data: { titulo: 'Enviados', generico: true },
        children: [
          {
            path: '',
            redirectTo: 'derivado-a',
            pathMatch: 'full'
          },
          {
            path: 'derivado-a',
            loadChildren: () => import('./enviados/enviados-derivados-a.routes'),
          },
          {
            path: 'acumulado-a',
            loadChildren: () => import('./enviados/enviados-acumulado-a.routes'),
          }
        ]
      },
      {
        path: 'recibidos',
        component: BandejaDerivacionesRecibidosComponent,
        data: { titulo: 'Recibidos', generico: true },
        children: [
          {
            path: '',
            redirectTo: 'derivado-de',
            pathMatch: 'full'
          },
          {
            path: 'derivado-de',
            loadChildren: () => import('./recibidos/recibidos-derivados-a.routes'),
          },
          {
            path: 'acumulado-de',
            loadChildren: () => import('./recibidos/recibidos-acumulado-a.routes'),
          },
        ]
      },

    ]
  }
]