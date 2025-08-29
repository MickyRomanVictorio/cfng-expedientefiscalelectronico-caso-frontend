import { Routes } from "@angular/router";
import { CarpetaAuxiliarDetalleComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/carpeta-auxiliar-detalle/carpeta-auxiliar-detalle.component";
import { CarpetaAuxiliarComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/carpeta-auxiliar.component";
import { CarpetaPrincipalComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/carpeta-principal/carpeta-principal.component";
import { CuadernosEjecucionComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/cuadernos-ejecucion/cuadernos-ejecucion.component";
import { CuadernosIncidentalesComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/cuadernos-incidentales/cuadernos-incidentales.component";

export const ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./cuaderno-incidental-detalle/cuaderno-incidental-detalle.routes').then((m) => m.ROUTES)
  },
  {
    path: 'carpeta-auxiliar',
    component: CarpetaAuxiliarComponent,
    children: [
      {
        path: '',
        pathMatch: 'full', // Asegura que se cargue cuando solo sea 'carpeta-auxiliar'
        component: CarpetaAuxiliarDetalleComponent
      },
      {
        path: 'carpeta-principal', component: CarpetaPrincipalComponent
      },
      {
        path: 'cuaderno-incidental', component: CuadernosIncidentalesComponent
      },
      {
        path: 'cuaderno-ejecucion', component: CuadernosEjecucionComponent
      }
    ]
  }
]