import { Routes } from '@angular/router';
import { DetalleCasoComponent } from '@modules/provincial/administracion-casos/consulta-casos/detalle-caso/detalle-caso.component';
import { ElevacionActuadosComponent } from './elevacion-actuados/elevacion-actuados.component';
import { ContiendaCompetenciaComponent } from './contienda-competencia/contienda-competencia.component';
import { ApelacionesAutoComponent } from './apelaciones-auto/apelaciones-auto.component';
import { ConsultaCuadernoIncidentalComponent } from '@modules/provincial/administracion-casos/consulta-casos/consulta-cuaderno-incidental/consulta-cuaderno-incidental.component';
import { ExclusionFiscalCasoElevadoComponent } from './exclusion-fiscal/exclusion-fiscal.component';
import { RetiroAcusacionCasoElevadoComponent } from './retiro-acusacion/retiro-acusacion.component';
import {
  ApelacionesSentenciaComponent
} from "@modules/superior/administracion-casos/consulta-casos-elevados/apelaciones-sentencia/apelaciones-sentencia.component";


export const ROUTES: Routes = [
  { path: '', redirectTo: 'elevacion-actuados', pathMatch: 'full' },
  { path: 'elevacion-actuados', component: ElevacionActuadosComponent },
  { path: 'contienda-competencia', component: ContiendaCompetenciaComponent },
  { path: 'apelacion-auto', component: ApelacionesAutoComponent},
  { path: 'apelacion-sentencia', component: ApelacionesSentenciaComponent},
  {path: 'exclusion-fiscal', component: ExclusionFiscalCasoElevadoComponent},
  {path: 'retiro-acusacion', component: RetiroAcusacionCasoElevadoComponent},
  {
    path: ':tipoNombreElevacion/caso/:idCaso',
    component: DetalleCasoComponent,
    loadChildren: () => import('src/app/module/provincial/expediente/expediente-detalle/expediente-detalle.routes').then((m) => m.ROUTES)
  },
  {
    path: ':tipoNombreElevacion/cuaderno-incidental/:idCaso',
    component: ConsultaCuadernoIncidentalComponent,
    loadChildren: () => import('src/app/module/provincial/administracion-casos/consulta-casos/consulta-cuaderno-incidental/consulta-cuadernos-incidentales.routes').then((m) => m.ROUTES)
  }
];
