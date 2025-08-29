import { Routes } from '@angular/router';
import {  ExclusionFiscalSuperiorComponent } from './exclusion-fiscal-superior.component';
import {  ListarExclusionFiscalSuperiorComponent } from './listar-exclusiones/listar-exclusiones.component';
import { ListarCasosSuperiorPorAsignarComponent } from '../asignacion-superior/listar-casos-por-asignar/listar-casos-por-asignar.component';
import { ListarCasosPorRecepcionarComponent } from '../recepcion-caso-superior/listar-casos-por-recepcionar/listar-casos-por-recepcionar.component';
import { ListarConsultaCasosComponent } from '../consulta-casos/listar-casos/listar-casos.component';

export const routes: Routes = [
    {
        path: '',
        component: ExclusionFiscalSuperiorComponent,
        children: [
            {
                path: '',
                redirectTo: 'bandeja-exclusion-fiscal',
                pathMatch: 'full'
            },
            {
                path: 'bandeja-exclusion-fiscal',
                component: ListarExclusionFiscalSuperiorComponent,
                data: { idTipoElevacion:729 }
            },
            {
                path: 'asignacion-contienda',
                component: ListarCasosSuperiorPorAsignarComponent,
                data: { idTipoElevacion:729 }
            },
            {
                path: 'recepcion-contienda',
                component: ListarCasosPorRecepcionarComponent,
                data: { idTipoElevacion:729 }
            },
            {
                path: 'casos-contienda-competencia-contienda',
                component: ListarConsultaCasosComponent,
                data: { idTipoElevacion: 729 },
                loadChildren: () => import('../consulta-casos/consulta-casos-routes').then(m => m.ROUTES)
            },
        ],
      },
  ];
