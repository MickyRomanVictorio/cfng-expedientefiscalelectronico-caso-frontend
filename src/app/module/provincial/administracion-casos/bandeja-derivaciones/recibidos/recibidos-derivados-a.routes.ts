import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'derivado-por-revisar',
        pathMatch: 'full'
    },
    {
        path: 'derivado-por-revisar',
        loadComponent: () => import('./derivado-por-revisar/derivado-por-revisar.component'),
    },
    {
        path: 'derivado-aceptados',
        loadComponent: () => import('./derivado-aceptados/derivado-aceptados.component'),
    },
    {
        path: 'derivado-devueltos',
        loadComponent: () => import('./recibidos-derivado-devueltos/recibidos-derivado-devueltos.component'),
    },
    {
        path: 'derivado-revertidos',
        loadComponent: () => import('./derivado-revertidos/derivado-revertidos-recibido.component'),
    },
]

export default routes