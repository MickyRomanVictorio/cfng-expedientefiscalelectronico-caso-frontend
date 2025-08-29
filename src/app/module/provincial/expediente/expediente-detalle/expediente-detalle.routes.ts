import { Routes } from '@angular/router';
import { CarpetaAuxiliarComponent } from '@modules/provincial/expediente/expediente-detalle/carpeta-auxiliar/carpeta-auxiliar.component';
import { CuadernosIncidentalesComponent } from '@modules/provincial/expediente/expediente-detalle/cuadernos-incidentales/cuadernos-incidentales.component';
import { ListaCuadernosIncidentalesComponent } from '@modules/provincial/expediente/expediente-detalle/cuadernos-incidentales/lista-cuadernos-incidentales/lista-cuadernos-incidentales.component';
import { DetalleTramiteComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/detalle-tramite.component';
import { FuentesInvestigacionComponent } from "@modules/provincial/expediente/expediente-detalle/detalle-tramite/fuentes-investigacion/fuentes-investigacion.component";
import { HechosCasoComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/hechos-caso/hechos-caso.component';
import { TrazabilidadCasoComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/trazabilidad-caso/trazabilidad-caso.component';
import { ExpedienteResumenComponent } from '@modules/provincial/expediente/expediente-detalle/expediente-resumen/expediente-resumen.component';
import { ActoInvestigacionComponent } from './acto-investigacion/acto-investigacion.component';
import { ListaActosInvestigacionComponent } from './acto-investigacion/lista-actos-investigacion/lista-actos-investigacion.component';
import { CarpetaAuxiliarDetalleComponent } from './carpeta-auxiliar/carpeta-auxiliar-detalle/carpeta-auxiliar-detalle.component';
import { CarpetaPrincipalComponent } from './carpeta-auxiliar/carpeta-principal/carpeta-principal.component';
import { CuadernosEjecucionComponent } from './carpeta-auxiliar/cuadernos-ejecucion/cuadernos-ejecucion.component';
import { CuadernoPruebaComponent } from './cuaderno-prueba/cuaderno-prueba.component';
import { ListaCuadernoPruebaComponent } from './cuaderno-prueba/lista-cuaderno-prueba/lista-cuaderno-prueba.component';
import { ListaCuadernosExtremosComponent } from './cuadernos-extremos/lista-cuadernos-extremos/lista-cuadernos-extremos.component';
import { CuadernosExtremosComponent } from './cuadernos-extremos/cuadernos-extremos.component';
import { PagosComponent } from './pagos/pagos.component';
import { ApelacionesComponent } from '@modules/provincial/administracion-casos/consulta-casos/consulta-cuaderno-incidental/cuaderno-incidental-detalle/detalle-cuadernos-incidentales/apelaciones/apelaciones.component';
import { TramiteFormExitGuard } from '@guards/tramite-form-exit.guard';

export const ROUTES: Routes = [

  /***************************************/
  /*    RUTAS PARA DETALLE DE TRÁMITE    */
  /***************************************/

  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: ExpedienteResumenComponent },
  {
    path: 'acto-procesal',
    component: DetalleTramiteComponent,
    loadChildren: () => import('./detalle-tramite/detalle-tramite.routes').then((m) => m.ROUTES_ACTO_PROCESAL)
  },
  {
    path: 'hechos',
    component: DetalleTramiteComponent,
    canActivate: [TramiteFormExitGuard],
    children: [
      { path: '', component: HechosCasoComponent },
    ]
  },
  {
    path: 'sujeto',
    component: DetalleTramiteComponent,
    canActivate: [TramiteFormExitGuard],
    loadChildren: () => import('./detalle-tramite/detalle-tramite.routes').then((m) => m.ROUTES_SUJETO)
  },
  {
    path: 'historia-tramites',
    component: DetalleTramiteComponent,
    canActivate: [TramiteFormExitGuard],
    loadChildren: () => import('./detalle-tramite/detalle-tramite.routes').then((m) => m.ROUTES_HISTORIA)
  },
  {
    path: 'trazabilidad',
    component: DetalleTramiteComponent,
    children: [
      { path: '', component: TrazabilidadCasoComponent },
    ]
  },
  {
    path: 'fuentes-investigacion',
    component: DetalleTramiteComponent,
    children: [
      {path: '', component: FuentesInvestigacionComponent},
    ]
  },
  {
    path: 'apelaciones',
    component: DetalleTramiteComponent,
    canActivate: [TramiteFormExitGuard],
    children: [
      {path: '', component: ApelacionesComponent},
    ]
  },

  /**********************************************/
  /*    RUTAS PARA LOS CUADERNOS INCIDENTALES   */
  /**********************************************/

  {
    path:'cuadernos-incidentales',
    component: CuadernosIncidentalesComponent,
    canActivate: [TramiteFormExitGuard],
    children:[
      {
        path:'', component: ListaCuadernosIncidentalesComponent
      }
    ]
  },

  /**********************************************/
  /*    RUTAS PARA LOS CUADERNOS   */
  /**********************************************/

  {
    path:'cuadernos-extremos',
    component: CuadernosExtremosComponent,
    canActivate: [TramiteFormExitGuard],
    children:[
      {
        path:'', component: ListaCuadernosExtremosComponent, pathMatch: 'full'
      },
    ]
  },


  /***********************************/
  /*    RUTAS PARA CARPETA AUXILIAR  */
  /***********************************/

  {
    path:'carpeta-auxiliar',
    component: CarpetaAuxiliarComponent,
    canActivate: [TramiteFormExitGuard],
    children: [
      {
        path: '', component: CarpetaAuxiliarDetalleComponent, pathMatch: 'full'
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

  /**********************************************/
  /*    RUTAS PARA LOS PAGOS (NUEVO)  */
  /**********************************************/
  {
    path: 'pagos',
    canActivate: [TramiteFormExitGuard],
    children: [
      { path: '', component: PagosComponent },
    ]
  },

  /**********************************************/
  /*    RUTAS PARA LOS ACTOS DE INVESTIGACIÓN   */
  /**********************************************/

  {
    path:'acto-investigacion',
    component: ActoInvestigacionComponent,
    canActivate: [TramiteFormExitGuard],
    children: [
      {
        path: '', component: ListaActosInvestigacionComponent, pathMatch: 'full'
      }
    ]
  },

  /**********************************************/
  /*    RUTAS PARA CUADERNOS DE PRUEBA   */
  /**********************************************/
  {
    path:'cuaderno-prueba',
    component: CuadernoPruebaComponent,
    children: [
      {
        path: '', component: ListaCuadernoPruebaComponent, pathMatch: 'full'
      }
    ]
  },

];
