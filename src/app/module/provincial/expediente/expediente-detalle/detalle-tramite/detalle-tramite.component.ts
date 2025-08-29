import { JsonPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Expediente } from '@core/utils/expediente';
import { NavegacionSujetoProcesalComponent } from '@modules/provincial/administracion-casos/sujeto/navegacion-sujeto-procesal/navegacion-sujeto-procesal.component';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ActoProcesalComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/acto-procesal/acto-procesal.component';
import { HechosCasoComponent } from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/hechos-caso/hechos-caso.component';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { urlConsultaCasoFiscal } from '@utils/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { Ripple } from 'primeng/ripple';
import { ApelacionNuevoService } from '@core/services/shared/apelacion-nuevo.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';

@Component({
  standalone: true,
  imports: [
    TabViewModule,
    TabMenuModule,
    ActoProcesalComponent,
    NavegacionSujetoProcesalComponent,
    HechosCasoComponent,
    JsonPipe,
    Ripple,
    CommonModule,
  ],
  selector: 'app-detalle-tramite',
  templateUrl: './detalle-tramite.component.html',
  styleUrls: ['./detalle-tramite.component.scss'],
})
export class DetalleTramiteComponent implements OnInit, OnDestroy {
  public subscriptions: Subscription[] = []
  private caso!: Expediente;
  protected items: MenuItem[] = [];
  activeItem: MenuItem | undefined;
  activeIndex = 0;
  protected tieneApelaciones = false;
  protected existeNuevo: boolean = true;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private tramiteService: TramiteService,
    private gestionCasoService: GestionCasoService,
    private apelacionNuevoService: ApelacionNuevoService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.apelacionNuevoService.valueExisteNuevo$.subscribe({
        next: (value) => {
          this.existeNuevo = value;
        },
      })
    );
    this.subscriptions.push(
      this.gestionCasoService.alActualizarCaso$.subscribe(caso => {
        this.caso = caso;
        this.actualizarApelaciones();
      })
    );
    this.caso = this.gestionCasoService.casoActual;
    const apelacionesInt = parseInt(this.caso?.flgOpcionApelaciones ?? '0');
    this.tieneApelaciones = apelacionesInt >= 1;
    this.existeNuevo = apelacionesInt > 1;
    this.gestionCasoService.expedienteActual = this.caso;
    const urlConsultaCaso = urlConsultaCasoFiscal(this.caso);
    //
    this.items = [
      {
        label: 'Acto procesal',
        url: `${urlConsultaCaso}/acto-procesal`,
      },
      {
        label: 'Hecho del caso',
        url: `${urlConsultaCaso}/hechos`,
      },
      {
        label: 'Sujetos procesales',
        url: `${urlConsultaCaso}/sujeto`,
      },
      {
        label: 'Historia del caso',
        url: `${urlConsultaCaso}/historia-tramites`,
      },
      {
        label: 'Fuentes de Investigación',
        url: `${urlConsultaCaso}/fuentes-investigacion`,
      },
      {
        id: 'AA',
        label: 'Apelaciones',
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

  ngOnDestroy() {
    this.subscriptions.forEach((suscripcion) => suscripcion?.unsubscribe())
  }

  clickTab(event: Event, item: MenuItem, index: number) {
    //if (this.activeItem !== undefined && this.activeItem.label == item.label) return;
    this.cambiarPanel(event, item, index);
  }

  cambiarPanel(event: any, item: any, index: number): void {
    if (this.tramiteService.tabConValidacion()) {
      this.subscriptions.push(
        this.tramiteService.ejecutarValidacion().subscribe({
          next: (confirmar) => {
            if (confirmar) {
              this.tramiteService.limpiarValidacion();
              this.activeItem = item;
              this.activeIndex = index;
              this.redirectUrl(item);
            } else {
              event.preventDefault();
            }
          }
        })
      );
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

  actualizarApelaciones(): void {
    const apelacionesInt = parseInt(this.caso?.flgOpcionApelaciones ?? '0');
    this.tieneApelaciones = apelacionesInt >= 1;
    this.existeNuevo = apelacionesInt > 1;
    this.items = [...this.items];
    this.items.filter(t => t.id === 'AA').map(t => {
      t.visible = this.tieneApelaciones;
    });

  }
}
