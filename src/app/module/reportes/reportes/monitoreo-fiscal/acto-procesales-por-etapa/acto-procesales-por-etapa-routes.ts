import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./../acto-procesales-por-etapa/acto-procesales-por-etapa.component').then(m => m.default),
  }
]

export default routes
