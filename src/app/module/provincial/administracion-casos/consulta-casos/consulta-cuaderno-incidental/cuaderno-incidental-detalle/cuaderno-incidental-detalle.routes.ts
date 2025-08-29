import { Routes } from '@angular/router';
import { DetalleCuadernosIncidentalesComponent } from './detalle-cuadernos-incidentales/detalle-cuadernos-incidentales.component';
import { ElementosConviccionComponent } from './detalle-cuadernos-incidentales/elementos-conviccion/elementos-conviccion.component';
import { SujetosProcesalesComponent } from './detalle-cuadernos-incidentales/sujetos-procesales/sujetos-procesales.component';
import { NavegacionSujetoProcesalComponent } from '../../../sujeto/navegacion-sujeto-procesal/navegacion-sujeto-procesal.component';
import { ResumenComponent } from './detalle-cuadernos-incidentales/resumen/resumen.component';
import { ApelacionesComponent } from './detalle-cuadernos-incidentales/apelaciones/apelaciones.component';
import {
  HistoriaCasoComponent
} from "@modules/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/historia-caso.component";
import {
  TramitesActivosComponent
} from "@modules/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/tramites-activos/tramites-activos.component";
import {
  TramitesEliminadosComponent
} from "@modules/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/tramites-eliminados/tramites-eliminados.component";

export const ROUTES: Routes = [
  { path: '', redirectTo: 'acto-procesal', pathMatch: 'full' },
  {
    path: 'acto-procesal',
    component: DetalleCuadernosIncidentalesComponent,
    loadChildren: () => import('../../../../expediente/expediente-detalle/detalle-tramite/detalle-tramite.routes').then((m) => m.ROUTES_ACTO_PROCESAL)
  },
  {
    path: 'elementos',
    component: DetalleCuadernosIncidentalesComponent,
    children: [
      { path: '', component: ElementosConviccionComponent },
    ]
  },
  {
    path: 'sujeto',
    component: DetalleCuadernosIncidentalesComponent,
    children: [
      { path: '', component: SujetosProcesalesComponent },
      { path: ':idSujeto', component: NavegacionSujetoProcesalComponent },
    ]
  },
  {
    path: 'resumen',
    component: DetalleCuadernosIncidentalesComponent,
    children: [
      { path: '', component: ResumenComponent },
    ]
  },
  {
    path: 'historia-tramites',
    component: DetalleCuadernosIncidentalesComponent,
    children: [
      {
        path: '',
        component: HistoriaCasoComponent,
        children: [
          { path: '', redirectTo: 'activos', pathMatch: 'full' },
          { path: 'activos', component: TramitesActivosComponent },
          { path: 'eliminados', component: TramitesEliminadosComponent }
        ]
      }
    ]
  },
  {
    path: 'apelaciones',
    component: DetalleCuadernosIncidentalesComponent,
    children: [
      { path: '', component: ApelacionesComponent },
    ]
  },
]
