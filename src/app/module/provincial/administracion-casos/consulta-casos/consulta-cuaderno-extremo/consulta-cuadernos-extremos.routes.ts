import { Routes } from "@angular/router";
import { CarpetaAuxiliarDetalleComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/carpeta-auxiliar-detalle/carpeta-auxiliar-detalle.component";
import { CarpetaAuxiliarComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/carpeta-auxiliar.component";
import { CarpetaPrincipalComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/carpeta-principal/carpeta-principal.component";
import { CuadernosEjecucionComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/cuadernos-ejecucion/cuadernos-ejecucion.component";
import { CuadernosIncidentalesComponent } from "@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/cuadernos-incidentales/cuadernos-incidentales.component";
import { CuadernosExtremosComponent } from "@modules/provincial/expediente/expediente-detalle/cuadernos-extremos/cuadernos-extremos.component";
import { ListaCuadernosExtremosComponent } from "@modules/provincial/expediente/expediente-detalle/cuadernos-extremos/lista-cuadernos-extremos/lista-cuadernos-extremos.component";
import { ListaCuadernosIncidentalesComponent } from "@modules/provincial/expediente/expediente-detalle/cuadernos-incidentales/lista-cuadernos-incidentales/lista-cuadernos-incidentales.component";
import { ExpedienteResumenComponent } from "@modules/provincial/expediente/expediente-detalle/expediente-resumen/expediente-resumen.component";
import { PagosComponent } from "@modules/provincial/expediente/expediente-detalle/pagos/pagos.component";

export const ROUTES: Routes = [

    {
        path: '',
        loadChildren: () => import('./cuaderno-extremo-detalle/cuaderno-extremo-detalle.routes').then((m) => m.ROUTES)
    },
    { path: 'inicio', component: ExpedienteResumenComponent },
    {
        path: 'cuadernos-incidentales',
        component: ListaCuadernosIncidentalesComponent,
    },
    {
        path: 'cuadernos-extremos',
        component: CuadernosExtremosComponent,
        children: [
            {
                path: '', component: ListaCuadernosExtremosComponent, pathMatch: 'full'
            },
        ]
    },
    {
        path: 'carpeta-auxiliar',
        component: CarpetaAuxiliarComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: CarpetaAuxiliarDetalleComponent
            },
            {
                path: 'carpeta-principal', component: CarpetaPrincipalComponent
            },
            {
                path: 'cuaderno-incidental', component: CuadernosIncidentalesComponent
            },
            {
                path: 'cuaderno-ejecucion', component: CuadernosEjecucionComponent
            }
        ]
    },
    { path: 'pagos', component: PagosComponent },

]
