import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TramiteResponse } from '@core/interfaces/comunes/crearTramite';
import { ReusableEditarTramiteService } from '@services/reusables/reusable-editar-tramite.service';
import { TramiteModalComponent } from '@components/modals/tramite-modal/tramite-modal.component';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { AlertaData } from '@interfaces/comunes/alert';
import { ErrorValidacionNegocio } from '@interfaces/comunes/error-validacion-negocio.interface';
import { AlertaModalComponent } from '@components/modals/alerta-modal/alerta-modal.component';
import { GestionarPlantillasModalComponent } from '@components/modals/gestionar-plantillas-modal/gestionar-plantillas-modal.component';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { EnviarTramiteObjetivoComponent } from '@components/modals/mandar-caso/enviar-tramite-objetivo/enviar-tramite-objetivo.component';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { Expediente } from '@core/utils/expediente';
import { PlantillaTramiteManualService } from '@core/services/provincial/tramites/plantilla-tramite-manual.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { Plantilla } from '@core/interfaces/provincial/tramites/tramite-manual/plantillas-tramite-manual.interface';
import { DOMAIN_FRONT_NOTIFICADOR } from '@environments/environment';
import { TokenService } from '@core/services/shared/token.service';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { urlConsultaCasoFiscal } from '@core/utils/utils';
import { obtenerIcono } from '@utils/icon';
import { Router } from '@angular/router';
import { FirmaIndividualComponent } from '@components/generales/firma-individual/firma-individual.component';
import { Ripple } from 'primeng/ripple';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    MenubarModule,
    NgxCfngCoreModalDialogModule,
    FirmaIndividualComponent,
    Ripple,
  ],
  selector: 'app-menu-tramite',
  templateUrl: './menu-tramite.component.html',
  providers: [
    DialogService,
    NgxCfngCoreModalDialogService
  ],
})
export class MenuTramiteComponent implements OnInit, OnDestroy {
  @ViewChild(MenubarModule) menuBarModule!: MenubarModule;
  @Input() editar!: boolean;
  @Input() idCaso!: string;
  @Input() tramiteResponse!: TramiteResponse;
  @Input() casoFiscalPredefinido!: Expediente;

  public readonly obtenerIcono = obtenerIcono;

  menuItems: MenuItem[] = [];
  activeIndex: number = -1;
  casoFiscal!: Expediente;
  private  listaDocumentos: Plantilla[] = [];
  private validoEditar: boolean = false;

  public errorValidacion!: ErrorValidacionNegocio | null;
  public referenciaModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  private readonly textoNoSePuedeEditar: string = 'NO SE PUEDE EDITAR EL TRÁMITE'

  constructor(
    private readonly dialogService: DialogService,
    private readonly editarTramiteService: ReusableEditarTramiteService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly plantillaTramiteManualService: PlantillaTramiteManualService,
    private readonly tramiteService: TramiteService,
    private readonly spinner: NgxSpinnerService,
    private readonly router: Router,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected tokenService: TokenService,
  ) {
  }

  ngOnInit(): void {

    if(this.casoFiscalPredefinido!=null){
      this.casoFiscal= this.casoFiscalPredefinido
    }
    else{
      this.casoFiscal = this.gestionCasoService.expedienteActual;
    }

    this.plantillaTramiteManualService.reloadEditor.subscribe(
      reloadEditor => this.onModalClosedRefresh()
    );
    this.cargarTablaPlantillas();
   // this.cargarMenuItems();
    this.subscriptions.push(
      this.gestionCasoService.alActualizarCaso$.subscribe(caso => {
        this.casoFiscal = caso;
      })
    );
  }

  get documentoEditado(): boolean {
    return this.tramiteService.documentoEditado;
  }

  get formularioEditado(): boolean {
    return this.tramiteService.formularioEditado;
  }

  get activarGuardar(): boolean {
    return this.documentoEditado || this.formularioEditado;
  }

  get habilitarGuardar(): boolean {
    return this.tramiteService.habilitarGuardar;
  }

  get nombreTramite(): string {
    return this.casoFiscal != null ? this.casoFiscal.ultimoTramite.charAt(0) + this.casoFiscal.ultimoTramite.slice(1).toLowerCase() : '';
  }

