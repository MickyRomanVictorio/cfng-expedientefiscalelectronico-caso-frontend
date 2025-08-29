import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Casos} from '@services/provincial/consulta-casos/consultacasos.service';
import {ActivatedRoute} from '@angular/router';
import {lastValueFrom} from 'rxjs';
import {GestionCasoService} from '@services/shared/gestion-caso.service';
import {ActoProcesalComponent as ActoProcesalBaseComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/acto-procesal/acto-procesal.component';

@Component({
  selector: 'app-acto-procesal',
  standalone: true,
  imports: [
    CommonModule,
    ActoProcesalBaseComponent
  ],
  templateUrl: './acto-procesal.component.html',
  styleUrls: ['./acto-procesal.component.scss']
})
export class ActoProcesalComponent implements OnInit {

  cuadernoIncidental = null;


  constructor(
    private casoService: Casos,
    private route: ActivatedRoute,
    private gestionCasoService: GestionCasoService
  ) {
  }

  async ngOnInit() {

    const idCuaderno = this.route.snapshot.parent!.paramMap.get('idCuaderno')!;

    const cuadernoIncidental = await lastValueFrom(this.casoService.obtenerCasoFiscal(idCuaderno));
    this.gestionCasoService.actualizarCaso({cuadernoIncidental});


  }




}
