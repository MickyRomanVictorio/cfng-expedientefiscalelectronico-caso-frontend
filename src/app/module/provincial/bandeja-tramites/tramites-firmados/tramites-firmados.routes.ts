import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./../tramites-firmados/tramites-firmados.component'),
    },
    {
        path: '',
        loadComponent: () => import('./../tramites-firmados/tramites-firmados-filtro/tramites-firmados-filtro.component'),
        outlet: 'filtros'
    }
]

export default routes