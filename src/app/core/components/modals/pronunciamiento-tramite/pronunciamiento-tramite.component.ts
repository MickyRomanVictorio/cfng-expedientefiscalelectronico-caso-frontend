import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {TabsViewComponent} from '@core/components/tabs-view/tabs-view.component';
import {ClasificadorExpedienteEnum} from '@core/constants/constants';
import {Apelaciones} from '@core/interfaces/comunes/apelacion.interface';
import {AlertaData} from '@core/interfaces/comunes/alert';
import {GestionCasoService} from '@core/services/shared/gestion-caso.service';
import {PronunciamientoTramiteService} from '@core/services/superior/casos-elevados/pronunciamiento-tramite.service';
import {obtenerIcono} from '@core/utils/icon';
import {Tab} from '@interfaces/comunes/tab';
import {FirmaDigitalClienteService} from 'ngx-cfng-core-firma-digital';
import {DateFormatPipe, obtenerCodigoCasoHtml} from 'ngx-cfng-core-lib';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {TabViewModule} from 'primeng/tabview';
import {concatMap, Observable, of, Subject, Subscription} from 'rxjs';
import {HistorialComponent} from './components/historial/historial.component';
import {PartesDelitosComponent} from './components/partes-delitos/partes-delitos.component';
import {TramiteComponent} from './components/tramite/tramite.component';
import {UsuarioAuthService} from '@core/services/auth/usuario.service.ts.service';
import {IconUtil} from 'dist/ngx-cfng-core-lib';
import {tourService} from '@utils/tour';
import {obtenerCasoHtml} from "@utils/utils";
import {DomSanitizer} from "@angular/platform-browser";
import {CapitalizePipe} from "@pipes/capitalize.pipe";
import {AlertaModalComponent} from '@core/components/modals/alerta-modal/alerta-modal.component';
import {TramiteService} from '@core/services/provincial/tramites/tramite.service';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-pronunciamiento-tramite',
  standalone: true,
  imports: [
    CmpLibModule,
    TabsViewComponent,
    TabViewModule,
    HistorialComponent,
    PartesDelitosComponent,
    TramiteComponent,
    DateFormatPipe,
    CapitalizePipe,
    NgIf
  ],
  templateUrl: './pronunciamiento-tramite.component.html',
  styleUrl: './pronunciamiento-tramite.component.scss'
})
export class PronunciamientoTramiteComponent implements OnInit, OnDestroy {

  protected obtenerIcono = obtenerIcono;
  protected obtenerCodigoCasoHtml = obtenerCodigoCasoHtml;
  protected indexTab: number = 1;
  protected tabs: Tab[] = [
    {
      titulo: 'Acto procesal',
      ancho: 250,
    },
    {
      titulo: 'Historial',
      ancho: 250,
    },

    {
      titulo: 'Partes y delitos',
      ancho: 250,
    },
  ];
  public casoPestania = signal<any>(null);
  protected readonly datos: Apelaciones;
  public subscriptions: Subscription[] = [];
  protected idActoTramiteCaso = signal<string>('');
  protected isTramiteEnModoEdicion = signal<boolean>(false);
  protected readonly esSuperior: boolean = false;
  private readonly desuscribir$ = new Subject<void>();

  constructor(
    private readonly gestionCasoService: GestionCasoService,
    private readonly pronunciamientoTramiteService: PronunciamientoTramiteService,
    protected readonly ref: DynamicDialogRef,
    private readonly configuracion: DynamicDialogConfig,
    public readonly firmaDigitalClienteService: FirmaDigitalClienteService,
    private readonly usuarioAuthService: UsuarioAuthService,
    protected iconUtil: IconUtil,
    private tourService: tourService,
    private sanitizador: DomSanitizer,
    private readonly dialogService: DialogService,
    private readonly tramiteService: TramiteService
  ) {
    this.datos = this.configuracion.data;
    this.esSuperior = this.usuarioAuthService.esJerarquiaSuperior();
  }

  ngOnInit(): void {
    if(this.esSuperior===true){
      this.indexTab = 0;
    }

    if (this.configuracion.data.idActoTramiteCaso) {
      this.idActoTramiteCaso.set(this.configuracion.data.idActoTramiteCaso);
      this.isTramiteEnModoEdicion.set(this.configuracion.data.isTramiteEnModoEdicion);
      this.indexTab = 0;
    }

    this.gestionCasoService.tipoClasificador = ClasificadorExpedienteEnum.PestaniaApelacion;
    this.subscriptions.push(
      this.gestionCasoService.obtenerCasoFiscalV2(this.datos.idCaso).pipe(
        concatMap(() => this.pronunciamientoTramiteService.obtenerPestania(this.datos.idCaso))
      ).subscribe({
        next: (rs) => {
          this.casoPestania.set(rs);
        }
      })
    );

    //Despues que se a firmado
    this.subscriptions.push(
      this.firmaDigitalClienteService.processSignClient.subscribe({
        next: (data: any) => {
          this.pronunciamientoTramiteService.obtenerPestania(this.datos.idCaso).subscribe({
            next: (rs) => {
              this.casoPestania.set(rs);
            }
          });
        }
      })
    );
  }

