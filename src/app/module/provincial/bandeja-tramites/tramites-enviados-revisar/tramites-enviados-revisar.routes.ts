import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./../tramites-enviados-revisar/tramites-enviados-revisar.component'),
    },
    {
        path: '',
        loadComponent: () => import('./../tramites-enviados-revisar/tramites-enviados-revisar-filtro/tramites-enviados-revisar-filtro.component'),
        outlet: 'filtros'
    }
]

export default routes