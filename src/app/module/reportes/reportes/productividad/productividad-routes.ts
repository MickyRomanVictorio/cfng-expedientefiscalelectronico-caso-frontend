import { Routes } from "@angular/router";
import ProductividadComponent from "@modules/reportes/reportes/productividad/productividad.component";




export const routes: Routes = [
  {
    path: '',
    component: ProductividadComponent,
    children: [
      {
        path: '',
        redirectTo: 'productividad',
        pathMatch: 'full',
      },
      {
        path: 'productividad',
        loadChildren: () => import('./productividad/productividad-routes').then(m => m.default),
      }
    ]
  },
];
