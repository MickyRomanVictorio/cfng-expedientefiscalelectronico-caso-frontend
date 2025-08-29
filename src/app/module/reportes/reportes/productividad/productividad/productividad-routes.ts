import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./../productividad/productividad.component'),
  }
]

export default routes
