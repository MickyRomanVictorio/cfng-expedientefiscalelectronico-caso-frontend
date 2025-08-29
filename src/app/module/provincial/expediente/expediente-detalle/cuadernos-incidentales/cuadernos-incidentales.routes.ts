import { Routes } from "@angular/router";
import { ApelacionesComponent } from "@modules/provincial/cuadernos-incidentales/detalle/apelaciones/apelaciones/apelaciones.component";
import { ElementosConviccionComponent } from "@modules/provincial/expediente/expediente-detalle/cuadernos-incidentales/detalle-cuaderno-incidental/elementos-conviccion/elementos-conviccion.component";
import { ResumenComponent } from "@modules/provincial/expediente/expediente-detalle/cuadernos-incidentales/detalle-cuaderno-incidental/resumen/resumen.component";

export const ROUTES: Routes = [
    { path: '', redirectTo: 'acto-procesal', pathMatch: 'full' },
    {
        path: 'acto-procesal',
        loadChildren: () => import('../detalle-tramite/detalle-tramite.routes').then((m) => m.ROUTES_ACTO_PROCESAL)
    },
    {
        path: 'elementos-conviccion',
        children: [
            { path: '', component: ElementosConviccionComponent },
        ]
    },
    {
        path: 'apelaciones', component: ApelacionesComponent
    },
    {
        path: 'sujeto',
        loadChildren: () => import('../detalle-tramite/detalle-tramite.routes').then((m) => m.ROUTES_SUJETO)
    },
    {
        path: 'resumen',
        children: [
            { path: '', component: ResumenComponent },
        ]
    },
]