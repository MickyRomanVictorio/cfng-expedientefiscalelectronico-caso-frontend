import { Routes } from "@angular/router";
import MonitoreoFiscalComponent from "@modules/reportes/reportes/monitoreo-fiscal/monitoreo-fiscal.component";
import ProductividadComponent from "@modules/reportes/reportes/productividad/productividad.component";
import {ReportesComponent} from "@modules/reportes/reportes/reportes.component";



export const routes: Routes = [

  {
    path: '',
    redirectTo: 'productividad',
    pathMatch: 'full',
  },
  {
    path: '',
    component: ReportesComponent,
    children: [
      {
        path: 'monitoreo-fiscal',
        component: MonitoreoFiscalComponent,
        loadChildren: () => import('./monitoreo-fiscal/monitoreo-fiscal-routes').then((m) => m.routes)
      },
      {
        path: 'productividad',
        component: ProductividadComponent,
        loadChildren: () => import('./productividad/productividad-routes').then((m) => m.routes)
      },


    ]
  },
];
