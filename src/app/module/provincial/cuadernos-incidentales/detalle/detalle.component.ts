import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterOutlet } from '@angular/router';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { ConsultaCasosSharedService } from "@services/provincial/consulta-casos/consulta-casos-shared.service";
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    TabMenuModule,
  ],
  templateUrl: './detalle.component.html',
  //styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {

  private cuadernoIncidental:string = '';

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
    private consultaCasosSharedService: ConsultaCasosSharedService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async (params: ParamMap) => {
      //this.route.data['cuadernoIncidental'] = '-';

      console.log('----', params.get('idCuaderno'));
      this.cuadernoIncidental = '-';
      //this.cuadernoIncidental = await lastValueFrom(this.casoService.obtenerCasoFiscal(params.get('idCuaderno')));

    });

    this.consultaCasosSharedService.showtab$.subscribe(visible => {
      this.items[4].visible = visible;
    });

  }

  protected get getVisibleItems(): any[] {
    return this.items.filter((item: any) => item.visible !== false);
  }

}
