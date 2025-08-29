import { Routes } from '@angular/router';
import { DetalleCasoComponent } from './detalle-caso/detalle-caso.component';
import { ListarConsultaCasosComponent } from './listar-casos/listar-casos.component';

export const ROUTES: Routes = [
    { path: '', component: ListarConsultaCasosComponent },
    { path: 'caso', redirectTo: '' },
    { path: 'caso/:caso', component: DetalleCasoComponent,
      loadChildren: () => import('@modules/provincial/expediente/expediente-detalle/expediente-detalle.routes').then((m) => m.ROUTES)
    },
];
