import { Routes } from '@angular/router';
import { RecepcionComponent } from './recepcion.component';
import { ListarCasosPorRecepcionarComponent } from './listar-casos-por-recepcionar/listar-casos-por-recepcionar.component';

export const routes: Routes = [
  {
    path: '',
    component: RecepcionComponent,
    children: [
      { path: '', redirectTo: 'listar-casos-por-recepcionar-superior', pathMatch: 'full' },
      {
        path: 'listar-casos-por-recepcionar-superior',
        component: ListarCasosPorRecepcionarComponent
      }
    ],

  },
];
