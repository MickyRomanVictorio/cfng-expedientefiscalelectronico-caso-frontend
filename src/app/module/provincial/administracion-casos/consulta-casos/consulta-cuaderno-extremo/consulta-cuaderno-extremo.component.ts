import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { InformacionCasoComponent } from '@modules/provincial/expediente/informacion-caso/informacion-caso.component';
import { CuadernoExtremoDetalleComponent } from './cuaderno-extremo-detalle/cuaderno-extremo-detalle.component';

@Component({
  selector: 'app-consulta-cuaderno-extremo',
  standalone:true,
  imports: [
    CommonModule,
    InformacionCasoComponent,
    CuadernoExtremoDetalleComponent
  ],
  template: `
    @if(gestionCasoService.dataObtenida) {
      <app-informacion-caso/>
      <cuaderno-extremo-detalle/>
    }
  `
})
export class ConsultaCuadernoExtremoComponent {

  protected idCaso!: string;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    protected gestionCasoService: GestionCasoService
  ) {  }

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.idCaso = this.activatedRoute.snapshot.paramMap.get('idCaso')!;
    console.log("Inicializar: "+this.idCaso)
    this.gestionCasoService.obtenerCasoFiscal( this.idCaso );
    
  }

  ngOnDestroy(): void {
    this.gestionCasoService.dataObtenida = false
  }

}
