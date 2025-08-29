import { Routes } from "@angular/router";
import { ContiendasSuperiorComponent } from "./contiendas-superior/contiendas-superior.component";
import { ApelacionCasoSuperiorComponent } from "./apelacion-caso-superior/apelacion-caso-superior.component";
import { AdministracionCasosSuperiorComponent } from "./administracion-casos-superior.component";
import { AsignacionComponent } from "./asignacion-superior/asignacion.component";
import { ElevacionActuadosComponent } from "./elevacion-actuados/elevacion-actuados.component";
import { ExclusionFiscalSuperiorComponent } from "./exclusion-fiscal-superior/exclusion-fiscal-superior.component";

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'bandejas/elevacion-actuados',
        pathMatch: 'full',
    },
    {
        path: '',
        component: AdministracionCasosSuperiorComponent,
        children: [
            {
                path: 'elevacion-actuados',
                component: ElevacionActuadosComponent,
                loadChildren: () => import('@modules/superior/administracion-casos/elevacion-actuados/elevacion-actuados-routes').then((m) => m.routes)
            },
            {
                path: 'apelacion',
                component: ApelacionCasoSuperiorComponent,
                loadChildren: () => import('@modules/superior/administracion-casos/apelacion-caso-superior/apelacion-caso-superior-routes').then((m) => m.routes)
            },
            {
                path: 'contienda-competencia',
                component: ContiendasSuperiorComponent,
                loadChildren: () => import('@modules/superior/administracion-casos/contiendas-superior/contiendas-superior-routes').then((m) => m.routes)
            },
            {
                path: 'elevacion-consulta',
                component: AsignacionComponent,
                loadChildren: () => import('@modules/superior/administracion-casos/elevacion-actuados/elevacion-actuados-routes').then((m) => m.routes)
            },
            {
                path: 'exclusion-fiscal',
                component: ExclusionFiscalSuperiorComponent,
                loadChildren: () => import('@modules/superior/administracion-casos/exclusion-fiscal-superior/exclusion-fiscal-superior-routes').then((m) => m.routes)
            },
              {
                path: 'casos-observados',
                component: ExclusionFiscalSuperiorComponent,
                loadChildren: () => import('@modules/superior/administracion-casos/exclusion-fiscal-superior/exclusion-fiscal-superior-routes').then((m) => m.routes)
            },
            {
                path: 'asignacion-superior',
                component: AsignacionComponent,
                loadChildren: () => import('@modules/superior/administracion-casos/asignacion-superior/asignacion-routes').then((m) => m.routes)
            },
        ],
    },

    {
      path:'consultar-casos-fiscales-monitoreados',
      loadChildren: () => import('@modules/superior/administracion-casos/consulta-casos-monitoreados/consulta-casos-monitoreados.-routes').then((m) => m.ROUTES)
    },
    {
      path:'bandejas',
      loadChildren:()=> import('@modules/superior/administracion-casos/bandejas/bandejas-routes').then((m) => m.ROUTES)
    },
    {
      path:'asignacion',
      loadChildren:()=> import('@modules/superior/administracion-casos/asignacion/asignacion-routes').then((m) => m.ROUTES)
    },
    {
      path:'recepcion',
      loadChildren:()=> import('@modules/superior/administracion-casos/recepcion/recepcion-routes').then((m) => m.ROUTES)
    },
    {
      path:'consultar-casos-fiscales-elevados',
      loadChildren: () => import('@modules/superior/administracion-casos/consulta-casos-elevados/consulta-casos-elevados-routes').then((m) => m.ROUTES)
    },
];
