import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { TabsViewComponent } from '@core/components/tabs-view/tabs-view.component'
import { Tab } from '@core/interfaces/comunes/tab'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { Expediente } from '@core/utils/expediente'
import { evaluarTabPagos, urlConsultaCuaderno } from '@core/utils/utils'
import { InformacionCasoComponent } from '@modules/provincial/expediente/informacion-caso/informacion-caso.component'
import { ETAPA_TRAMITE } from 'dist/ngx-cfng-core-lib'
import { TabViewModule } from 'primeng/tabview'
import { Subscription } from 'rxjs'

@Component({
  selector: 'cuaderno-extremo-detalle',
  standalone: true,
  imports: [
    TabViewModule,
    CommonModule,
    TabsViewComponent,
    InformacionCasoComponent,
    RouterModule,
  ],
  templateUrl: './cuaderno-extremo-detalle.component.html',
  styleUrl: './cuaderno-extremo-detalle.component.scss'
})
export class CuadernoExtremoDetalleComponent {

  protected caso!: Expediente;
  private mostrarTabCuadernoIncidental: boolean = true

  public tabs: Tab[] = []
  public indexActivo: number = 0
  public suscripciones: Subscription[] = []

  protected gestionCasoService = inject(GestionCasoService)

  private readonly router = inject(Router)

  constructor() {
    this.establecerTabs();
  }

  ngOnInit() {
    evaluarTabPagos(this.tabs, this.caso)

    this.suscripciones.push(
      this.gestionCasoService.alActualizarCaso$.subscribe((data: any) => {
        this.caso = data
        this.establecerTabs()
        evaluarTabPagos(this.tabs, this.caso)
      })
    )

  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion?.unsubscribe())
  }

  private establecerTabs(): void {

    this.caso = this.gestionCasoService.casoActual

    this.mostrarTabCuadernoIncidental = this.caso.idEtapa !== ETAPA_TRAMITE.ETAPA_CALIFICACION

    this.tabs = [
      {
        titulo: 'Inicio',
        ancho: 85,
        icono: 'home',
        rutaPadre: 'inicio'
      },
      {
        titulo: 'Detalle del trámite',
        ancho: 210,
        rutaPadre: 'detalle-tramite',
        rutasHijas: 'acto-procesal,elementos-conviccion,sujeto,resumen,apelaciones,historia-extremo',
      },
      ...(this.mostrarTabCuadernoIncidental ? [{
        titulo: 'Cuadernos incidentales',
        ancho: 255,
        rutaPadre: 'cuadernos-incidentales',
        rutasHijas: 'cuadernos-incidentales,acto-procesal,sujeto',
      }] : []),
      {
        titulo: 'Cuadernos extremos',
        ancho: 230,
        rutaPadre: 'cuadernos-extremos',
      },
      {
        titulo: 'Carpeta auxiliar',
        ancho: 198,
        rutaPadre: 'carpeta-auxiliar',
        rutasHijas: 'carpeta-auxiliar',
      },
      {
        titulo: 'Pagos',
        ancho: 110,
        oculto: true,
        color: 'green',
        rutaPadre: 'pagos',
        rutasHijas: 'pagos',
      },
    ]
  }


  changeIndex(event: number) {

    this.caso = this.gestionCasoService.casoActual

    let indexSeleccionado = event

    this.indexActivo = indexSeleccionado

    if (!this.mostrarTabCuadernoIncidental && event > 1) {
      indexSeleccionado += 1
    }
    const urlBaseExtremo = urlConsultaCuaderno('extremo',this.caso)

    if (indexSeleccionado === 0) {
      this.router.navigate([`${urlBaseExtremo}/inicio`])
      return
    }

    if (indexSeleccionado === 1) {
      this.router.navigate([`${urlBaseExtremo}/acto-procesal`], {
        state: this.caso,
      })
      return
    }

    if (indexSeleccionado === 2) {
      this.router.navigate([`${urlBaseExtremo}/cuadernos-incidentales`])
      return
    }

    if (indexSeleccionado === 3) {
      this.router.navigate([`${urlBaseExtremo}/cuadernos-extremos`])
      return
    }

    if (indexSeleccionado === 4) {
      this.router.navigate([`${urlBaseExtremo}/carpeta-auxiliar`])
    }

    if (indexSeleccionado === 5) {
      this.router.navigate([`${urlBaseExtremo}/pagos`])
    }

  }
}
