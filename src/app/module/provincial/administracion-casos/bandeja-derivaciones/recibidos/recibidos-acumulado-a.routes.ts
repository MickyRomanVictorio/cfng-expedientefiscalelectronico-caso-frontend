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
        path: 'acumulados-aceptados',
        loadComponent: () => import('./acumulados-aceptados/acumulados-aceptados.component')
    },
    {
        path: 'acumulado-devueltos',
        loadComponent: () => import('./acumulado-devueltos/acumulado-devueltos.component')
    },
    {
        path: 'acumulado-revertidos',
        loadComponent: () => import('./bandeja-acumulado-revertidos/bandeja-acumulado-revertidos.component')
    }
]

export default routes