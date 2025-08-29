import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { obtenerIcono } from '@utils/icon';
import { Subscription } from 'rxjs';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service';
@Component({
  selector: 'app-default-tramite',
  standalone: true,
  imports: [CommonModule],
  providers: [DialogService, NgxCfngCoreModalDialogService],
  templateUrl: './default-tramite.component.html',
  styleUrls: ['./default-tramite.component.scss'],
})
export class DefaultTramiteComponent implements OnInit, OnDestroy {
  /**
   * Variables de entrada
   * Estas variables se instancian desde el componente ActoProcesalComponent. (Usar solo las necesarias)
   *
   * idEstadoTramite -> Valor que almacena el estado del registro del trámite, Está asociado al enums ESTADO_REGISTRO.
   * idActoTramiteCaso -> Valor que almacena el id del acto trámite caso generado al iniciar el tramite.
   * tramiteEnModoEdicion -> Valor que indica si el trámite esta en modo edición.
   * deshabilitado -> Valor que indica que el trámite ya se firmo
   * tramiteSeleccionado -> Información del trámite que esta seleccionado
   *    nombreTramite -> Valor que almacena el nombre del trámite.
   *    idActoTramiteEstado -> Valor que almacena el id acto trámite estado.
   *    idTramite -> Valor que almacena el id trámite.
   * validacionTramite -> Información de la validación del trámite seleccionado.
   *    tipoInicio -> Valor que almacena el tipo de trámite, Está asociado al enums TIPO_INICIO_TRAMITE.
   *    tipoOrigenTramiteSeleccionado -> Valor que almacena donde se creo el trámite en caso de un MIXTO, Está asociado al enums ID_TIPO_ORIGEN.
   **/
  @Input() idCaso!: string;
  @Input() numeroCaso!: string;
  @Input() idEtapa!: string;
  @Input() etapa!: string;
  @Input() idEstadoTramite!: number;
  @Input() idActoTramiteCaso!: string;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() deshabilitado: boolean = false;
  @Input() tramiteSeleccionado!: TramiteProcesal;
  @Input() validacionTramite!: ValidacionTramite;

  /**
   * Variables de salida
   * Estas variables permiten ejecutar acciones en el componente ActoProcesalComponent.
   *
   * peticionParaEjecutar -> Evento que ejecuta la función de guardar los datos del formulario antes de la firma. Solo para trámites MIXTOS o GENERADOS.
   * ocultarTitulo -> Evento que oculta el título.
   **/
  @Output() peticionParaEjecutar = new EventEmitter<() => any>();
  @Output() ocultarTitulo = new EventEmitter<boolean>();

