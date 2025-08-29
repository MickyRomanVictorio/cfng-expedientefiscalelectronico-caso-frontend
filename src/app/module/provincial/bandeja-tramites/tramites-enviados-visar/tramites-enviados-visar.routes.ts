import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./../tramites-enviados-visar/tramites-enviados-visar.component'),
    },
    {
        path: '',
        loadComponent: () => import('./../tramites-enviados-visar/tramites-enviados-visar-filtro/tramites-enviados-visar-filtro.component'),
        outlet: 'filtros'
    }
]

export default routes