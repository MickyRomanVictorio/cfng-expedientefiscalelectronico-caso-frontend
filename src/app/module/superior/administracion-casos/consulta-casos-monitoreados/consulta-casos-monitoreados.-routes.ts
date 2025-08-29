import { Routes } from '@angular/router';
import { ListarConsultaCasosComponent } from './listar-casos/listar-casos.component';

export const ROUTES: Routes = [
  { path: '', component: ListarConsultaCasosComponent },
  { path: 'caso', redirectTo: '', pathMatch: 'full' }
];
