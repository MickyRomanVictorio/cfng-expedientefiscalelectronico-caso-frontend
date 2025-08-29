import { Routes } from '@angular/router';
import { ApelacionCasoSuperiorComponent } from "./apelacion-caso-superior.component";
import { ApelacionAutoComponent } from './apelacion-auto/apelacion-auto.component';
import { ApelacionSentenciaComponent } from './apelacion-sentencia/apelacion-sentencia.component';
import { ListarCasosSuperiorPorAsignarComponent } from '../asignacion-superior/listar-casos-por-asignar/listar-casos-por-asignar.component';
import { ListarCasosPorRecepcionarComponent } from '../recepcion-caso-superior/listar-casos-por-recepcionar/listar-casos-por-recepcionar.component';
import { ListarCasosElevacionActuadosComponent } from '../elevacion-actuados/listar-casos-elevacion-actuados/listar-casos-elevacion-actuados.component';

export const routes: Routes = [
    {
        path: '',
        component: ApelacionCasoSuperiorComponent,
        children: [
          { 
            path: '', 
            redirectTo: 'bandeja-apelacion', 
            pathMatch: 'full' 
          },
          { 
            path: 'bandeja-apelacion',
            component: ListarCasosElevacionActuadosComponent,
            data: { idTipoElevacion:726, idtipoElevacionAsunto:727 }
          },
          { 
            path: 'asignacion-superior-apelacion',
            component: ListarCasosSuperiorPorAsignarComponent,
            data: { idTipoElevacion:726, idtipoElevacionAsunto:727 }
          },
          {
            path: 'recepcion',
            component: ListarCasosPorRecepcionarComponent,
            data: { idTipoElevacion: 724 }
          },
          { 
            path: 'apelacion-auto',
            component: ApelacionAutoComponent,
            data: { idTipoElevacion:726 }
          },
          { 
            path: 'apelacion-sentencia',
            component: ApelacionSentenciaComponent,
            data: { idTipoElevacion:727 }
          },
        ],
      },
  ];