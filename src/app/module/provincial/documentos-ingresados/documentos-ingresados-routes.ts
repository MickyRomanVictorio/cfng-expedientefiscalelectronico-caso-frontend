import { Routes } from "@angular/router";
//import { NotificacionesComponent } from "@modulos/notificaciones/notificaciones.component";
import { DocumentosIngresadosComponent } from "./documentos-ingresados.component";

export const routes: Routes = [
    {
        path: '',
        component: DocumentosIngresadosComponent,
    },
    {
        path: 'bandeja-escritos',
        component: DocumentosIngresadosComponent,
    },
   /* {
        path: 'notificaciones-pj',
        component: NotificacionesComponent
    }*/
];