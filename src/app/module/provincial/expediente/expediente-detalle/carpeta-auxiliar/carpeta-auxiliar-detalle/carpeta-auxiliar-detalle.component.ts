import { Component, OnInit } from '@angular/core';
import {  CarpetaAuxiliarComponent as CarpetaAuxiliarCompartidoComponent} from '@components/modals/visor-efe-modal/carpeta-auxiliar/carpeta-auxiliar.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
@Component({
  selector: 'app-carpeta-auxiliar-detalle',
  standalone: true,
  imports: [
    CarpetaAuxiliarCompartidoComponent
  ],
  templateUrl: './carpeta-auxiliar-detalle.component.html',
  styleUrls: ['./carpeta-auxiliar-detalle.component.scss']
})
export class CarpetaAuxiliarDetalleComponent implements OnInit {

  protected caso!: Expediente;

  constructor(
    private readonly gestionCasoService: GestionCasoService
  ) {}

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
  }
}