  guardarTramite(): void {
    this.tramiteService.invocarGuadarTramite();
  }

  cargarTablaPlantillas() {
 
    this.plantillaTramiteManualService
      .listarPlantillas(this.casoFiscal.idActoTramiteEstado,this.casoFiscal.dependenciaFiscal, this.casoFiscal.idActoTramiteCasoUltimo)
      .subscribe({
        next: (data) => {
         this.listaDocumentos = data;
         this.cargarMenuItems();
          //this.cargandoCombobox = false;
        },
        error: (error) => {
          console.log('error al cargar plantillas', error);
        },
      });
  }
  private  cargarMenuItems() {
    if (this.editar) {
      const documentosItems =  this.listaDocumentos.map((documento) => ({
        label: documento.nombrePlantillaPersonalizada,
        icon: 'pi pi-fw pi-file',
        command: () => {
        
          this.tramiteService.handleReloadEditor(documento.pathPlantilla);
        },
      }));

      // Agregar el item de Gestionar Plantillas al final
      const gestionarPlantillasItem = {
        label: 'Gestionar Plantillas',
        icon: 'pi pi-fw pi-plus',
        command: () => {
        
          this.gestionarPlantillasModal();
        },
      };

      // Combinar los items de documentos con el item de Gestionar Plantillas
      this.menuItems = [
        {
          label: 'Cargar Plantilla',
          items: [...documentosItems, gestionarPlantillasItem],
        },
        { label: 'Enviar Tramite', command: () => this.enviarTramite() },
        {
          label: 'Historial del Trámite',
          command: () => this.verHistorialTramite(),
        },
      ];

    } else {
      this.menuItems = [
        {
          label: 'Historial de trámite',
          command: () => this.verHistorialTramite(),
        },
        {
          label: 'Editar trámite firmado',
          command: () => this.editarTramite(),
        },
        {
          label: 'Notificar a las partes',
          class: 'cfe-texto-verde font-bold',
          command: () => this.navegarANotificarCitar(),
        },
      ];
    }
  }

  isActive(index: number): boolean {
    return this.activeIndex === index;
  }