  constructor(
    protected tramiteService: TramiteService,
    protected firmaIndividualService: FirmaIndividualService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {}

  public obtenerIcono = obtenerIcono;
  private readonly suscripciones: Subscription[] = [];

  /**
   * Método que permite indicar si el trámite fue editado.
   *  - Solo para trámites MIXTOS o GENERADOS.
   *  - Por defecto el botón se inicializa como true.
   *  - Cuando el valor es true se muestra el botón GUARDAR.
   *  - Cuando el valor es false se muestra el botón FIRMAR.
   *  - En caso el trámite tenga información y esta este completa con los datos obligatorios el valor debe establecerse como false.
   *  - En caso el trámite no tenga información o la información no este completa con los datos obligatorios el valor debe establecerse como true.
   *  - En caso se detecten cambios en el trámite el valor debe establecerse como true.
   **/

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  /**
   * Método que habilita o deshabilita el botón GUARDAR
   *  - Solo para trámites MIXTOS o GENERADOS.
   *  - Por defecto el botón se inicializa como deshabilitado.
   *  - Se debe validar que hubo cambios en el formulario para habilitar el boton GUARDAR.
   *  - Mientras no se detecten cambios se debe mantener el boton GUARDAR deshabilitado.
   **/
  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  ngOnInit(): void {
    this.formularioEditado(false);
    /**
     *  Evento
     *  - Sirve para ejecutar la función que guarda los datos del trámite.
     *  - Obligatorio para trámites MIXTOS y GENERADOS.
     *
        this.peticionParaEjecutar.emit(() => this.guardarFormulario());
     **/

    /**
     * Al inicializar el componente, se registra la función de validación `validarFirma`
     * en el servicio de validación de firma.
     *
     * this.firmaIndividualService.inicializarValidacion(this.validarFirma);
     */
  }

  /**
   *  Función guardar formulario
   *  - Permite guardar los datos del trámite.
   *  - Obligatorio para trámites MIXTOS y GENERADOS.
   *  - Una ves que el componente ActoProcesalComponent ejecuta la función correctamente dentro del formulario se debe cambiar al boton FIRMAR.
   *  - La función guardarFormularioDefault debe guardar los datos del trámite y mantener el estado del trámite en BORRADOR.
   *    - tramiteDefaultService -> Debe ser reemplazado por el servicio asociado al tramite.
   *    - guardarFormularioDefault -> Debe ser reemplazado por el nombre de la función que realiza el guardado.
   *    - request -> Debe ser reemplazado por la información del trámite
   *
      protected guardarFormulario(): Observable<any> {
        return this.tramiteDefaultService.guardarFormularioDefault(request)
        .pipe(
          tap(() => {
          this.formularioEditado(false) //cambia el boton a FIRMAR
            this.modalDialogService.success(
              'Datos guardado correctamente',
              'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
              'Aceptar'
            );
          }),
          map(() => 'válido'),
            catchError(() => {
               this.modalDialogService.error(
              'Error',
              'No se pudo guardar la información para el trámite: <b>' + this.nombreTramite() + '</b>.',
              'Aceptar'
            );
            return throwError(() => new Error('Error al guardar'));
          })
        );
      }
   **/

  /**
   * Función de validación que abre un diálogo de confirmación para validar la firma.
   * Esta función se pasa al servicio como lógica personalizada para ejecutar antes de una firma.
   *
   * @returns `Observable<boolean>` que emite `true` si el usuario confirma, `false` si cancela,
   *          y `true` por defecto para otros casos.
   *
   * public validarFirma = (): Observable<boolean> => {
   *     const confirmar = this.dialogService.open(AlertaModalComponent, {
   *       width: '600px',
   *       showHeader: false,
   *       data: {
   *         icon: 'warning',
   *         title: 'Validación',
   *         description: 'validar firma',
   *         confirmButtonText: 'Aceptar',
   *         cancelButtonText: 'Cancelar',
   *         confirm: true,
   *       },
   *     } as DynamicDialogConfig<AlertaData>);
   *
   *     return confirmar.onClose.pipe(
   *       concatMap(resp => {
   *         if (resp === 'confirm') {
   *           return of(true);
   *         }
   *         else if (resp === 'cancel') {
   *           return of(false);
   *         }
   *         else return of(true);
   *       }));
   * }
   *
   */

  /**
   *  Tener en cuenta!
   *  - Es necesario configurar el tramite para que se pueda cargar automaticamente en la tabla SISMAEST.EFTM_ACTO_TRAMITE_ESTADO campo NO_V_FORMULARIO
   *  - El botón de FIRMAR lo controla el componente del trámite.
   *  - Despues de ejecutar el firmado del documento se invoca a las CONSECUENCIAS del trámite y muestra los mensajes configurados.
   *  - Es necesario configurar los procedimientos almacenados de consecuencias en la tabla SISMAEST.EFTM_TRAMITE_CONFIGURACION con el ID_V_ACTO_TRAMITE_ESTADO.
   *  - Es necesario configurar el mensaje que debe mostrarse despues de la firma en la tabla SISMAEST.EFTP_MENSAJE_FIRMA_CONFIGURACION con el ID_V_ACTO_TRAMITE_ESTADO.
   **/

  /**
   *  Ejemplos:
   *  - Trámite GENERADO:
   *    - RequerimientoIncoacionProcesoInmediatoComponent
   *    - ID_V_ACTO_TRAMITE_ESTADO = 00000810100111010100057102000
   *  - Trámite RECIBIDO:
   *    - RegistrarAgendaNotificacionesComponent
   *    - ID_V_ACTO_TRAMITE_ESTADO = 00000810100112020700054816000
   *  - Trámite MIXTO:
   *    - RegistrarResolucionComponent
   *    - ID_V_ACTO_TRAMITE_ESTADO = 00000810100112020700004016000
   *  - Trámite GENERADO SIN FIRMAR:
   *    - SubsanarAutoResuelveApelacionSentenciaComponent
   *    - ID_V_ACTO_TRAMITE_ESTADO = 00000810100112020700003700000
   **/

  ngOnDestroy(): void {
    this.firmaIndividualService.limpiarValidacion();
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }
}
