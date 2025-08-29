import { CommonModule, Location } from '@angular/common'
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { obtenerIcono } from '@utils/icon'
import { BreadCrum } from '@interfaces/comunes/breadcrumb'
import { Delito, Plazo } from '@core/interfaces/comunes/casosFiscales'
import { GestionCasoService } from '@services/shared/gestion-caso.service'
import { MaestroService } from '@services/shared/maestro.service'
import {
  BarraProgresoCasoComponent
} from '@modules/provincial/administracion-casos/consulta-casos/listar-casos/components/carpeta-caso/barra-progreso-caso/barra-progreso-caso.component'
import {
  EtiquetaAccionesCasoComponent
} from '@modules/provincial/administracion-casos/consulta-casos/listar-casos/components/carpeta-caso/etiqueta-acciones-caso/etiqueta-acciones-caso.component'
import { TimeLineCasoComponent } from '@components/generales/linea-tiempo/linea-tiempo.component'
import { Expediente } from '@utils/expediente'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib'
import { ButtonModule } from 'primeng/button'
import { DialogService } from 'primeng/dynamicdialog'
import { ProgressBarModule } from 'primeng/progressbar'
import { TooltipModule } from 'primeng/tooltip'
import { Subscription } from 'rxjs'
import { StringUtil, IconUtil, DateUtil, MathUtil, semaforo } from 'ngx-cfng-core-lib'
import { SubetapasComponent } from '@core/components/generales/subetapas/subetapas.component'
import { TramiteService } from '@services/provincial/tramites/tramite.service'
import { CronometroComponent } from '@components/generales/cronometro/cronometro.component'
import { urlConsultaCasoFiscal, urlConsultaCuaderno, urlEtapa } from '@core/utils/utils'
import { SidebarService } from 'dist/ngx-cfng-core-layout/sidebar'
import { TokenService } from '@core/services/shared/token.service'
import { TokenSession } from '@core/interfaces/shared/session.interface'
import { capitalizedFirstWord } from '@core/utils/string'
import { formatearFecha_DDMMYYYY_HH24MI } from '@core/utils/date'
import { id } from 'date-fns/locale'

@Component({
  selector: 'app-informacion-caso',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    RouterModule,
    ButtonModule,
    ProgressBarModule,
    TimeLineCasoComponent,
    BarraProgresoCasoComponent,
    EtiquetaAccionesCasoComponent,
    CronometroComponent,
    TooltipModule,
    SubetapasComponent
  ],
  templateUrl: './informacion-caso.component.html',
  styleUrls: ['./informacion-caso.component.scss'],
  providers: [DialogService],
})
export class InformacionCasoComponent implements OnInit, OnDestroy {

  public idCaso: string = ''
  public plazoCaso!: Plazo
  public plazoTotalDias: number = 0
  public plazoDiasTranscurridos: number = 0
  public delitosArray!: Delito[]
  public mostrarMas: boolean = false
  public casoArray!: string[]
  public porcentaje: number = 0
  public colorProgress: string = semaforo.AMBAR
  public etapas: any[] = []
  public subetapas: any[] = []
  public etapaActual!: string
  public idTipoProceso: any
  public casoPlazoNivelC!: Plazo[] | any[]
  public casoPlazoNivelT!: Plazo[] | any[]
  public newEstadoRegistro!: string | undefined
  public isIndagaciones: boolean = true
  public isHideHeader: boolean = false
  public etapaActiva: string = ''
  public nombreEtapaActual: string = ''
  protected idJerarquia: number = 0

  @Output() btnClick = new EventEmitter()
  public caso!: Expediente
  @Input() routes: BreadCrum[] = []

  public subscriptions: Subscription[] = []

  get esVisibleEtiqueta(): boolean {
    return (
      (this.caso.flgAcuerdoReparatorio === '0' &&
        this.caso.flgPrincipioOportunidad === '0')
    )
  }

  constructor(
    private readonly router: Router,
    private readonly tramiteService: TramiteService,
    private readonly maestrosService: MaestroService,
    private readonly gestionCasoService: GestionCasoService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    protected dateUtil: DateUtil,
    protected mathUtil: MathUtil,
    public location: Location,
    private readonly sidebarService: SidebarService,
   private readonly tokenService: TokenService,
  ) {
    const usuarioSesion: TokenSession = this.tokenService.getDecoded()
    this.idJerarquia = parseInt(usuarioSesion?.usuario.codJerarquia, 10)
  }

  ngOnInit() {
    this.caso = this.gestionCasoService.casoActual
    this.idCaso = this.caso.idCaso
    this.subscriptions.push(
      this.gestionCasoService.alActualizarCaso$.subscribe(caso => {
        console.log("actualizando caso", caso)
        this.caso = caso
        this.hasFlagNivelC()
        this.hasFlagNivelT()
        this.obtenerEtapas()
        this.validarUrlEtapaCaso()
      })
    )
    this.idTipoProceso = this.caso.idTipoProceso
    this.delitosArray = this.caso.delitos
    this.obtenerEtapas()
    this.hasFlagNivelC()
    this.hasFlagNivelT()
    this.validarUrlEtapaCaso()
    console.log("rl caso es", this.caso)
  }

  ngOnDestroy() {
    this.subscriptions.forEach((suscripcion) => suscripcion?.unsubscribe())
  }

  get verCronometro(): boolean {
    const tieneCronometro = !!this.caso.cronometro && this.caso.cronometro !== null;
    return this.caso.idEtapa === '07' && tieneCronometro;
  }

