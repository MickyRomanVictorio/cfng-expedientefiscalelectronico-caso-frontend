import { Component, input } from '@angular/core';
import { UsuarioAuthService } from '@core/services/auth/usuario.service.ts.service';
import {
  ActoProcesalComponent
} from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/acto-procesal/acto-procesal.component';

@Component({
  selector: 'app-tramite',
  standalone: true,
  imports: [
    ActoProcesalComponent
  ],
  templateUrl: './tramite.component.html',
  styleUrl: './tramite.component.scss'
})
export class TramiteComponent{

  public idActoTramiteCaso = input<string>('');
  public isTramiteEnModoEdicion = input<boolean>(false);
  protected readonly esSuperior: boolean = false;

  constructor(private readonly usuarioAuthService: UsuarioAuthService) {
    this.esSuperior = this.usuarioAuthService.esJerarquiaSuperior();
  }

}
