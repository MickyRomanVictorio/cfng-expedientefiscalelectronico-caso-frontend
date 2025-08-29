import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertaEliminarTramiteComponent } from '@components/modals/alerta-eliminar-tramite/alerta-eliminar-tramite.component';
import { EliminarTramiteModalComponent } from '@components/modals/eliminar-tramite-modal/eliminar-tramite-modal.component';
import { HistorialTramiteModalComponent } from '@components/modals/historial-tramite-modal/historial-tramite-modal.component';
import { TramiteActivo } from '@core/interfaces/provincial/expediente/expediente-detalle/detalle-tramite/historia-caso/tramites-activos/tramites-activos.interface';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { TokenService } from '@core/services/shared/token.service';
import { Expediente } from '@core/utils/expediente';
import { ErrorValidacionNegocio } from '@interfaces/comunes/error-validacion-negocio.interface';
import { InformacionEliminarTramite } from '@interfaces/reusables/eliminar-tramite/informacion-eliminar-tramite';
import { EliminarTramiteService } from '@services/reusables/efe/eliminar-tramite/eliminar-tramite.service';
import { TramitesActivosService } from '@services/reusables/efe/tramites-activos.service';
import { ReusableEditarTramiteService } from '@services/reusables/reusable-editar-tramite.service';
import { urlConsultaCasoFiscal, urlConsultaCuaderno } from '@utils/utils';
import { DateUtil, IconUtil, MathUtil, TRAMITE } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService, SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { capitalized } from '@utils/string';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { TipoArchivoType } from '@core/types/exportar.type';
import { ExportarService } from '@core/services/shared/exportar.service';
import { VerDetalleObservacionTramiteComponent } from './ver-detalle-observacion-tramite/ver-detalle-observacion-tramite.component';
import { VerSujetosProcesalesTramiteComponent } from '../components/ver-sujetos-procesales-tramite/ver-sujetos-procesales-tramite.component';
import { ModalVerDetalleFirmasComponent } from '@core/components/modals/modal-ver-detalle-firmas/modal-ver-detalle-firmas.component';
import { DOMAIN_FRONT_NOTIFICADOR } from '@environments/environment';
import { EliminarTramiteRequest } from '@core/interfaces/reusables/eliminar-tramite/eliminar-tramite-request';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { RevertirTramiteRequest } from '@core/interfaces/reusables/revertir-tramite/revertir-tramite-request';
import { ReversionTramiteModalComponent } from '@core/components/modals/reversion-tramite-modal/reversion-tramite.modal.component';
import { PreviewResolucionModalComponent } from './preview-resolucion-modal/preview-resolucion-modal.component';
import { TRAMITE_TIPO_CUADERNO } from '@constants/menu';
import { CasosMonitoreadosService } from '@core/services/superior/casos-monitoreados/casos-monitoreados.service';

@Component({
  selector: 'app-tramites-activos',
  templateUrl: './tramites-activos.component.html',
  styleUrls: ['./tramites-activos.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    SharedModule,
    TableModule,
    CmpLibModule,
    ToastModule,
    ProgressBarModule,
    NgxCfngCoreModalDialogModule,
    PaginatorComponent,
  ],
  standalone: true,
  providers: [
    MessageService,
    DatePipe,
    TitleCasePipe,
    DialogService,
    NgxCfngCoreModalDialogService,
  ],
})
export class TramitesActivosComponent implements OnInit {
  private caso!: Expediente;
  private validoEditar: boolean = false;
  private validoEliminar: boolean = false;
  private readonly suscripciones: Subscription[] = [];
  private readonly ESTADO_TRAMITE_FIRMADO: string = 'FIRMADO';

  protected tramitesActivos: TramiteActivo[] = [];
  protected tramitesActivosFiltrado: TramiteActivo[] = [];
  protected errorValidacion!: ErrorValidacionNegocio | null;
  protected errorValidacionEliminacion!: ErrorValidacionNegocio | null;
  protected esSoloLectura: boolean = false;

  protected idIngresoPorMesa: number = 1366;
  protected idIngresoPorFical: number = 1365;
  protected idIngresoMixto: number = 1367;
  protected FLAG_ACTIVO: string = '1';
  protected capitalized = capitalized;
  protected usuario: any;

  private readonly textoNoSePuedeEditar: string =
    'NO SE PUEDE EDITAR EL TRÁMITE';
  private readonly textoNoSePuedeEliminar: string =
    'NO SE PUEDE ELIMINAR EL TRÁMITE';

