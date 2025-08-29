import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CalificarCaso } from '@interfaces/provincial/administracion-casos/calificacion/CalificarCaso';
import { CommonModule } from '@angular/common';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { InformacionCasoComponent } from '@modules/provincial/expediente/informacion-caso/informacion-caso.component';
import { TimeLineCasoComponent } from '@components/generales/linea-tiempo/linea-tiempo.component';
import { Expediente } from '@utils/expediente';
import { ExpedienteDetalleComponent } from '@modules/provincial/expediente/expediente-detalle/expediente-detalle.component';

@Component({
  standalone: true,
  selector: 'app-detalle-caso',
  templateUrl: './detalle-caso.component.html',
  styleUrls: ['./detalle-caso.component.scss'],
  imports: [
    CommonModule,
    TimeLineCasoComponent,
    InformacionCasoComponent,
    ExpedienteDetalleComponent
]
})
export class DetalleCasoComponent implements OnInit, OnDestroy {

  protected idCaso: string="";
  protected calificarCaso!: CalificarCaso;
  protected caso!: Expediente;
  constructor(
    private activatedRoute: ActivatedRoute,
    protected gestionCasoService: GestionCasoService
  ) {  }

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.idCaso = this.activatedRoute.snapshot.paramMap.get('idCaso')!;
    this.gestionCasoService.obtenerCasoFiscal( this.idCaso );
  }

  ngOnDestroy(): void {
    this.gestionCasoService.dataObtenida = false
  }

}