  private async editarTramite() {
    const idActoTramiteCaso: string = this.tramiteResponse.idActoTramiteCaso!
    await this.validarCondiciones(idActoTramiteCaso);
    if (this.validoEditar) {
      const cfeDialog = this.modalDialogService.warning(
        'EDITAR DOCUMENTO FIRMADO',
        'Esta acción invalida todas las firmas actuales y elimina todas las consecuencias realizadas después de haber firmado. Luego podrá volver a firmar el documento nuevamente. ¿Desea continuar?',
        'Continuar',
        true,
        'Cancelar'
      )
      cfeDialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.editarTramiteFirmado(idActoTramiteCaso)
          }
        }
      })
    } else {
      this.informarQueNoSePuedeEditar()
    }
  }

  private editarTramiteFirmado(idActoTramiteCaso: string): void {
    const casoActualizado = this.gestionCasoService.casoActual
    this.subscriptions.push(
      this.editarTramiteService.editarTramiteFirmado(idActoTramiteCaso).subscribe({
        next: () => {
          this.gestionCasoService.obtenerCasoFiscal( casoActualizado.idCaso )
          this.irAConsultaCaso(idActoTramiteCaso)
          window.location.reload()
        },
        error: () => {
          this.modalDialogService.error(
            'ERROR AL INTENTAR EDITAR DOCUMENTO FIRMADO',
            'Ha ocurrido un error inesperado al intentar editar el documento firmado',
            'Aceptar',
          )
        }
      })
    )
  }

  private irAConsultaCaso(idActoTramiteCas: string): void {
    const casoActualizado = this.gestionCasoService.casoActual
    const ruta = `${urlConsultaCasoFiscal(casoActualizado)}/acto-procesal/${
      idActoTramiteCas
    }/editar`;
    this.router.navigate([`${ruta}`]);
  }

  private informarQueNoSePuedeEditar(): void {
    const mensaje: string = this.errorValidacion!.message
    if ( mensaje.includes('se encuentra en proceso de notificación') ) {
      const cfeDialog = this.modalDialogService.warning(
        this.textoNoSePuedeEditar,
        mensaje,
        'Ir al generador',
        true,
        'Cancelar'
      )
      cfeDialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            const token = this.tokenService.getWithoutBearer()
            window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&idAplication=1`;
          }
        }
      })
      return
    }
    this.modalDialogService.warning(
      this.textoNoSePuedeEditar,
      mensaje,
      'Aceptar'
    )
  }

  private navegarANotificarCitar() {
    this.mostrarDialog(
      'question',
      'TIPO DE NOTIFICACIÓN',
      'Seleccione el tipo de notificación a realizar:',
      'Orden de notificación',
      'Orden de citación',
      true,
      'notificar',
      (resp: string) => {
        this.ruteoANotificacion(resp);
      }
    );
  }

  private ruteoANotificacion(opcion: string) {
    const token = this.tokenService.getWithoutBearer();
    if (opcion === 'notificar') {
      window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&type=notificacion&id=${this.tramiteResponse!.idMovimiento}`;
    } else if (opcion === 'citar') {
      window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&type=citacion&id=${this.tramiteResponse!.idMovimiento}`;
    }
  }

  public verHistorialTramite(): void {
    this.referenciaModal = this.dialogService.open(
      HistorialTramiteModalComponent,
      {
        showHeader: false,
        data: {
          idCaso: this.idCaso,
          numeroCaso: this.casoFiscal.numeroCaso,
          idTramite: this.casoFiscal.idActoTramiteCasoUltimo,
          titulo: this.casoFiscal.ultimoTramite,
        },
      }
    );
  }

  private enviarTramite() {
    this.dialogService.open(EnviarTramiteObjetivoComponent, {
        width: '50em',
        contentStyle: { padding: '15px', 'border-radius': '15px' },
        showHeader: false,
        data: {
          idBandejaActoTramite: null,
          idCaso: this.casoFiscal.idCaso,
          numeroCaso: this.casoFiscal.numeroCaso,
          idTramite: this.casoFiscal.idActoTramiteEstado,
          idActoTramiteCaso: this.casoFiscal.idActoTramiteCasoUltimo,
          tramite: this.casoFiscal.ultimoTramite,
        },
      }
    );
  }

  gestionarPlantillasModal() {
    this.referenciaModal = this.dialogService.open(
      GestionarPlantillasModalComponent,
      {
        showHeader: false,
        data: {
          idActoTramiteEstado: this.casoFiscal.idActoTramiteEstado,
          codigoDespacho: this.casoFiscal.dependenciaFiscal,
          idActoTramiteCaso: this.casoFiscal.idActoTramiteCasoUltimo,
        },
      }
    );
  }

  private mostrarDialog(
    icono: string,
    titulo: string,
    mensaje: string,
    primerTitulo: string,
    segundoTitulo: string,
    confirm: boolean,
    accion: string,
    logicaNegocio: (opcion: string) => void
  ): void {
    const ref = this.dialogService.open(TramiteModalComponent, {
      width: '40%',
      showHeader: false,
      data: {
        icon: icono,
        title: titulo,
        description: mensaje,
        tituloPrimerBoton: primerTitulo,
        tituloSegundoBoton: segundoTitulo,
        confirm: confirm,
        accion: accion,
      },
    });
    ref.onClose.subscribe({
      next: (resp) => {
        logicaNegocio(resp);
      },
    });
  }

  private async validarCondiciones(idActoTramiteCaso: string) {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.subscriptions.push(
        this.editarTramiteService
          .validarCondiciones(idActoTramiteCaso)
          .subscribe({
            next: () => {
              this.validoEditar = true;
              this.spinner.hide();
              resolve();
            },
            error: (error) => {
              if (error.status == HttpStatusCode.UnprocessableEntity) {
                this.errorValidacion = error.error;
              } else {
                this.errorValidacion = null;
              }
              this.spinner.hide();
              this.informarQueNoSePuedeEditar()
            },
          })
      );
    })
  }

  alertaCondiciones(
    mensaje: any,
    submensaje: any,
    icono: any,
    textoBotonConfirm: any
  ) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icono, //'info',
        title: mensaje,
        description: submensaje,
        confirmButtonText: textoBotonConfirm, //OK,
        confirm: false,
      },
    } as DynamicDialogConfig<AlertaData>);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((suscripcion) => suscripcion?.unsubscribe());
  }
  onModalClosedRefresh() {
    this.cargarTablaPlantillas();
  }
}
