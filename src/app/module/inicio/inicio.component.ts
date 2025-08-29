import { Component, OnInit } from '@angular/core';
import { UsuarioAuthService } from '@core/services/auth/usuario.service.ts.service';
import { ResumenComponent as ResumenSuperiorComponent } from '@modules/superior/inicio/resumen/resumen.component';

@Component({
  standalone: true,
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  imports: [
    ResumenSuperiorComponent
  ]
})
export class InicioComponent implements OnInit {

  protected esJerarquiaSuperior:boolean = false;

  constructor(
    private readonly usuarioAuthService: UsuarioAuthService
  ) { }

  ngOnInit() {
    this.esJerarquiaSuperior = this.usuarioAuthService.esJerarquiaSuperior();
  }
}
