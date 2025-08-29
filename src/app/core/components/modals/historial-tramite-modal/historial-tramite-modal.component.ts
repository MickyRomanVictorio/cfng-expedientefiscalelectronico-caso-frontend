import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';

import { DatePipe, NgStyle } from '@angular/common';
import { HistorialTramite } from '@components/modals/historial-tramite-modal/HistorialTramite';
import { BandejaTramite } from '@interfaces/provincial/bandeja-tramites/BandejaTramite';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { ReusableHistorialTramiteService } from '@services/reusables/reusable-historial-tramite.service';
import { Constants, IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PreviewModalComponent } from '../preview-modal/preview-modal.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { TokenService } from '@core/services/shared/token.service';
import { BandejaTramitesService } from '@core/services/provincial/bandeja-tramites/bandeja-tramites.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReusableEditarTramiteService } from '@core/services/reusables/reusable-editar-tramite.service';
import { HttpStatusCode } from '@angular/common/http';
import { DOMAIN_FRONT_NOTIFICADOR } from '@environments/environment';
import { ErrorValidacionNegocio } from '@core/interfaces/comunes/error-validacion-negocio.interface';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-visor-efe-modal',
  templateUrl: './historial-tramite-modal.component.html',
  imports: [
    CmpLibModule,
    SharedModule,
    TableModule,
    NgStyle,
    ButtonModule,
    PaginatorComponent
  ],
  providers: [NgxCfngCoreModalDialogService, DatePipe],
})
export class HistorialTramiteModalComponent {
  public desdePendientesRevisar: boolean = false;
  public esFiscal: boolean = false;
  public desdeFirmados: boolean = false;

  titulo: string = 'Historial del trámite: ';
  numeroCaso: string = '';
  idCaso: string = '';
  idTramite: string = '';
  tramite: string = '';

  historialTramite: HistorialTramite[] = [];

  fechaFormateada!: string;

  subTituloModal: SafeHtml | undefined = undefined;
  cargandoTabla: boolean = false;

  protected usuario: any;
  ultimoFirmarIndex: number = -1;

  private readonly suscripciones: Subscription[] = [];
  private validoEditar: boolean = false;
  protected errorValidacion!: ErrorValidacionNegocio | null;
  private readonly textoNoSePuedeEditar: string = 'NO SE PUEDE RESTAURAR EL TRÁMITE'

  protected paginacionCondicion = { limit: 10, page: 1, where: {} };
  public paginacionConfiguracion: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  paginacionReiniciar = false;
  constructor(
    private readonly referenciaModal: DynamicDialogRef,
    private readonly configuracion: DynamicDialogConfig,
    private readonly sanitizador: DomSanitizer,
    private readonly reusableHistorialTramiteService: ReusableHistorialTramiteService,
    private readonly dialogService: DialogService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly tokenService: TokenService,
    private readonly bandejaTramitesService: BandejaTramitesService,
    private readonly spinner: NgxSpinnerService,
    private readonly editarTramiteService: ReusableEditarTramiteService,
    private readonly router: Router
  ) {
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.idCaso = this.configuracion.data?.idCaso;
    this.idTramite = this.configuracion.data?.idTramite;
    this.tramite = this.configuracion.data?.titulo;
    this.desdePendientesRevisar = this.configuracion.data?.desdePendientesRevisar ?? false;
    this.desdeFirmados = this.configuracion.data?.desdeFirmados ?? false;
    this.usuario = this.tokenService.getDecoded().usuario;
  }

  ngOnInit(): void {
    this.obtenerSubTitulo();
    this.loadListaHistorialTramite();
    this.validarPerfilUsuario();
  }

  private validarPerfilUsuario(): void {
    const helper = new JwtHelperService();
    const token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);

