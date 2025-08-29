import { Routes } from '@angular/router';
import { AsignacionComponent } from './asignacion.component';
import { ListarCasosSuperiorPorAsignarComponent } from './listar-casos-por-asignar/listar-casos-por-asignar.component';
import { ListarCasosPorRecepcionarComponent } from '../recepcion-caso-superior/listar-casos-por-recepcionar/listar-casos-por-recepcionar.component';

export const routes: Routes = [
  {
    path: '',
    component: AsignacionComponent,
    children: [
      { path: '', redirectTo: 'asignacion-superior', pathMatch: 'full' },
      {
        path: 'asignacion-superior',
        component: ListarCasosSuperiorPorAsignarComponent,
        data: { idTipoElevacion:724 }
      }
    ],
  },
];
