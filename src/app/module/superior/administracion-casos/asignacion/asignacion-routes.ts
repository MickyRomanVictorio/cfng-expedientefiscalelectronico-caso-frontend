import { Routes } from '@angular/router';
import { PorAsignarComponent } from './por-asignar/por-asignar.component';
import { AsignadosComponent } from './asignados/asignados.component';

export const ROUTES: Routes = [
  { path: '', component: PorAsignarComponent },
  {
    path: 'asignados', component: AsignadosComponent,
  }
];
