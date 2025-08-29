import { Routes } from '@angular/router';
import { ElevacionActuadosComponent } from './elevacion-actuados.component';
import { ListarCasosObservadosComponent } from './listar-casos-observados/listar-casos-observados.component';
import { ListarCasosElevacionActuadosComponent } from './listar-casos-elevacion-actuados/listar-casos-elevacion-actuados.component';
import { ListarCasosSuperiorPorAsignarComponent } from '@modules/superior/administracion-casos/asignacion-superior/listar-casos-por-asignar/listar-casos-por-asignar.component';
import { ListarCasosResueltosComponent } from './listar-casos-resueltos/listar-casos-resueltos.component';
import { ContiendasObservadasComponent } from '@modules/superior/administracion-casos/contiendas-superior/contiendas-observadas/contiendas-observadas.component';
import { ListarCasosPorRecepcionarComponent } from '../recepcion-caso-superior/listar-casos-por-recepcionar/listar-casos-por-recepcionar.component';
import { ListarConsultaCasosComponent } from '../consulta-casos/listar-casos/listar-casos.component';

export const routes: Routes = [
  {
    path: '',
    component: ElevacionActuadosComponent,
    children: [
      {
        path: '',
        redirectTo: 'bandeja',
        pathMatch: 'full',
      },
      {
        path: 'bandeja',
        component: ListarCasosElevacionActuadosComponent,
        data: { idTipoElevacion: 724 },
      },
      {
        path: 'asignacion-superior',
        component: ListarCasosSuperiorPorAsignarComponent,
        data: { idTipoElevacion: 724 },
      },
      {
        path: 'recepcion',
        component: ListarCasosPorRecepcionarComponent,
        data: { idTipoElevacion: 724 },
      },
      {
        path: 'caso-elevado',
        component: ListarConsultaCasosComponent,
        data: { idTipoElevacion: 724 },
        loadChildren: () =>
          import('../consulta-casos/consulta-casos-routes').then(
            (m) => m.ROUTES
          ),
      },
      //elevacion consulta
      {
        path: 'bandeja-elevacion',
        component: ListarCasosElevacionActuadosComponent,
        data: { idTipoElevacion: 728 },
      },
      {
        path: 'asignacion-elevacion',
        component: ListarCasosSuperiorPorAsignarComponent,
        data: { idTipoElevacion: 728 },
      },
      //exclusion fiscal
      {
        path: 'bandeja-exclusion',
        component: ListarCasosElevacionActuadosComponent,
        data: { idTipoElevacion: 729 },
      },
      {
        path: 'asignacion-exclusion',
        component: ListarCasosSuperiorPorAsignarComponent,
        data: { idTipoElevacion: 729 },
      },
      {
        path: 'listar-casos-observados',
        component: ListarCasosObservadosComponent,
      },
      {
        path: 'contiendas-observadas',
        component: ContiendasObservadasComponent,
      },
      {
        path: 'listar-casos-resueltos/:idTipoElevacion',
        component: ListarCasosResueltosComponent,
      },
    ],
  },
];
