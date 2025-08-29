import { Routes } from '@angular/router'

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'acumulado-por-revisar',
        pathMatch: 'full'
    },
    { 
        path: 'acumulado-por-revisar',
        loadComponent: () => import('./acumulado-por-revisar/acumulado-por-revisar.component')
    },
    {
        path: 'acumulado-aceptados',
        loadComponent: () => import('./acumulado-aceptados/acumulado-aceptados.component')
    },
    {
        path: 'acumulado-devueltos',
        loadComponent: () => import('./acumulado-devueltos/acumulado-devueltos.component')
    },
    {
        path: 'acumulado-revertidos',
        loadComponent: () => import('./acumulado-revertidos/acumulado-revertidos.component')
    }
]

export default routes