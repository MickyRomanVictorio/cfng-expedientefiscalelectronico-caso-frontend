import { Routes } from '@angular/router';
import { ID_ETAPA, etapaInfo } from '@constants/menu';
import { ListarConsultaCasosComponent } from './listar-casos/listar-casos.component';
import { TramiteFormExitGuard } from '@guards/tramite-form-exit.guard';
import { SeguimientoEjecucionComponent } from './seguimiento-ejecucion/seguimiento-ejecucion.component';
const rutasEtapas: any[] = [];
for (const [, value] of Object.entries(ID_ETAPA)) {
  let infoEtapa = etapaInfo(value)
  if (infoEtapa)
    rutasEtapas.push({
      path: infoEtapa.path,
      canActivate: [TramiteFormExitGuard],
      loadChildren: () => import('./consulta-casos-routes').then((m) => m.ROUTES),
      data: {
        titulo: infoEtapa.nombre,
        tipo_proceso: infoEtapa.tipoProceso,
        id_etapa: value
      }
    })
}

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ListarConsultaCasosComponent, data: { titulo: 'Consultar Casos Fiscales', generico: true } },
      ...rutasEtapas,
      { path: 'procesos-especiales', loadChildren: () => import('./consulta-casos-routes').then((m) => m.ROUTES), data: { titulo: 'Procesos especiales', tipo_proceso: 2 } },
      { path: 'concluidos', loadChildren: () => import('./consulta-casos-routes').then((m) => m.ROUTES), data: { titulo: 'Concluidos', generico: true, concluido: '1' } },
      { path: 'seguimiento-ejecucion', component: SeguimientoEjecucionComponent, canActivate: [TramiteFormExitGuard]},
    ]
  }
]
