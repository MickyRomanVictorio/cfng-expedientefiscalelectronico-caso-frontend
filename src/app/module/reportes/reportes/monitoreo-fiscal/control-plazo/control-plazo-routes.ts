import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
     loadComponent: () =>
       import('./../control-plazo/control-plazo.component').then(m => m.default),
  },
];

export default routes;
