import { Routes } from "@angular/router";
import BandejaTramitesComponent from "./bandeja-tramites.component";

export const routes: Routes = [
    {
        path: '',
        component: BandejaTramitesComponent,
        children: [
            {
                path: '',
                redirectTo: 'nuevos',
                pathMatch: 'full',
            },
            {
                path: 'nuevos',
                loadChildren: () => import('./tramites-nuevos/tramites-nuevos.routes'),
            },
            {
                path: 'enviados-para-revisar',
                loadChildren: () => import('./tramites-enviados-revisar/tramites-enviados-revisar.routes'),
            },
            {
                path: 'enviados-para-visar',
                loadChildren: () => import('./tramites-enviados-visar/tramites-enviados-visar.routes'),
            },
            {
                path: 'pendientes-para-revisar',
                loadChildren: () => import('./tramites-pendientes-revisar/tramites-pendientes-revisar.routes'),
            },
            {
                path: 'pendientes-para-visar',
                loadChildren: () => import('./tramites-pendientes-visar/tramites-pendientes-visar.routes'),
            },
            {
                path: 'firmados',
                loadChildren: () => import('./tramites-firmados/tramites-firmados.routes'),
            }
        ]
    },
]