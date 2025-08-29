import { Routes } from '@angular/router';
import { ApelacionesAutoYSentenciaComponent } from './apelaciones-auto-y-sentencia/apelaciones-auto-y-sentencia.component';
import { ContiendaCompetenciaComponent } from './contienda-competencia/contienda-competencia.component';
import { ElevacionActuadosComponent } from './elevacion-actuados/elevacion-actuados.component';
import { ObservadosComponent as ElevacionActuadosObservadosComponent } from './elevacion-actuados/observados/observados.component';
import { RetiroAcusacionComponent } from './retiro-acusacion/retiro-acusacion.component';
import { ObservadosComponent as ContiendaCompetenciaObservadosComponent } from './contienda-competencia/observados/observados.component';
import { ObservadosComponent as ApelacionesAutoYSentenciaObservadosComponent } from './apelaciones-auto-y-sentencia/observados/observados.component';
import { ExclusionFiscalSuperiorComponent } from '../exclusion-fiscal-superior/exclusion-fiscal-superior.component';
import { ExclusionFiscalComponent } from './exclusion-fiscal/exclusion-fiscal.component';
import { CasosObservadosComponent } from './casos-observados/casos-observados.component';



export const ROUTES: Routes = [
  { path: '', component: ElevacionActuadosComponent },
  {
    path: 'elevacion-actuados', component: ElevacionActuadosComponent,
  },
  {
    path: 'elevacion-actuados/observados', component: ElevacionActuadosObservadosComponent,
  },
  {
    path: 'contienda-competencia', component: ContiendaCompetenciaComponent,
  },
  {
    path: 'exclusion-fiscal', component: ExclusionFiscalComponent,
  },
  {
    path: 'contienda-competencia/observados', component: ContiendaCompetenciaObservadosComponent,
  },
  {
    path: 'apelaciones-auto-sentencia', component: ApelacionesAutoYSentenciaComponent,
  },
  {
    path: 'apelaciones-auto-sentencia/observados', component: ApelacionesAutoYSentenciaObservadosComponent,
  },
  {
    path: 'retiro-acusacion', component: RetiroAcusacionComponent,
  },
   {
    path: 'casos-observados', component: CasosObservadosComponent,
  },
  { path: 'caso', redirectTo: '', pathMatch: 'full' },
];
