import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { TabsViewComponent } from '@core/components/tabs-view/tabs-view.component'
import { Tab } from '@core/interfaces/comunes/tab'
import { CalificarCaso } from '@core/interfaces/provincial/administracion-casos/calificacion/CalificarCaso'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { Expediente } from '@core/utils/expediente'
import { urlConsultaCasoFiscal, urlConsultaCuaderno } from '@core/utils/utils'
import { InformacionCasoComponent } from '@modules/provincial/expediente/informacion-caso/informacion-caso.component'
import { TabViewModule } from 'primeng/tabview'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-cuaderno-incidental-detalle',
  standalone: true,
  imports: [
    TabViewModule,
    CommonModule,
    TabsViewComponent,
    InformacionCasoComponent,
    RouterModule,
  ],
  templateUrl: './cuaderno-incidental-detalle.component.html',
  styleUrl: './cuaderno-incidental-detalle.component.scss'
})
export default class CuadernoIncidentalDetalleComponent {

  protected idCaso: string = "";
  protected calificarCaso!: CalificarCaso;
  protected caso!: Expediente;

  public tabs: Tab[] = []
  public indexActivo: number = 0
  public suscripciones: Subscription[] = []

  private readonly activatedRoute = inject(ActivatedRoute)
  protected gestionCasoService = inject(GestionCasoService)
  private readonly router = inject(Router)

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.idCaso = this.activatedRoute.snapshot.paramMap.get('idCaso')!;
    this.gestionCasoService.obtenerCasoFiscal( this.idCaso );
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion?.unsubscribe())
    this.gestionCasoService.dataObtenida = false
  }

  constructor() {

     this.caso = this.gestionCasoService.casoActual

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
       },
       {
         titulo: 'Cuadernos incidentales',
         ancho: 255,
         rutaPadre: 'acto-procesal,elementos,sujeto,resumen,historia-tramites,apelaciones',
       },
       {
         titulo: 'Carpeta auxiliar',
         ancho: 198,
         rutaPadre: 'carpeta-auxiliar',
         rutasHijas: 'carpeta-auxiliar',
       },
     ]
  }

  changeIndex(event: number) {

    this.indexActivo = event

    this.caso = this.gestionCasoService.casoActual

    const urlBasePrincipal = urlConsultaCasoFiscal({
      idEtapa: this.caso.idEtapaPadre!,
      idCaso: this.caso.idCasoPadre!,
      flgConcluido: this.caso.flgConcluidoPadre
    })

    const urlBaseIncidental = urlConsultaCuaderno('incidental',this.caso)

    //
    if (event === 0) {
      this.router.navigate([`${urlBasePrincipal}/inicio`])
      return
    }

    if (event === 1) {
      this.router.navigate([`${urlBasePrincipal}/acto-procesal`], { state: this.caso })
      return
    }

    if (event === 2) {
      this.router.navigate([`${urlBaseIncidental}/acto-procesal`], {
        state: this.caso,
      })
      return
    }

    if (event === 3) {
      this.router.navigate([`${urlBaseIncidental}/carpeta-auxiliar`])
    }

  }

}
