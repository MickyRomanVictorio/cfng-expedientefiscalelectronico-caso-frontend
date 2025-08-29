import { Routes } from '@angular/router';
import { ActoProcesalComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/acto-procesal/acto-procesal.component';
import { NavegacionSujetoProcesalComponent } from '@modules/provincial/administracion-casos/sujeto/navegacion-sujeto-procesal/navegacion-sujeto-procesal.component';
import { ListarSujetoProcesalComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/sujetos-procesales/listar-sujeto-procesal/listar-sujeto-procesal.component';
import { HistoriaCasoComponent } from './historia-caso/historia-caso.component';
import { TramitesActivosComponent } from './historia-caso/tramites-activos/tramites-activos.component';
import { TramitesEliminadosComponent } from './historia-caso/tramites-eliminados/tramites-eliminados.component';
import { TramiteFormExitGuard } from '@guards/tramite-form-exit.guard';

export const ROUTES_ACTO_PROCESAL: Routes = [
    { path: '', component: ActoProcesalComponent, canDeactivate: [TramiteFormExitGuard] },
    { path: 'acto/:idActoProcesal', component: ActoProcesalComponent, canDeactivate: [TramiteFormExitGuard] },
    { path: ':idActoTramiteCaso', component: ActoProcesalComponent, canDeactivate: [TramiteFormExitGuard] },
    { path: ':idActoTramiteCaso/editar', component: ActoProcesalComponent, canDeactivate: [TramiteFormExitGuard] },
    { path: ':idActoTramiteCaso/ver', component: ActoProcesalComponent, canDeactivate: [TramiteFormExitGuard] },
];

export const ROUTES_SUJETO: Routes = [
    { path: '', component: ListarSujetoProcesalComponent },
    { path: ':idSujeto', component: NavegacionSujetoProcesalComponent },
    { path: 'nuevo', component: NavegacionSujetoProcesalComponent }
];

export const ROUTES_HISTORIA: Routes = [
    {
        path: '',
        component: HistoriaCasoComponent,
        children: [
            { path: '', redirectTo: 'activos', pathMatch: 'full' },
            { path: 'activos', component: TramitesActivosComponent },
            { path: 'eliminados', component: TramitesEliminadosComponent }
        ]
    },
];