  protected eventoCambiarTab(index: number) {
    if (index >= 0) {
      this.validarTab().subscribe(result => {
        if (result) {
          this.indexTab = index;
          this.idActoTramiteCaso.set('');
          this.isTramiteEnModoEdicion.set(false);
        }
      });
    }
  }

  public validarTab = (): Observable<boolean> => {
    if (this.mostrarConfirmacion) {
      return new Observable<boolean>(observer => {
        const confirmarCreacionTramite = this.dialogService.open(AlertaModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'warning',
            title: `SALIR DEL TRÁMITE`,
            description: `¿Está seguro que desea salir del formulario?. Recuerde que se perderán los cambios realizados. Por favor confirme está acción.`,
            confirmButtonText: 'Confirmar',
            confirm: true,
          }
        } as DynamicDialogConfig<AlertaData>);

        // Esperamos a que el diálogo esté completamente inicializado
        setTimeout(() => {
          if (confirmarCreacionTramite) {
            confirmarCreacionTramite.onClose.pipe(
              concatMap((resp) => of(resp === 'confirm'))
            ).subscribe({
              next: (result) => {
                observer.next(result);
                observer.complete();
              },
              error: (error) => {
                observer.next(false);
                observer.complete();
              }
            });
          } else {
            observer.next(true);
            observer.complete();
          }
        }, 0);
      });
    }
    return of(true);
  }

  get mostrarConfirmacion(): boolean {
    return !!this.idActoTramiteCaso() && (this.tramiteService.documentoEditado || this.tramiteService.formularioEditado);
  }

  protected eventoHistorialSeleccionado(dato: any) {
    this.indexTab = 0;
    this.idActoTramiteCaso.set(dato.idActoTramiteCaso);
    this.isTramiteEnModoEdicion.set(dato.isTramiteEnModoEdicion);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
    this.gestionCasoService.tipoClasificador = ClasificadorExpedienteEnum.CuadernoIncidental;
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  protected tituloDelCaso(numeroCuaderno: string ) {
    const subTituloHtml = `${numeroCuaderno.endsWith('0') ? 'Número Caso: ' : 'Cuaderno incidental: '} ${obtenerCasoHtml(numeroCuaderno)}`;
    return this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  protected formatoFechaF(f: string): string {
    if (!f) return '-';
    const partes = f.split(' ')[0].split('-');
    const hora = f.split(' ')[1] || '00:00:00';
    const fechaFormateada = `${partes[2]}-${partes[1]}-${partes[0]} ${hora}`;
    const d = new Date(fechaFormateada);
    if (isNaN(d.getTime())) return '-';
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = d.toLocaleString('es-ES', { month: 'short' });
    const anio = d.getFullYear();
    let horas = d.getHours();
    const min = d.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
    horas = horas % 12;
    horas = horas ? horas : 12;
    const horaStr = horas.toString().padStart(2, '0');
    return `${dia} ${mes} ${anio} ${horaStr}:${min} ${ampm}`;
  }

  protected startTour(): void {
    setTimeout(() => {
      this.tourService.startTour(this.stepsComponente);
    }, 500);
  }

  private stepsComponente = [
    {
      attachTo: {element: '.tour-ma-1', on: 'top'},
      title: '1. Pestaña',
      text: 'Numero de la pestaña de apelación'
    },
    {
      attachTo: {element: '.tour-ma-2', on: 'bottom'},
      title: '2. Cuaderno',
      text: 'Información del cuaderno que contiene la pestaña de apelación'
    },
    {
      attachTo: {element: '.tour-ma-3', on: 'top'},
      title: '3. Información de pestaña',
      text: 'Se muestra información relevante de la pestaña de apelación'
    },
    {
      attachTo: {element: '.tour-ma-4', on: 'bottom'},
      title: '4. Opciones',
      text: 'Menú de opciones disponibles para consultar sobre la pestaña de apelación'
    },
    {
      attachTo: {element: '.tour-ma-5', on: 'bottom'},
      title: '5. Tramite',
      text: 'Al hacer clic se desplegara los actos procesales con los tramites disponibles para realizar sobre la pestaña de apelación'
    }
  ];
}
