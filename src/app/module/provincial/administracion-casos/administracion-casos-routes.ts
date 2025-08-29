import { Routes } from "@angular/router";
import { AdministracionCasosComponent } from "./administracion-casos.component";
import { AsignacionComponent } from "./asignacion/asignacion.component";
import { ReasignacionCasoComponent } from "./reasignacion-caso/reasignacion-caso.component";
import {
  ListarCasosPorRecepcionarComponent
} from "@modules/provincial/administracion-casos/recepcion/listar-casos-por-recepcionar.component";
import { ListarCasosPorContiendasComponent } from "./contiendas/listar-casos-por-contiendas.component";
import { RespuestaSuperiorComponent } from "./respuesta-superior/respuesta-superior.component";
import { TramiteFormExitGuard } from '@guards/tramite-form-exit.guard';



export const routes: Routes = [
    {
        path: '',
        redirectTo: 'asignacion',
        pathMatch: 'full',
    },
    {
        path: '',
        component: AdministracionCasosComponent,
        children: [
            {
                path: 'asignacion',
                component: AsignacionComponent,
                canActivate: [TramiteFormExitGuard],
                loadChildren: () => import('./asignacion/asignacion-routes').then((m) => m.routes)
            },
            {
                path: 'recepcion',
                component: ListarCasosPorRecepcionarComponent,
                canActivate: [TramiteFormExitGuard]
            },
            {
                path: 'reasignar-caso',
                component: ReasignacionCasoComponent,
                canActivate: [TramiteFormExitGuard]
            },
            {
                path: 'consultar-casos-fiscales',
                canActivate: [TramiteFormExitGuard],
                loadChildren: () => import('./consulta-casos/consulta-casos-etapas-routes').then(m => m.routes)
            },
            {
                path: 'derivaciones',
                canActivate: [TramiteFormExitGuard],
                loadChildren: () => import('./bandeja-derivaciones/bandeja-derivaciones.routes').then(m => m.routes)
            },
            {
                path: 'exhortos',
                component: ListarCasosPorRecepcionarComponent,
                canActivate: [TramiteFormExitGuard]
            },
            {
                path: 'contiendas',
                component: ListarCasosPorContiendasComponent,
                canActivate: [TramiteFormExitGuard]
            },
            {
                path: 'elevacion-respuestas',
                component: RespuestaSuperiorComponent,
                canActivate: [TramiteFormExitGuard]
            },
        ],
    },
];
