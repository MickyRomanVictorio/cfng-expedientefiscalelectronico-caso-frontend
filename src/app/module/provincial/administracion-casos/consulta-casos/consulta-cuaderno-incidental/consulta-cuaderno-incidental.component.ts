import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CalificarCaso } from '@core/interfaces/provincial/administracion-casos/calificacion/CalificarCaso';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { InformacionCasoComponent } from '@modules/provincial/expediente/informacion-caso/informacion-caso.component';

@Component({
  selector: 'app-consulta-cuaderno-incidental',
  standalone: true,
  imports: [
    CommonModule,
    InformacionCasoComponent,
    RouterOutlet,
  ],
  templateUrl: './consulta-cuaderno-incidental.component.html'
})
export class ConsultaCuadernoIncidentalComponent {

  protected idCaso: string="";
  protected calificarCaso!: CalificarCaso;
  protected caso!: Expediente;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
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