    if (token) {
      const decodedToken = helper.decodeToken(token.token);
      const perfilUsuario = decodedToken.usuario.cargo;
      this.esFiscal = ['FISCAL PROVINCIAL', 'FISCAL SUPERIOR'].includes(perfilUsuario);
    }
  }

  protected eventoCambiarPagina(datos: any) {
    this.paginacionCondicion.page = datos.page;
    this.paginacionCondicion.limit = datos.limit;
    const start =
      (this.paginacionCondicion.page - 1) * this.paginacionCondicion.limit;
    const end = start + this.paginacionCondicion.limit;
    this.historialTramite = datos.data.slice(start, end);
  }

  loadListaHistorialTramite() {
    const idActoTramiteCaso = this.idTramite;
    this.reusableHistorialTramiteService
      .getListaHistorialTramite(idActoTramiteCaso, 10, 0)
      .subscribe((result: any) => {
        this.historialTramite = result.data;
        this.paginacionConfiguracion.data.data = this.historialTramite;
        this.paginacionConfiguracion.data.total = this.historialTramite.length;

        this.eventoCambiarPagina({
          data: this.historialTramite,
          page: this.paginacionCondicion.page,
          limit: this.paginacionCondicion.limit,
        });
      });
  }

  showOptions(tramite: any) {
    const validateAccion = [
      'ENVIAR PARA VISAR',
      'ENVIAR PARA REVISAR',
      'VISAR',
      'FIRMAR',
      'RESTAURAR VERSION'
      /**'NOTIFICAR',
      'RESTAURAR VERSION'**/
    ].includes(tramite.accion);
    return validateAccion && this.tramiteSeEncuentraDespachoyNoElevadoDerivado(tramite);
  }

  //verificamos si el tramite se encuentra en el despacho y no ha sido elevado o derivado.
  private tramiteSeEncuentraDespachoyNoElevadoDerivado(tramite: any): boolean {
    return this.despachoIgualAOrigen(tramite.coDespacho) && (tramite.esElevado === '0' || tramite.esDerivado === '0');
  }

  //verificamos el despacho
  private despachoIgualAOrigen(codDespachoTramite: string): boolean {
    return this.usuario.codDespacho === codDespachoTramite;
  }

  //validamos el boton ver documento
  public esUltimoTramite(tramite: HistorialTramite): boolean {
    return tramite.nro == '1' ;
  }

  //validamos el boton restaurar
  public validarBotonRestaurar(tramite: HistorialTramite, index: string): boolean {
    return  (this.desdePendientesRevisar || this.desdeFirmados) && !this.esUltimoTramite(tramite)
      && !this.esNotificarRestaurarVersion(tramite)
      && this.btnRestaurarParaFirmados(tramite)
      && !this.esEstadoCancelado(tramite);
  }

  esEstadoCancelado(tramite: any) {
    return tramite.flagEstado === '2';
  }

  get existeMasDeUnFirmado(): boolean {
    return this.historialTramite.filter(item => item.accion === 'FIRMAR').length > 1
  }

  protected btnRestaurarParaFirmados(tramite: HistorialTramite): boolean {
    if ( tramite.accion === 'FIRMAR' && this.existeMasDeUnFirmado ) {
      const firma = this.historialTramite.filter(item => item.accion === 'FIRMAR')[0];
      return firma.nro != tramite.nro
    }
    return true;
  }

  //solo la accion NOTIFICAR y RESTAURAR VERSION validara
  esNotificarRestaurarVersion(tramite: any) {
    const validateAccion = [
      'NOTIFICAR',
      'RESTAURAR VERSION'
    ].includes(tramite.accion);
    return validateAccion;
  }

  protected visorTramitePDF(tramite: BandejaTramite): void {
    this.bandejaTramitesService
      .obtenerDatosPrevisualizarVersion(tramite.idDocumentoVersiones)
      .subscribe({
        next: (resp) => {
          if (!resp.data || resp.data.idNode === null) {
            this.modalDialogService.warning(
              'VERSIÓN NO DISPONIBLE',
              `Esta versión ya no se encuentra disponible, para más información comuníquese con el área de soporte del sistema`,
              'Aceptar'
            );
          } else {
            const _ = this.dialogService.open(PreviewModalComponent, {
              showHeader: false,
              width: '1000px',
              height: '90vh',
              data: {
                tramite: tramite,
              }
            });
          }
        },
        error: (err) => {
          console.error('Error en visorTramitePDF: ', err);
        },
      });
  }

  public async restaurarTramite(
    fecha: string,
    idBandejaActoTramite: string,
    idDocumentoVersiones: string,
    accion: string,
    idActoTramiteCaso: string
  ) {
    if (accion == 'FIRMAR') {
      await this.validarCondiciones(idActoTramiteCaso);
      if (this.validoEditar) {
        this.exeRestaurarTramite(fecha, idBandejaActoTramite, idDocumentoVersiones, idActoTramiteCaso);
      }
      /**else {
        this.informarQueNoSePuedeEditar()
      }**/
    } else {
      this.exeRestaurarTramite(fecha, idBandejaActoTramite, idDocumentoVersiones, idActoTramiteCaso);
    }
  }

  private exeRestaurarTramite(fecha: string,
    idBandejaActoTramite: string,
    idDocumentoVersiones: string,
    idActoTramiteCaso: string): void {
    //
    this.fechaFormateada =
      this.reusableHistorialTramiteService.formatearFechaconHoras(fecha);
    //
    const rsDialogo = this.modalDialogService.warning(
      'RESTAURAR VERSIÓN',
      `Esta opción únicamente restaura la versión del documento generado el <b>${this.fechaFormateada}</b> Y envía el trámite a la bandeja de “Pendiente para revisar”. Si es que existen firmas posteriores a esta versión, estas se perderán. ¿Desea continuar?`,
      'Restaurar',
      true,
      'Cancelar'
    );
    //
    rsDialogo.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          this.reusableHistorialTramiteService
            .restaurarTramite({
              idBandejaActoTramite: idBandejaActoTramite,
              idDocumentoVersiones: idDocumentoVersiones,
              idActoTramiteCaso: idActoTramiteCaso,
            })
            .subscribe((_) => {
              this.cerrarModal();
              let url: string = 'pendientes-para-revisar';
              this.router.navigate([`app/bandeja-tramites/${url}`]).then(() => {
                window.location.reload();
              });
              /**this.loadListaHistorialTramite();**/
            });
          //
          setTimeout(() => {
            this.restaurarTramiteResultado();
          }, 200);
        }
      },
    });
  }

  private restaurarTramiteResultado() {
    this.modalDialogService.success(
      'VERSIÓN RESTAURADA',
      `Se restauró la versión de la fecha <b>${this.fechaFormateada}</b> correctamente`,
      'Aceptar'
    );
  }

  private async validarCondiciones(idActoTramiteCaso: string) {
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.suscripciones.push(
        this.editarTramiteService
          .validarCondiciones(idActoTramiteCaso)//31365DCE668A41B8E0650250569D508A
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

  private informarQueNoSePuedeEditar(): void {
    const mensajeOriginal: string = this.errorValidacion!.message;
    const mensaje: string = this.reemplazarPorRestaurar(mensajeOriginal);

    if (mensaje.includes('se encuentra en proceso de notificación y tiene cédulas(s) generada(s)')) {
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

  private reemplazarPorRestaurar(texto: string): string {
    return texto.replace(/tramite/gi, "revertir").replace(/editado/gi, "revertido");;
  }

  get obtenerTitulo(): string {
    return `${this.titulo} ${this.tramite}`;
  }

  private obtenerSubTitulo(): void {
    const subTituloHtml = `Caso: ${this.stringUtil.obtenerNumeroCaso(
      this.numeroCaso
    )}`;
    this.subTituloModal =
      this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  public cerrarModal(): void {
    this.referenciaModal.close();
  }

  capitalizeWords(value: string): string {
    if (!value) return value;
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Función para formatear la hora sin espacio entre "p.m." o "a.m."
  formatHoraSinEspacio(fechaString: string): string {
    // Convertimos la cadena de fecha a un objeto Date
    const fecha = new Date(fechaString);

    // Formatear el día, mes y año
    const dia = fecha.getDate();
    const mes = fecha.toLocaleString('es-ES', { month: 'long' });
    const anio = fecha.getFullYear();

    // Formatear la hora (12 horas) y minutos
    let horas = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, '0');

    // Convertir a formato 12 horas
    const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
    horas = horas % 12;
    horas = horas ?? 12;  // El 0 en formato 12 horas es 12

    // Crear la hora final con el formato "hh:mm a.m./p.m."
    const horaFormateada = `${horas}:${minutos} ${ampm}`;

    // Retornar la fecha completa formateada
    return `${dia} ${mes} de ${anio} ${horaFormateada}`;
  }

}
