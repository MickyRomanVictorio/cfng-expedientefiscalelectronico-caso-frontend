import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./../tramites-pendientes-revisar/tramites-pendientes-revisar.component'),
    },
    {
        path: '',
        loadComponent: () => import('./../tramites-pendientes-revisar/tramites-pendientes-revisar-filtro/tramites-pendientes-revisar-filtro.component'),
        outlet: 'filtros'
    }
]

export default routes