  get vencimientoStr(): string {    
    if (!this.caso.cronometro || this.caso.cronometro === null) return ''
    return this.caso.cronometro.toString()
  }

  protected onClick(): void {
    this.btnClick.emit()
  }

  public obtenerEtapas(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerEtapasCaso(this.caso.idTipoProcesoEtapa).subscribe({
        next: (resp) => {
          this.etapas = resp.map((item: any) => ({
            label: capitalizedFirstWord(item.nombre),
            codigo: item.codigo,
          }))
          this.etapaActual = this.caso.idEtapa
          //Sub etapas
          let etapaActiva = resp.find((x: any) => x.estado === '1')
          if (etapaActiva !== undefined) {
            this.etapaActiva = etapaActiva.codigo
            this.subetapas = etapaActiva.detalle || []
            this.nombreEtapaActual = etapaActiva.nombre
          }
        }
      })
    )
  }

  public searchCaso(): void {
    console.log("Buscando otro caso", this.idJerarquia)
     // Obtén la URL actual
  const urlActual = this.router.url;
  // Busca el segmento dinámico después de 'consultar-casos-fiscales'
  let match = urlActual.match(/consultar-casos-fiscales-elevados\/([^\/]+)/);
   if(this.idJerarquia === 1) {
    // Si es jerarquía 1, busca el segmento después de 'consultar-casos-fiscales'
    match = urlActual.match(/consultar-casos-fiscales\/([^\/]+)/);
   }
  let segmento = '';
  if (match && match[1]) {
    segmento = match[1];
  }
  // Redirige a la lista con el segmento si existe
  if (this.idJerarquia === 1) {
    this.router.navigate(['/app/administracion-casos/consultar-casos-fiscales', segmento].filter(Boolean));
    return;
  }
  this.router.navigate([
    '/app/administracion-casossuperior/consultar-casos-fiscales-elevados',
    segmento
  ].filter(Boolean));
  }

  public hideHeaderCasoFiscal(): void {
    this.isHideHeader = !this.isHideHeader
  }

  private hasFlagNivelC() {
    this.casoPlazoNivelC = this.caso?.plazos?.filter(
      (plazo: any) => plazo.flgNivel === 'C'
    )
  }

  private hasFlagNivelT() {
    this.casoPlazoNivelT = this.caso.plazos.filter(
      (plazo: any) => plazo.flgNivel === 'T'
    )

    this.tramiteService.updateData(this.casoPlazoNivelT)

  }

  public obtenerIcono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  private validarUrlEtapaCaso(): void {
    const urlActual = this.router.url
    const urlEtapaCaso: string = urlEtapa(this.caso)
    const segmentoComun = '/app/administracion-casos/consultar-casos-fiscales/'
    if (urlActual.startsWith(segmentoComun)) {
      let parteDinamica = urlActual.replace(segmentoComun, '')
      let tipoCuaderno: string = ''
      switch ( this.caso.idTipoCuaderno ) {
        case 2: tipoCuaderno = 'cuaderno-incidental'; break;
        case 4: tipoCuaderno = 'cuaderno-extremo'; break;
        default: tipoCuaderno = 'caso';
      }
      const indexCaso = parteDinamica.indexOf(`/${tipoCuaderno}/`)
      if (indexCaso !== -1) {
        parteDinamica = parteDinamica.substring(indexCaso)
      }
      const expectedUrl = `${segmentoComun}${urlEtapaCaso}${parteDinamica}`
      if (urlActual !== expectedUrl) {
        this.router.navigateByUrl(expectedUrl, {replaceUrl: true})
        setTimeout(() => {
          this.sidebarService.setActualizarSidebar(true)
        }, 100);
      }
    }
  }

  protected obtenerColorBadgePrincipioAcuerdo() {
    const classes: any = {}
    if (this.caso.flgPrincipioOportunidad === '1') {
      classes['boton-etiqueta boton-etiqueta--purple-dark'] = true
    } else if (this.caso.flgAcuerdoReparatorio === '1') {
      classes['boton-etiqueta boton-etiqueta--green-dark'] = true
    }
    return classes
  }

  protected regresarCasoPrincipal(): void {
    if (this.idJerarquia === 2) {
      window.history.back();
      return;
    }
  
    const { idEtapaPadre, idCasoPadre, flgConcluidoPadre, idTipoCuadernoCasoPadre, idTipoCuaderno } = this.caso;
    const params = { idEtapa: idEtapaPadre!, idCaso: idCasoPadre!, flgConcluido: flgConcluidoPadre! };
  
    let ruta: string;
    switch (idTipoCuadernoCasoPadre) {
      case 2:
        ruta = urlConsultaCuaderno('incidental', params);
        break;
      case 4:
        ruta = urlConsultaCuaderno('extremo', params);
        break;
      default:
        ruta = urlConsultaCasoFiscal(params);
        break;
    }
  
    const tipoCuaderno = idTipoCuaderno === 2 ? 'incidentales' : 'extremos';
    this.router.navigate([`${ruta}/cuadernos-${tipoCuaderno}`]);
  }
  

  copiarAlPortapapeles(valor:string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valor).then(() => {
      }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
      });
    }else {
      const textArea = document.createElement('textarea');
      textArea.value = valor;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
      document.body.removeChild(textArea);
    }
  }

  protected formatearFecha_DDMMYYYY_HH24MI(fecha: string): string {
    return formatearFecha_DDMMYYYY_HH24MI(fecha)
  }
  
}