  //paginación
  protected query: any = { limit: 10, page: 1, where: {} };
  protected resetPage: boolean = false;
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    private readonly tramitesActivosService: TramitesActivosService,
    private readonly editarTramiteService: ReusableEditarTramiteService,
    private readonly spinner: NgxSpinnerService,
    private readonly dialogService: DialogService,
    private readonly router: Router,
    private readonly eliminarTramiteService: EliminarTramiteService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly tokenService: TokenService,
    protected mathUtil: MathUtil,
    protected dateUtil: DateUtil,
    protected iconUtil: IconUtil,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly exportarService: ExportarService,
    private readonly casosMonitoreadosService: CasosMonitoreadosService,
  ) {
    this.usuario = this.tokenService.getDecoded().usuario;
  }

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    const flgLectura = this.caso?.flgLectura?.toString();
    const flgConcluido = this.caso?.flgConcluido?.toString();
    this.esSoloLectura = flgLectura === '1' || flgConcluido === '1';
    this.obtenerTramitesActivos();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  get esFiscalProvincial(): boolean {
    return this.usuario.cargo === 'FISCAL PROVINCIAL';
  }

  private obtenerTramitesActivos() {
    this.tramitesActivosService
      .obtenerTramitesActivos(this.caso.idCaso)
      .subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.tramitesActivos = resp;
          console.log('....................');
          console.log(this.tramitesActivos);
          console.log('....................');

          this.tramitesActivosFiltrado = this.tramitesActivos;
          this.itemPaginado.data.data = this.tramitesActivosFiltrado;
          this.itemPaginado.data.total = this.tramitesActivosFiltrado.length;
          this.updatePagedItems(this.tramitesActivosFiltrado, false);
        },
        error: (error) => {
          console.error('error al editar tramite firmado');
          console.error(error);
        },
      });
  }

  onPaginate(paginacion: PaginacionInterface) {
    this.query.page = paginacion.page;
    this.query.limit = paginacion.limit;
    this.updatePagedItems(paginacion.data, paginacion.resetPage);
  }

  updatePagedItems(data: any, reset: boolean) {
    this.resetPage = reset;
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.tramitesActivosFiltrado = data.slice(start, end);
  }

  private async validarCondiciones(idActoTramiteCaso: string) {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.suscripciones.push(
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
              this.informarQueNoSePuedeEditar();
            },
          })
      );
    });
  }

  private despachoIgualAOrigen(codDespachoTramite: string): boolean {
    return this.usuario.codDespacho === codDespachoTramite;
  }

  private esModoLecturaMonitoreado(): boolean {
    const esMonitoreado = this.casosMonitoreadosService.getEsMonitoreado(); 
    return esMonitoreado === '1';
  }

  private esModoLectura(): boolean {
    //Primero valida monitoreo
    if (this.esModoLecturaMonitoreado()) {
      return true;
    }
    const flgLect =
      this.gestionCasoService.getCasoFiscalActual()?.flgLectura?.toString() ??
      '0';
    const flgCon =
      this.gestionCasoService.getCasoFiscalActual()?.flgConcluido ?? '0';
    return flgLect === '1' || flgCon === '1';
  }

  protected esPosibleEditarTramite(estadoTramite: string): boolean {
    //Luego valida el modo lectura normal
    if (this.esModoLectura()) {
      return false;
    }
    //Lógica existente
    const esFirmado = estadoTramite === this.ESTADO_TRAMITE_FIRMADO;
    return (esFirmado ? this.esFiscalProvincial : true) || !this.esFiscalProvincial;
  }

  protected esPosibleEliminarTramite(
    idTipoIngresoTramite: number,
    despachoTramite: string,
    estadoTramite: string,
    origenTramite: number
  ): boolean {
    //Luego valida el modo lectura normal
    if (this.esModoLectura()) {
      console.log('esModoLectura');
      return false;
    }

    console.log('logicaExistente');
    //Lógica existente
    const esIngresoFiscal = idTipoIngresoTramite === this.idIngresoPorFical;
    const esIngresoMixtoOriginadoEnEfe =
      idTipoIngresoTramite === this.idIngresoMixto && origenTramite === 5;
    return (
      (esIngresoFiscal || esIngresoMixtoOriginadoEnEfe) &&
      this.despachoIgualAOrigen(despachoTramite) &&
      ((estadoTramite === this.ESTADO_TRAMITE_FIRMADO &&
        this.esFiscalProvincial) ||
        estadoTramite !== this.ESTADO_TRAMITE_FIRMADO)
    );
  }

  protected esPosibleRevertirTramite(
    flgElevacion: string,
    flgElevacionAceptada: string,
    flgNoEfe: string
  ): boolean {
    const esElevado = flgElevacion === this.FLAG_ACTIVO;
    const esAceptado = flgElevacionAceptada === this.FLAG_ACTIVO;
    const tieneEfe = flgNoEfe === '0';

    if (!this.esFiscalProvincial || !esElevado) {
      return false;
    }

    return tieneEfe ? !esAceptado : false;
  }

  protected verMensajeTramiteOculto(): void {
    this.modalDialogService.info(
      'TRÁMITE OCULTO',
      'Este trámite se encuentra oculto para los demás usuarios, eres el único que puede visualizarlo, hasta que se culmine el plazo del secreto.',
      'Ok'
    );
  }

  protected verDetalleFirmasModal(tramite: any): void {
    this.dialogService.open(ModalVerDetalleFirmasComponent, {
      width: '70%',
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        idDocumento: tramite.idDocumentoTramite,
        /** idCaso: tramite.idCaso,
         numeroCaso: tramite.coCaso,
         idTramite: tramite.idActoTramiteCaso,
         titulo: tramite.noTramite, **/
      },
    });
  }

  protected verSujetosProcesalesTramite(tramiteActivo: TramiteActivo): void {
    this.dialogService.open(VerSujetosProcesalesTramiteComponent, {
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
      data: {
        idActoTramiteCaso: tramiteActivo.idActoTramiteCaso,
      },
    });
  }

  protected verHistorialTramite(tramite: any): void {
    this.dialogService.open(HistorialTramiteModalComponent, {
      showHeader: false,
      contentStyle: { 'border-radius': '15px' },
      data: {
        idCaso: this.caso.idCaso,
        numeroCaso: this.caso.numeroCaso,
        idTramite: tramite.idActoTramiteCaso,
        titulo: tramite.descTramite,
      },
    });
  }

  private getUrlCasoCuaderno() {
    let rutaBase: string;
    if (
      this.caso.idClasificadorExpediente ===
      TRAMITE_TIPO_CUADERNO.TRAMITE_CUADERNOS_INCIDENTALES
    ) {
      rutaBase = urlConsultaCuaderno('incidental', this.caso);
    } else if (
      this.caso.idClasificadorExpediente ===
      TRAMITE_TIPO_CUADERNO.TRAMITE_CUADERNOS_EXTREMO
    ) {
      rutaBase = urlConsultaCuaderno('extremo', this.caso);
    } else {
      rutaBase = urlConsultaCasoFiscal(this.caso);
    }
    return rutaBase;
  }

  protected previsualizarTramite(tramiteActivo: TramiteActivo): void {
    this.router
      .navigate([
        `${this.getUrlCasoCuaderno()}/acto-procesal/${
          tramiteActivo.idActoTramiteCaso
        }`,
      ])
      .then();
  }

  private irAConsultaCaso(idActoTramiteCas: string): void {
    this.caso = this.gestionCasoService.casoActual;
    this.router.navigate([
      `${this.getUrlCasoCuaderno()}/acto-procesal/${idActoTramiteCas}/editar`,
    ]);
  }

  protected async editarTramite(tramiteActivo: TramiteActivo) {
    await this.validarCondiciones(tramiteActivo.idActoTramiteCaso);
    if (this.validoEditar) {
      if (
        (tramiteActivo.tipoIngresoTramite === this.idIngresoPorFical ||
          tramiteActivo.tipoIngresoTramite === this.idIngresoMixto) &&
        tramiteActivo.estadoTramite === this.ESTADO_TRAMITE_FIRMADO
      ) {
        const cfeDialog = this.modalDialogService.warning(
          'EDITAR DOCUMENTO FIRMADO',
          'Esta acción invalida todas las firmas actuales y elimina todas las consecuencias realizadas después de haber firmado. Luego podrá volver a firmar el documento nuevamente. ¿Desea continuar?',
          'Continuar',
          true,
          'Cancelar'
        );
        cfeDialog.subscribe({
          next: (resp: CfeDialogRespuesta) => {
            if (resp === CfeDialogRespuesta.Confirmado) {
              this.editarTramiteFirmado(tramiteActivo);
            }
          },
        });
        return;
      }
      this.editarTramiteFirmado(tramiteActivo);
    } else {
      this.informarQueNoSePuedeEditar();
    }
  }

  private editarTramiteFirmado(tramiteActivo: TramiteActivo): void {
    this.suscripciones.push(
      this.editarTramiteService
        .editarTramiteFirmado(tramiteActivo.idActoTramiteCaso)
        .subscribe({
          next: () => {
            this.gestionCasoService.obtenerCasoFiscal(this.caso.idCaso);
            this.irAConsultaCaso(tramiteActivo.idActoTramiteCaso);
          },
          error: (error) => {
            const mensaje = error.error.message
              ? error.error.message
              : 'Ha ocurrido un error inesperado al intentar editar el documento firmado';
            this.modalDialogService.error(
              'ERROR AL INTENTAR EDITAR DOCUMENTO FIRMADO',
              mensaje,
              'Aceptar'
            );
          },
        })
    );
  }

  private informarQueNoSePuedeEditar(): void {
    const mensaje: string = this.errorValidacion!.message;
    if (
      mensaje.includes(
        'se encuentra en proceso de notificación y tiene cédulas(s) generada(s)'
      )
    ) {
      const cfeDialog = this.modalDialogService.warning(
        this.textoNoSePuedeEditar,
        mensaje,
        'Ir al generador',
        true,
        'Cancelar'
      );
      cfeDialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            const token = this.tokenService.getWithoutBearer();
            window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&idAplication=1`;
          }
        },
      });
      return;
    }
    this.modalDialogService.warning(
      this.textoNoSePuedeEditar,
      mensaje,
      'Aceptar'
    );
  }

  protected async eliminarTramite(tramiteActivo: TramiteActivo): Promise<void> {
    await this.validarCondicionesEliminacion(tramiteActivo.idActoTramiteCaso);
    if (this.validoEliminar) {
      if (
        (tramiteActivo.tipoIngresoTramite === this.idIngresoPorFical ||
          tramiteActivo.tipoIngresoTramite === this.idIngresoMixto) &&
        tramiteActivo.estadoTramite === this.ESTADO_TRAMITE_FIRMADO
      ) {
        const cfeDialog = this.modalDialogService.warning(
          'ELIMINAR DOCUMENTO FIRMADO',
          'Esta acción invalida todas las firmas actuales y elimina todas las consecuencias realizadas después de haber firmado. Luego podrá volver a firmar el documento nuevamente. ¿Desea continuar?',
          'Continuar',
          true,
          'Cancelar'
        );
        cfeDialog.subscribe({
          next: (resp: CfeDialogRespuesta) => {
            if (resp === CfeDialogRespuesta.Confirmado) {
              this.eliminarTramiteFirmado(tramiteActivo);
            }
          },
        });
        return;
      }
      this.eliminarTramiteFirmado(tramiteActivo);
    } else {
      this.informarQueNoSePuedeEliminar();
    }
  }

  //el metodo de validacion no se esta tomando en cuenta, llama al servicio pero el resultado no es tomado.
  private validarCondicionesEliminacion(
    idActoTramiteCaso: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.suscripciones.push(
        this.eliminarTramiteService
          .validarEliminarTramite(idActoTramiteCaso)
          .subscribe({
            next: () => {
              this.validoEliminar = true;
              this.spinner.hide();
              resolve();
            },
            error: (error) => {
              if (error.status == HttpStatusCode.UnprocessableEntity) {
                this.errorValidacionEliminacion = error.error;
              } else {
                this.errorValidacionEliminacion = null;
              }
              this.spinner.hide();
              this.informarQueNoSePuedeEliminar();
            },
          })
      );
    });
  }

  private informarQueNoSePuedeEliminar(): void {
    const mensaje: string = this.errorValidacionEliminacion!.message;
    if (
      mensaje.includes(
        'se encuentra en proceso de notificación y tiene cédulas(s) generada(s)'
      )
    ) {
      const cfeDialog = this.modalDialogService.warningRed(
        this.textoNoSePuedeEliminar,
        mensaje,
        'Ir al generador',
        true,
        'Cancelar'
      );
      cfeDialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            const token = this.tokenService.getWithoutBearer();
            window.location.href = `${DOMAIN_FRONT_NOTIFICADOR}/auth/auto?token=${token}&idAplication=1`;
          }
        },
      });
      return;
    }
    this.modalDialogService.warningRed(
      this.textoNoSePuedeEliminar,
      mensaje,
      'Aceptar'
    );
  }

  private eliminarTramiteFirmado(tramiteActivo: TramiteActivo): void {
    const referenciaModal = this.dialogService.open(
      EliminarTramiteModalComponent,
      {
        styleClass: 'p-dialog--lg',
        showHeader: false,
      }
    );

    const idActoTramiteCaso = tramiteActivo.idActoTramiteCaso;

    referenciaModal.onClose.subscribe(({ accion, motivo }) => {
      if (accion === 'confirmar') {
        const datos: EliminarTramiteRequest = { idActoTramiteCaso, motivo };
        this.suscripciones.push(
          this.eliminarTramiteService.eliminarTramite(datos).subscribe({
            next: () => {
              this.gestionCasoService.obtenerCasoFiscal(this.caso.idCaso);
              this.obtenerTramitesActivos();

              this.modalDialogService.success(
                'TRAMITE ELIMINADO CORRECTAMENTE',
                `El trámite <b>${tramiteActivo.descTramite} para el caso: ${this.caso.numeroCaso},</b> fue eliminado correctamente`,
                'Aceptar'
              );
            },
            error: () => {
              this.modalDialogService.error(
                'ERROR AL INTENTAR ELIMINAR DOCUMENTO FIRMADO',
                'Ha ocurrido un error inesperado al intentar eliminar el documento firmado',
                'Aceptar'
              );
            },
          })
        );
      }
    });
  }

  protected revertirTramiteElevado(tramiteActivo: TramiteActivo): void {
    const referenciaModal = this.dialogService.open(
      ReversionTramiteModalComponent,
      {
        showHeader: false,
        styleClass: 'p-dialog--lg',
        data: {
          titulo: 'MOTIVO DE REVERSIÓN DEL TRÁMITE',
          numeroCaso: this.caso.numeroCaso,
          etiquetaNota: 'Nota:',
          nota: 'Al realizar esta acción, el trámite elevado ya no se visualizará en la Fiscalía Superior.',
        },
      }
    );

    const idActoTramiteCaso = tramiteActivo.idActoTramiteCaso;
    const idCaso = this.caso.idCaso;
    const coUsuario = this.usuario.usuario;

    referenciaModal.onClose.subscribe(({ accion, motivo }) => {
      if (accion === 'confirmar') {
        const datos: RevertirTramiteRequest = {
          idActoTramiteCaso,
          idCaso,
          motivo,
          coUsuario,
        };
        this.suscripciones.push(
          this.tramitesActivosService.revertirTramite(datos).subscribe({
            next: () => {
              this.gestionCasoService.obtenerCasoFiscal(this.caso.idCaso);
              this.obtenerTramitesActivos();

              this.modalDialogService.success(
                'TRAMITE CORRECTAMENTE REVERTIDO',
                `El trámite fue revertido correctamente`,
                'Aceptar'
              );
              /**setTimeout(() => {
                this.obtenerTramitesActivos()
              }, 0)**/
            },
            error: () => {
              this.modalDialogService.error(
                'ERROR AL INTENTAR REVERTIR EL TRAMITE',
                'Ha ocurrido un error inesperado al intentar revertir el tramite',
                'Aceptar'
              );
            },
          })
        );
      }
    });
  }

  protected verDocumentosAdjuntos(tramiteActivo: TramiteActivo): void {
    console.log('Aqui va la ver documentos adjuntos');

    this.dialogService.open(PreviewResolucionModalComponent, {
      showHeader: false,
      width: '1000px',
      height: '95%',
      contentStyle: {
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      },
      data: {
        idActoTramiteCaso: tramiteActivo.idActoTramiteCaso,
        titulo: 'RESOLUCIÓN ADJUNTA',
      },
    });
  }

  protected verDetalleObservacion(tramiteActivo: TramiteActivo): void {
    console.log('idActoTramiteCaso = ', tramiteActivo.idActoTramiteCaso);
    this.spinner.show();
    this.suscripciones.push(
      this.tramitesActivosService
        .obtenerObservacionTramite(tramiteActivo.idActoTramiteCaso)
        .subscribe({
          next: (resp: any) => {
            this.spinner.hide();
            this.dialogService.open(VerDetalleObservacionTramiteComponent, {
              showHeader: false,
              contentStyle: { padding: '0', 'border-radius': '15px' },
              data: {
                titulo: 'DETALLE DE LA OBSERVACIÓN DEL TRÁMITE',
                numeroCaso: this.caso.numeroCaso,
                detalle: resp.observacion,
                fecha: resp.fechaObservacion,
                usuario: resp.usuario,
                etiquetaDetalle: 'Detalles de la observación',
                etiquetaFecha: 'Fecha de observación',
              },
            });
          },
          error: (error: any) => {
            this.spinner.hide();
            console.error(error);
          },
        })
    );
  }

  protected verMotivoReversion(tramiteActivo: TramiteActivo): void {
    this.spinner.show();
    this.suscripciones.push(
      this.tramitesActivosService
        .obtenerMotivoReversion(tramiteActivo.idActoTramiteCaso)
        .subscribe({
          next: (resp: any) => {
            this.spinner.hide();
            this.dialogService.open(VerDetalleObservacionTramiteComponent, {
              showHeader: false,
              contentStyle: { padding: '0', 'border-radius': '15px' },
              data: {
                titulo: 'DETALLE DE REVERSIÓN DE ELEVACIÓN AL SUPERIOR',
                numeroCaso: this.caso.numeroCaso,
                detalle: resp.motivo,
                fecha: resp.fechaReversion,
                usuario: resp.usuario,
                etiquetaDetalle: 'Motivo',
                etiquetaFecha: 'Fecha de reversión',
              },
            });
          },
          error: (error: any) => {
            this.spinner.hide();
            console.error(error);
          },
        })
    );
  }

  protected mostrarAlertaTramiteFirmado(
    icono: any,
    titulo: any,
    mensaje: any,
    datos: any
  ) {
    this.dialogService.open(AlertaEliminarTramiteComponent, {
      styleClass: 'p-dialog--lg',
      showHeader: false,
      data: {
        icon: icono,
        titulo: titulo,
        descripcion: mensaje,
        dato: datos,
      },
    } as DynamicDialogConfig<InformacionEliminarTramite>);
  }

  protected exportar(tipoExportacion: TipoArchivoType) {
    if (this.tramitesActivos.length > 0) {
      const headers = [
        'N°',
        'Etapa',
        'Acto procesal',
        'Trámite',
        'Estado',
        'Fecha de emisión',
        'Firmante',
      ];
      const data: any[] = [];

      this.tramitesActivos.forEach((tramite: TramiteActivo) => {
        const esIngresoPorMesa: boolean =
          tramite.tipoIngresoTramite === this.idIngresoPorMesa;
        const row = {
          'N°': tramite.nro,
          Etapa: tramite.descEtapa,
          'Acto procesal': tramite.descActoProcesal,
          Trámite: tramite.descTramite,
          Estado: tramite.estadoTramite,
          /**'Fecha de emisión': !esIngresoPorMesa ? this.dateUtil.formatearFechaHoraAbreviada(tramite.fechaEmision) : '-',**/
          'Fecha de emisión': !esIngresoPorMesa
            ? this.formatoFecha(tramite.fechaEmision)
            : '-',
          Firmante: !esIngresoPorMesa ? tramite.nombreFirmante : null,
        };
        data.push(row);
      });

      if (tipoExportacion === 'PDF') {
        this.exportarService.exportarAPdf(
          data,
          headers,
          'Trámites activos',
          'landscape'
        );
        return;
      }

      if (tipoExportacion === 'Excel') {
        this.exportarService.exportarAExcel(data, headers, 'Trámites activos');
      }
      return;
    }

    this.modalDialogService.warning(
      '',
      `No se encontraron registros para ser exportados a ${tipoExportacion}`,
      'Aceptar',
      false
    );
  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  protected formatoFechaF(f: string): string {
    if (!f) return '-';
    const d = new Date(f);
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

  formatoFecha(fechaString: string): string {
    if (!fechaString) {
      return '-';
    }

    const fecha = new Date(fechaString);

    if (isNaN(fecha.getTime())) {
      return '-';
    }

    // Obtenemos el día, mes, año, horas, minutos y segundos
    const dia = fecha.getDate().toString().padStart(2, '0'); // Asegura que el día tenga 2 dígitos
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Asegura que el mes tenga 2 dígitos
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    /**const segundos = fecha.getSeconds().toString().padStart(2, '0');**/

    // Formateamos la fecha en el formato 'dd-MM-yyyy HH:mm:ss'
    return `${dia}-${mes}-${anio} ${horas}:${minutos}`;
  }
}
