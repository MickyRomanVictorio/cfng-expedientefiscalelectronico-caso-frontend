import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  CarpetaPrincipalComponent as CarpetaPrincipalCompartidoComponent } from '@components/modals/visor-efe-modal/carpeta-principal/carpeta-principal.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
@Component({
  selector: 'app-caso-carpeta-principal',
  standalone: true,
  imports: [
    CarpetaPrincipalCompartidoComponent,
    NgIf
  ],
  templateUrl: './carpeta-principal.component.html'
})
export class CarpetaPrincipalComponent implements OnInit {

  public caso!: Expediente;
  constructor(
    private gestionCasoService: GestionCasoService
  ) {}

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
  }

  protected datosInicioEmisor(datos: any) {
  }
}
