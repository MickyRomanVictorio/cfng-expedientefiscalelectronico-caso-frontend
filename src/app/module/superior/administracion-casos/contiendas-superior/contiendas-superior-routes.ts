import { Routes } from '@angular/router';
import { ContiendasSuperiorComponent } from './contiendas-superior.component';
import { ListarContiendasComponent } from './listar-contiendas/listar-contiendas.component';
import { ListarCasosSuperiorPorAsignarComponent } from '../asignacion-superior/listar-casos-por-asignar/listar-casos-por-asignar.component';
import { ListarCasosPorRecepcionarComponent } from '../recepcion-caso-superior/listar-casos-por-recepcionar/listar-casos-por-recepcionar.component';
import { ListarConsultaCasosComponent } from '../consulta-casos/listar-casos/listar-casos.component';

export const routes: Routes = [
    {
        path: '',
        component: ContiendasSuperiorComponent,
        children: [
            {
                path: '',
                redirectTo: 'bandeja-contienda',
                pathMatch: 'full'
            },
            {
                path: 'bandeja-contienda',
                component: ListarContiendasComponent,
                data: { idTipoElevacion:725 }
            },
            {
                path: 'asignacion-contienda',
                component: ListarCasosSuperiorPorAsignarComponent,
                data: { idTipoElevacion:725 }
            },
            {
                path: 'recepcion-contienda',
                component: ListarCasosPorRecepcionarComponent,
                data: { idTipoElevacion:725 }
            },
            {
                path: 'casos-contienda-competencia-contienda',
                component: ListarConsultaCasosComponent,
                data: { idTipoElevacion: 725 },
                loadChildren: () => import('../consulta-casos/consulta-casos-routes').then(m => m.ROUTES)
            },
        ],
      },
  ];
