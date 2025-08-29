import { Routes } from "@angular/router";
import { BandejaDerivacionesEnviadosComponent } from "../bandeja-derivaciones-enviados.component";

export const routes: Routes = [
  {
    path: '',
    component: BandejaDerivacionesEnviadosComponent,
    children: [
      { path: '', component: BandejaDerivacionesEnviadosComponent, data: { titulo: 'derivado-aceptados' } },
      { path: 'derivado-aceptados', component: BandejaDerivacionesEnviadosComponent, data: { titulo: 'derivado-aceptados' } },
    ]
  }
];
