import { Routes } from '@angular/router';
import { ListarConsultaCasosComponent as ListarConsultaCasosComponentOriginal } from './listar-casos-Original/listar-casos.component';
import { ListarConsultaCasosComponent } from './listar-casos/listar-casos.component';
import { DetalleCasoComponent } from './detalle-caso/detalle-caso.component';
import CuadernoIncidentalDetalleComponent from './consulta-cuaderno-incidental/cuaderno-incidental-detalle/cuaderno-incidental-detalle.component';
import { ConsultaCuadernoExtremoComponent } from './consulta-cuaderno-extremo/consulta-cuaderno-extremo.component';

export const ROUTES: Routes = [
  { path: '', component: ListarConsultaCasosComponent },
  { path: 'temporal', component: ListarConsultaCasosComponentOriginal },//Lista de Casos Original
  { path: 'caso', redirectTo: '', pathMatch: 'full' },
  { path: 'cuaderno-extremo', redirectTo: '', pathMatch: 'full' },
  {
    path: 'caso/:idCaso', component: DetalleCasoComponent,
    loadChildren: () => import('../../expediente/expediente-detalle/expediente-detalle.routes').then((m) => m.ROUTES)
  },
  {
    path: 'cuaderno-extremo/:idCaso', component: ConsultaCuadernoExtremoComponent,
    loadChildren: () => import('./consulta-cuaderno-extremo/consulta-cuadernos-extremos.routes').then((m) => m.ROUTES)
  },
  {
    path: 'cuaderno-incidental/:idCaso', component: CuadernoIncidentalDetalleComponent,
    loadChildren: () => import('./consulta-cuaderno-incidental/consulta-cuadernos-incidentales.routes').then((m) => m.ROUTES)
  },
];
