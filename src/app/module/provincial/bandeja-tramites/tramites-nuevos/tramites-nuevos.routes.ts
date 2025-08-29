import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./../tramites-nuevos/tramites-nuevos.component'),
    },
    {
        path: '',
        loadComponent: () => import('./../tramites-nuevos/tramites-nuevos-filtro/tramites-nuevos-filtro.component'),
        outlet: 'filtros'
    }
]

export default routes