import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ConsultaCasosSharedService } from '@services/provincial/consulta-casos/consulta-casos-shared.service';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { TabMenuModule } from 'primeng/tabmenu';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalle-cuaderno-incidental',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    TabMenuModule,
  ],
  templateUrl: './detalle-cuaderno-incidental.component.html',
  styleUrls: ['./detalle-cuaderno-incidental.component.scss']
})
export class DetalleCuadernoIncidentalComponent implements OnInit, OnDestroy {

  cuadernoIncidental = null;

  private subs: Subscription = new Subscription();

  items: any = [
    {
      id: 1,
      label: "Acto procesal",
      routerLink: `actoprocesal`,
      visible: true
    },
    {
      id: 2,
      label: "Elementos de convicción",
      routerLink: `elementos-conviccion`,
      visible: true

    },
    {
      id: 3,
      label: "Sujetos procesales",
      routerLink: `sujetos-procesales`,
      visible: true
    },
    {
      id: 4,
      label: "Resumen",
      routerLink: `resumen`,
      visible: true
    },
    {
      id: 5,
      label: "Apelaciones",
      routerLink: `apelaciones`,
      visible: true
    },
  ];

  constructor(
    private casoService: Casos,
    private route: ActivatedRoute,
    private gestionCasoService: GestionCasoService,
    private consultaCasosSharedService: ConsultaCasosSharedService
  ) {
  }

  async ngOnInit(): Promise<void> {
    const idCuaderno = this.route.snapshot.paramMap.get('idCuadernoIncidental')!;

    this.subs.add(
      this.casoService.obtenerCasoFiscal(idCuaderno).subscribe((cuadernoIncidental) => {
        this.cuadernoIncidental = cuadernoIncidental;
        this.gestionCasoService.expedienteActual = cuadernoIncidental;
        this.gestionCasoService.actualizarCaso({ cuadernoIncidental });
      })
    );


    this.consultaCasosSharedService.showtab$.subscribe(visible => {
      this.items[4].visible = visible;
    });

  }

  protected get getVisibleItems(): any[] {
    return this.items.filter((item: any) => item.visible !== false);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
