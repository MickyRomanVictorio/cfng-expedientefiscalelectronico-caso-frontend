import { CommonModule } from '@angular/common'
import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Tab } from '@interfaces/comunes/tab'
import { CalificarCaso } from '@interfaces/provincial/administracion-casos/calificacion/CalificarCaso'
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component'
import { TabViewModule } from 'primeng/tabview'
import { Router, RouterModule } from '@angular/router'
import { ETAPA_TRAMITE } from 'ngx-cfng-core-lib'
import { GestionCasoService } from '@services/shared/gestion-caso.service'
import { Expediente } from '@utils/expediente'
import { evaluarTabPagos, urlConsultaCasoFiscal } from '@utils/utils'
import { Subscription } from 'rxjs'
@Component({
  standalone: true,
  imports: [
    TabViewModule,
    CommonModule,
    TabsViewComponent,
    RouterModule,
  ],
  selector: 'app-expediente-detalle-tramite',
  templateUrl: './expediente-detalle.component.html',
  styleUrls: ['./expediente-detalle.component.scss'],
})
export class ExpedienteDetalleComponent implements OnInit, OnDestroy {

  @Input() idCaso: string = ''
  @Input() calificarCaso!: CalificarCaso

  private mostrarTabCuadernoIncidental: boolean = false

  public caso!: Expediente

  public tabs: Tab[] = []

  constructor(
    private readonly router: Router,
    private readonly gestionCasoService: GestionCasoService
  ) {
    this.establecerTabs()
  }

  public indexActivo: number = 0
  public subscriptions: Subscription[] = []

  ngOnInit(): void {
    evaluarTabPagos(this.tabs,this.caso)
    this.subscriptions.push(
      this.gestionCasoService.alActualizarCaso$.subscribe((data: any) => {
        this.caso = data
        this.establecerTabs()
        evaluarTabPagos(this.tabs,this.caso)
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion?.unsubscribe())
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
        rutasHijas: 'acto-procesal,hechos,sujeto,historia-tramites,fuentes-investigacion,apelaciones',
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
        rutasHijas: 'cuadernos-extremos,acto-procesal,sujeto',
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
      {
        titulo: 'Actos de investigación',
        ancho: 220,
        rutaPadre: 'acto-investigacion',
        rutasHijas: 'acto-investigacion',
      },
      {
        titulo: 'Cuadernos de prueba',
        ancho: 220,
        rutaPadre: 'cuaderno-prueba',
        rutasHijas: 'cuaderno-prueba',
        oculto: !this.mostrarCuadernoPrueba,
      },
    ]
  }

  protected changeIndex(event: number): void {

    let indexSeleccionado = event

    this.indexActivo = indexSeleccionado

    if ( !this.mostrarTabCuadernoIncidental && event > 1) {
      indexSeleccionado += 1
    }

    const urlBase = urlConsultaCasoFiscal(this.caso)

    if (indexSeleccionado === 0) {
      this.router.navigate([`${urlBase}/inicio`])
      return
    }

    if (indexSeleccionado === 1) {
      this.router.navigate([`${urlBase}/acto-procesal`], { state: this.caso })
      return
    }

    if (indexSeleccionado === 2) {
      this.router.navigate([`${urlBase}/cuadernos-incidentales`], {
        state: this.caso,
      })
      return
    }

    if (indexSeleccionado === 3) {
      this.router.navigate([`${urlBase}/cuadernos-extremos`], {
        state: this.caso,
      })
      return
    }

    if (indexSeleccionado === 4) {
      //Carpeta auxiliar
      this.router.navigate([`${urlBase}/carpeta-auxiliar`])
      return
    }

    if (indexSeleccionado === 5) {
      //Actos de investigacion
      this.router.navigate([`${urlBase}/pagos`], {
        state: this.caso,
      })
      return
    }

    if (indexSeleccionado === 6) {
      //Cuadernos de prueba
      this.router.navigate([`${urlBase}/acto-investigacion`], {
        state: this.caso,
      })
    }

  }

  protected get mostrarCuadernoPrueba(): boolean {
    const etapasConCuadernoPruebas: Array<string> = [
      ETAPA_TRAMITE.ETAPA_JUZGAMIENTO_PROGRAMACION,
      ETAPA_TRAMITE.ETAPA_JUZGAMIENTO_DESARROLLO,
      ETAPA_TRAMITE.ETAPA_JUZGAMIENTO_SENTENCIA,
      ETAPA_TRAMITE.ETAPA_JUICIO_INMEDIATO_PROGRAMACION,
      ETAPA_TRAMITE.ETAPA_JUICIO_INMEDIATO_DESARROLLO,
      ETAPA_TRAMITE.ETAPA_JUICIO_INMEDIATO_SENTENCIA]
    return etapasConCuadernoPruebas.includes(this.caso.idEtapa)
  }

}
