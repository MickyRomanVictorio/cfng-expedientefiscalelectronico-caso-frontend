import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./../carga-laboral/carga-laboral.component'),
  }
]

export default routes
