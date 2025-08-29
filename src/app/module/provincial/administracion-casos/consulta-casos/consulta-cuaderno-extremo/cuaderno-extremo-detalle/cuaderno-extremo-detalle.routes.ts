import { Routes } from '@angular/router';
import { DetalleCuadernosExtremosComponent } from './tramite-cuaderno-extremo/tramite-cuaderno-extremo.component';
import { ElementosConviccionComponent } from './tramite-cuaderno-extremo/elementos-conviccion/elementos-conviccion.component';
import { ResumenComponent } from './tramite-cuaderno-extremo/resumen/resumen.component';
import { SujetosProcesalesComponent } from './tramite-cuaderno-extremo/sujetos-procesales/sujetos-procesales.component';
import { ApelacionesComponent } from '../../consulta-cuaderno-incidental/cuaderno-incidental-detalle/detalle-cuadernos-incidentales/apelaciones/apelaciones.component';
import { NavegacionSujetoProcesalComponent } from '@modules/provincial/administracion-casos/sujeto/navegacion-sujeto-procesal/navegacion-sujeto-procesal.component';
import { HistoriaCasoComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/historia-caso.component';
import { TramitesActivosComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/tramites-activos/tramites-activos.component';
import { TramitesEliminadosComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/tramites-eliminados/tramites-eliminados.component';

export const ROUTES: Routes = [

  { path: '', redirectTo: 'acto-procesal', pathMatch: 'full' },
  {
    path: 'acto-procesal',
    component: DetalleCuadernosExtremosComponent,
    loadChildren: () => import('../../../../expediente/expediente-detalle/detalle-tramite/detalle-tramite.routes').then((m) => m.ROUTES_ACTO_PROCESAL)
  },
  {
    path: 'elementos-conviccion',
    component: DetalleCuadernosExtremosComponent,
    children: [
      { path: '', component: ElementosConviccionComponent },
    ]
  },
  {
    path: 'sujeto',
    component: DetalleCuadernosExtremosComponent,
    children: [
      { path: '', component: SujetosProcesalesComponent },
      { path: ':idSujeto', component: NavegacionSujetoProcesalComponent }
    ]
  },
  {
    path: 'resumen',
    component: DetalleCuadernosExtremosComponent,
    children: [
      { path: '', component: ResumenComponent },
    ]
  },
  {
    path: 'historia-extremo',
    component: DetalleCuadernosExtremosComponent,
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
    component: DetalleCuadernosExtremosComponent,
    children: [
      { path: '', component: ApelacionesComponent },
    ]
  },
]