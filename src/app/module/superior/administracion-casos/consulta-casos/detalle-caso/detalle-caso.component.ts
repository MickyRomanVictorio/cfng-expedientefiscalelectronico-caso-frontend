import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CalificarCasoService } from '@services/provincial/calificar/calificar-caso.service';
import { CalificarCaso } from '@interfaces/provincial/administracion-casos/calificacion/CalificarCaso';
import { take } from 'rxjs';
//import { StorageService } from '@core/services/shared/storage.service';
import { LOCALSTORAGE } from '@environments/environment';
import { TimeLineCasoComponent } from '@components/generales/linea-tiempo/linea-tiempo.component';
import { InformacionCasoComponent } from '@modules/provincial/expediente/informacion-caso/informacion-caso.component';
import { ExpedienteDetalleComponent } from '@modules/provincial/expediente/expediente-detalle/expediente-detalle.component';
@Component({
  standalone: true,
  selector: 'app-detalle-caso',
  templateUrl: './detalle-caso.component.html',
  styleUrls: ['./detalle-caso.component.scss'],
  imports: [
    InformacionCasoComponent,
    TimeLineCasoComponent,
    ExpedienteDetalleComponent,
  ]
})
export class DetalleCasoComponent implements OnInit {

  protected idCaso: string;
  protected calificarCaso!: CalificarCaso;
  constructor(
    private activatedRoute: ActivatedRoute,
    private calificarCasoService: CalificarCasoService,
    // private storageService: StorageService
  ) {
    this.idCaso = this.activatedRoute.snapshot.paramMap.get('caso')!;
    //this.obtenerCaso(this.idCaso);
  }

  comun = [
    { label: 'Calificación' },
    { label: 'Preliminar' },
    { label: 'Preparatoria' },
    { label: 'Intermedia' },
    { label: 'Juzgamiento' },
    { label: 'Sentencia' }
  ];
  especial = [
    { label: 'Incoación de proceso inmediato' },
    { label: 'Juicio inmediato' },
    { label: 'Ejecucion de sentencia' },
  ];

  current_etapa: string = 'Juicio inmediato'

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }
  private obtenerCaso(idCaso:any): void {
    this.calificarCasoService.obtenerInformacionCalificarCaso(idCaso)
      .pipe(take(1))
      .subscribe({
        next: resp => {
          this.calificarCaso = resp;
          // this.storageService.createItem(LOCALSTORAGE.CALIFICAR_CASO_KEY,JSON.stringify(this.calificarCaso));
        }
      })
  }
}
