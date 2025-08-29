import {Routes} from "@angular/router";
import {AyudaComponent} from "./ayuda.component";
import {InicioComponent} from "@modules/ayuda/inicio/inicio.component";
import {BusquedaComponent} from "@modules/ayuda/busqueda/busqueda.component";
import {ArticuloComponent} from "@modules/ayuda/articulo/articulo.component";


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AyudaComponent,
    children: [
      {
        path: 'inicio',
        component: InicioComponent
      },
      {
        path: 'busqueda',
        component: BusquedaComponent,
      },
      {
        path: 'detalle',
        component: ArticuloComponent,
      }
    ],
  },
];
