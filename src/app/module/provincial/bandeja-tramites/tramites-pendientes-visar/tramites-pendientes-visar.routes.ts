import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./../tramites-pendientes-visar/tramites-pendientes-visar.component'),
    },
    {
        path: '',
        loadComponent: () => import('./../tramites-pendientes-visar/tramites-pendientes-visar-filtro/tramites-pendientes-visar-filtro.component'),
        outlet: 'filtros'
    }
]

export default routes