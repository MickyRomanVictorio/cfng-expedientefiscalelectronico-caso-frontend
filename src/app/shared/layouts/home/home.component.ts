import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ConsultaRapidaComponent } from '@components/modals/consulta-rapida/consulta-rapida.component';
import { AlertaStaticComponent } from '@components/modals/alerta-static/alerta-static.component';
import { BreadCrum } from '@core/interfaces/comunes/breadcrumb';
import { DOMAIN_ASSETS, DOMAIN_FRONT_HOME } from '@environments/environment';
import {
  Alertas,
  Aplicaciones,
  NgxCfngCoreLayoutHeaderComponent as HeaderLibComponent,
  MenuNavegacion,
  Titulos,
  Usuario,
} from '@ngx-cfng-core-layout/header';
import {
  NgxCfngCoreLayoutSidebarComponent as SidebarLibComponent,
  SidebarService,
} from '@ngx-cfng-core-layout/sidebar';
import { PanelModule } from 'primeng/panel';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AlertaPlazoComponent } from '../alertas/alerta-plazo/alerta-plazo.component';
import { AlertaGenericaComponent } from '../alertas/alerta-generica/alerta-generica.component';
import { AlertaService } from '@core/services/shared/alerta.service';
import { ContadoresService } from '@core/services/shared/contadores.service';
import {
  Alerta,
  SumarioAlertaResponseDTO,
} from '@core/interfaces/comunes/alerta';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from '@core/constants/mesa-turno';
import { UsuarioService } from '@core/services/shared/usuario.service';
import { MenuService } from '@core/services/shared/menu.service';
import { RecepcionConsultasService } from '@services/provincial/recepcion/recepcion-consultas.service';
import { filter } from 'rxjs';
import { RouterParamService } from '@core/services/shared/router-param.service';
import { CasosMonitoreadosService } from '@core/services/superior/casos-monitoreados/casos-monitoreados.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    BreadcrumbComponent,
    RouterModule,
    PanelModule,
    ConsultaRapidaComponent,
    AlertaStaticComponent,
    HeaderLibComponent,
    SidebarLibComponent,
    AlertaGenericaComponent,
    AlertaPlazoComponent,
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild('componentAlertaPlazoTemplate', { static: true })
  componentAlertaPlazoTemplate!: TemplateRef<any>;

  @ViewChild('componentAlertaGenericaTemplate', { static: true })
  componentAlertaGenericaTemplate!: TemplateRef<any>;

  @ViewChild('sidebar', { static: true })
  protected sidebarComponent!: SidebarLibComponent;

  //protected aplicaciones: Aplicaciones[] = aplicaciones;
  protected aplicaciones: Aplicaciones[] = [];
  protected aplicacionesHead: any[] = [];
  renderMenu = true;
  protected listaAlertasPlazoPorAtender: Alerta[] = [];
  protected listaAlertasPlazoAtendidos: Alerta[] = [];
  protected listaAlertasGenericaPorAtender: Alerta[] = [];
  protected listaAlertasGenericaAtendidos: Alerta[] = [];
  protected listaAletasUrgentes: Alerta[] = [];

  protected alertas: Alertas[] = [
    {
      codigo: '1',
      icono: DOMAIN_ASSETS + '/icons/calendar.svg',
      click: (e: Event) => {
        console.log(e);
      },
    },
    {
      codigo: '2',
      icono: DOMAIN_ASSETS + '/icons/icon_clock.svg',
      cantidad: 0,
      click: (e: Event) => {
        console.log(e);
      },
    },
    {
      codigo: '3',
      icono: DOMAIN_ASSETS + '/icons/icon_bell.svg',
      cantidad: 0,
      click: (e: Event) => {
        console.log(e);
      },
    },
  ];

  //protected titulos: Titulos = titulos;
  protected titulos!: Titulos;
  protected usuarioToken: any;
  protected usuario!: Usuario;
  protected baseAssetsUrl: string = DOMAIN_ASSETS;
  protected menuNavegacion: MenuNavegacion[] = [];
  protected menuNavegacionOpciones: MenuNavegacion = {} as MenuNavegacion;
  protected anchoFijoSidebar: boolean = true;
  protected datoBreadCrum: BreadCrum[] = [];
  private readonly router: Router = inject(Router);
  public idCaso: string | null = null;

  constructor(
    private readonly alertaService: AlertaService,
    private readonly contadoresService: ContadoresService,
    private readonly usuarioService: UsuarioService,
    private readonly menuService: MenuService,
    private readonly recepcionConsultasService: RecepcionConsultasService,
    private readonly sidebarService: SidebarService,
    private readonly routerParamService: RouterParamService,
    private readonly casosMonitoreadosService: CasosMonitoreadosService,
  ) {}

  ngOnInit() {
    this.datosAcceso();
    this.setTituloHeader();
    this.setUsuarioHeader();
    this.obtenerAplicaciones();
    this.inciarAlertas();
    this.iniciarContadores();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/app/inicio') {
          this.datoBreadCrum = [];
        }

        if (event.url.includes('/elevacion-actuados')) {
          this.seleccionarPrimerHijoDeMenu('/elevacion-actuados');
        }
      });
    this.capturantoIdCaso();
  }

  private seleccionarPrimerHijoDeMenu(urlFragment: string) {
    // Busca el nodo padre que contiene el fragmento de la URL
    const menuPadre = this.menuNavegacion.find(item => item.url?.includes(urlFragment));

    if (menuPadre && menuPadre.options && menuPadre.options.length > 0) {
      const primerHijo = menuPadre.options[0];

      // Navega a la URL del primer hijo
      this.router.navigate([primerHijo.url]);

      // Actualiza el breadcrumb
      this.datoBreadCrum = this.extraerDatosParaBreadCrum(primerHijo);

      // Si la librería del sidebar tiene un método para establecer el ítem activo, úsalo aquí.
      // Por ejemplo: this.sidebarService.setActive(primerHijo);
      // O si el componente de sidebar reacciona a los cambios en el router,
      // la navegación anterior debería ser suficiente.
    }
  }

  private datosAcceso() {
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);

    this.usuarioToken = decodedToken.usuario;
    this.obtenerOpciones(Number(token.aplication));
  }

  setTituloHeader() {
    this.titulos = {
      principal: 'Expediente Fiscal Electrónico',
      superior: 'Carpeta Fiscal Electrónico (CFE)',
      fiscalia: `${this.usuarioToken.dependencia}-${this.usuarioToken.distrito}-${this.usuarioToken.despacho}`,
    };
  }

  setUsuarioHeader() {
    this.usuario = {
      nombres: this.usuarioToken.fiscal,
      perfil: this.usuarioToken.cargo,
      opciones: [
        {
          label: 'Salir',
          icon: 'pi pi-fw pi-sign-out',
          command: () => {
            this.eventoSalir();
          },
        },
      ],
    };
  }

  private inciarAlertas() {
    this.alertaService.connect().subscribe((data: SumarioAlertaResponseDTO) => {
      this.listaAlertasPlazoPorAtender =
        data.bandejaPlazoAlertas.listaAlertaPorAtender;
      this.listaAlertasPlazoAtendidos =
        data.bandejaPlazoAlertas.listaAlertaAtendido;
      this.listaAlertasGenericaPorAtender =
        data.bandejaGenericaAlertas.listaAlertaPorAtender;
      this.listaAlertasGenericaAtendidos =
        data.bandejaGenericaAlertas.listaAlertaAtendido;
      this.listaAletasUrgentes =
        data.listadoAlertasUrgentes.listaAlertaPorAtender;
      this.cargarAlertasVisual();
    });
  }

  private cargarAlertasVisual() {
    this.alertas = [
      {
        codigo: '1',
        icono: DOMAIN_ASSETS + '/icons/icon_clock.svg',
        cantidad: this.listaAlertasPlazoPorAtender?.length,
        template: this.componentAlertaPlazoTemplate,
        mostrar: false,
      },
      {
        codigo: '2',
        icono: DOMAIN_ASSETS + '/icons/icon_bell.svg',
        cantidad: this.listaAlertasGenericaPorAtender?.length,
        template: this.componentAlertaGenericaTemplate,
        mostrar: false,
      },
    ];
  }

  protected eventoMenuNavegacionSeleccionado(menu: MenuNavegacion) {
    if (menu !== undefined) {
      this.menuNavegacionOpciones = menu;
    }
  }
  protected eventoAnchoFijoSidebar(activo: boolean) {
    this.casosMonitoreadosService.setEsMonitoreado('0');
    this.anchoFijoSidebar = activo;
  }

  protected eventoSubmenuNavegacionSeleccionado(menu: MenuNavegacion) {
    this.casosMonitoreadosService.setEsMonitoreado('0');
    this.datoBreadCrum = this.extraerDatosParaBreadCrum(menu);
  }

  private extraerDatosParaBreadCrum(menu: MenuNavegacion): BreadCrum[] {
    const resultado: BreadCrum[] = [{ name: menu.name, url: menu.url }];
    if (menu.options && menu.options.length > 0) {
      for (const option of menu.options) {
        resultado.push(...this.extraerDatosParaBreadCrum(option));
      }
    }
    return resultado;
  }

  private capturantoIdCaso() {
    this.idCaso = this.routerParamService.getParam('idCaso');

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const id = this.routerParamService.getParam('idCaso');
        this.idCaso = id;
      });
  }

  private eventoSalir() {
    sessionStorage.clear();
    document.location.href = DOMAIN_FRONT_HOME + '/home';
  }

  /* OBTENIENDO LA LISTA DE APLICACIONES */

  obtenerAplicaciones() {
    this.usuarioService
      .listarAplicaciones(this.usuarioToken.usuario)
      .subscribe({
        next: (respuesta) => {
          this.aplicaciones = respuesta;
          this.setAplicacionesHeader();
        },
        error: (error) => {
          console.error('Error al obtener los datos', error);
        },
      });
  }
  setAplicacionesHeader() {
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const tokenWithoutBearer = encodeURIComponent(
      token.token.replace('Bearer ', '')
    );
    this.aplicaciones.forEach((m) => {
      this.aplicacionesHead.push({
        sistema: m.titulo,
        url:
          m.ruta +
          '?token=' +
          tokenWithoutBearer +
          '&idAplication=' +
          m.idAplicacion,
        notificarCambio: false,
        codigo: m.acronimo,
      });
    });
  }

  obtenerOpciones(idAplicacion: number) {
    this.menuService.cargarMenu(this.usuarioToken.usuario, idAplicacion);
    this.menuService.menu$.subscribe({
      next: (data) => {
        this.menuNavegacion = data || [];
      },
      error: (error) => {
        console.error('Error al obtener los datos', error);
      },
    });
  }

  private iniciarContadores() {
    this.contadoresService
      .connect()
      .subscribe(
        (
          data: { coUsuario: string; idAplicacion: number; count: number }[]
        ) => {
          const updateCounts = (options: MenuNavegacion[]) => {
            options.forEach((menu) => {
              const match = data.find(
                (item) => item.idAplicacion === menu.idAplicacion
              );
              if (match) menu.count = match.count;
              if (menu.options) updateCounts(menu.options);
            });
          };
          updateCounts(this.menuNavegacion);
        }
      );
  }

}
