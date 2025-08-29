import { Routes } from '@angular/router';
import { AsignacionComponent } from './asignacion.component';
import { ListarCasosAnuladosComponent } from './listar-casos-anulados/listar-casos-anulados.component';
import { ListarCasosPorAsignarComponent } from './listar-casos-por-asignar/listar-casos-por-asignar.component';

export const routes: Routes = [
  {
    path: '',
    component: AsignacionComponent,
    children: [
      { path: '', redirectTo: 'listar-casos-por-asignar', pathMatch: 'full' },
      {
        path: 'listar-casos-por-asignar',
        component: ListarCasosPorAsignarComponent
      },
      {
        path: 'listar-casos-anulados',
        component: ListarCasosAnuladosComponent
      }
    ],
  },
];
