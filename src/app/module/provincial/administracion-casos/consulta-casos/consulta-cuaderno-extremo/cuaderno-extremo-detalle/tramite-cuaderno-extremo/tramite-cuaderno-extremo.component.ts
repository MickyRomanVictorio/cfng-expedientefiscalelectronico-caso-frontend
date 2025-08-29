import { Component, OnInit } from '@angular/core';
import { Expediente } from '@core/utils/expediente';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { urlConsultaCuaderno } from '@core/utils/utils';
import { ApelacionNuevoService } from '@core/services/shared/apelacion-nuevo.service';
import { CommonModule } from '@angular/common';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';

@Component({
  selector: 'app-detalle-cuadernos-extremos',
  standalone: true,
  imports: [
    TabViewModule,
    TabMenuModule,
    CommonModule
  ],
  templateUrl: './tramite-cuaderno-extremo.component.html',
  styleUrl: './tramite-cuaderno-extremo.component.scss'
})
export class DetalleCuadernosExtremosComponent implements OnInit {
  private caso!: Expediente;

  protected items: MenuItem[]  = [];

  activeItem: MenuItem | undefined;

  activeIndex = 0;

  protected tieneApelaciones = false;

  protected existeNuevo: boolean = true;

  constructor(private readonly router: Router,
              private readonly activatedRoute: ActivatedRoute,
              private readonly tramiteService: TramiteService,
              private readonly gestionCasoService: GestionCasoService,
              private readonly apelacionNuevoService: ApelacionNuevoService) {
  }

  ngOnInit(): void {
    this.apelacionNuevoService.valueExisteNuevo$.subscribe({
      next: (value) => {
        this.existeNuevo = value;
      },
    });

    this.caso = this.gestionCasoService.casoActual;

    const apelacionesInt = parseInt(this.caso?.flgOpcionApelaciones ?? '0');

    this.tieneApelaciones = apelacionesInt >= 1;

    this.existeNuevo = apelacionesInt > 1;

    this.gestionCasoService.expedienteActual = this.caso;

    const urlConsultaCaso = urlConsultaCuaderno('extremo', this.caso );

    this.items = [
      {
        label: 'Acto procesal',
        url: `${urlConsultaCaso}/acto-procesal`,
      },
      /*{
        label: 'Elementos de Convicción',
        url: `${urlConsultaCaso}/elementos-conviccion`,
      },*/
      {
        label: 'Sujetos procesales',
        url: `${urlConsultaCaso}/sujeto`,
      },
      /*{
        label: 'Resumen',
        url: `${urlConsultaCaso}/resumen`,
      },*/
      {
        label: 'Historia del extremo',
        url: `${urlConsultaCaso}/historia-extremo`,
      },
      {
        id: 'AA',
        label: `Apelaciones`,
        escape: false,
        visible: this.tieneApelaciones,
        url: `${urlConsultaCaso}/apelaciones`,
      },
    ];
    this.activatedRoute.url.subscribe({
      next: (url) => {
        const pre = this.items.findIndex((i, index) => i.url?.endsWith(url[0].path));
        if (pre >= 0) {
          this.activeItem = this.items[pre];
          this.activeIndex = pre;
        }
      }
    });
  }

  clickTab(event: Event, item: MenuItem, index: number) {
    this.cambiarPanel(event, item, index);
  }

  cambiarPanel(event: any, item: any, index: number): void {
    if (this.tramiteService.tabConValidacion()) {
      this.tramiteService.ejecutarValidacion().subscribe({
        next: (confirmar) => {
          console.log(confirmar)
          if (confirmar) {
            this.tramiteService.limpiarValidacion();
            this.activeItem = item;
            this.activeIndex = index;
            this.redirectUrl(item);
          } else {
            event.preventDefault();
          }
        }
      });
    } else {
      this.activeItem = item;
      this.activeIndex = index;
      this.redirectUrl(item);
    }
  }
  redirectUrl(item: any) {
    if (item.label == "Acto procesal") {
      if (this.gestionCasoService.casoActual.idEstadoRegistro == ESTADO_REGISTRO.FIRMADO ||
        this.gestionCasoService.casoActual.idEstadoRegistro == ESTADO_REGISTRO.RECIBIDO
      ) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([item.url]);
          setTimeout(() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth'
            })
          }, 100)
        });
      }
      else {
        this.router.navigate([item.url]).then(r => { });
      }
    }
    else {
      this.router.navigate([item.url]).then(r => { });
    }
  }
}
