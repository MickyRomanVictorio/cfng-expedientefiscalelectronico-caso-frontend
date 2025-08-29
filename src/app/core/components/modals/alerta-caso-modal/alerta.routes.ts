import { Routes } from '@angular/router';
import { BandejaAlertaCasoModalComponent } from '@components/modals/alerta-caso-modal/bandeja/bandejaalerta-caso-modal.component';

export const routes: Routes = [
  {
    path: '',
    component: BandejaAlertaCasoModalComponent,
    children: [],
  },
];
