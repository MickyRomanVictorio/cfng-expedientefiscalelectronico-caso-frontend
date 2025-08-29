import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import { CAUSALES_ARCHIVO } from '@constants/constants';
import { ID_ETAPA } from '@core/constants/menu';
import { Alerta } from '@core/interfaces/comunes/alerta';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { CasillaSeleccionable } from '@core/interfaces/comunes/casillas-seleccionables.interface';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { AlertaService } from '@core/services/shared/alerta.service';
import { TokenService } from '@core/services/shared/token.service';
import { capitalizedFirstWord } from '@core/utils/string';
import { ActualizarCausales } from '@interfaces/provincial/tramites/comun/calificacion/archivar-caso/actualizar-causales.interface';
import { NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { ArchivarCasoService } from '@services/provincial/tramites/comun/calificacion/archivar-caso/archivar-caso.service';
import { TramiteService } from "@services/provincial/tramites/tramite.service";
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';
import { ESTADO_REGISTRO, ETAPA } from 'ngx-cfng-core-lib';
import { CheckboxModule } from 'primeng/checkbox';
import { catchError, firstValueFrom, map, Observable, Subject, Subscription, takeUntil, tap, throwError } from 'rxjs';
import { AsociarSujetosDelitosComponent } from "../../../../../../core/components/reutilizable/asociar-sujetos-delitos/asociar-sujetos-delitos.component";

@Component({
  selector: 'app-archivar-caso',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AlertasTramiteComponent,
    CheckboxModule,
    NgxCfngCoreModalDialogModule,
    AsociarSujetosDelitosComponent
  ],
  templateUrl: './archivar-caso.component.html',
  styleUrls: ['./archivar-caso.component.scss'],
})
export class ArchivarCasoComponent implements OnInit {

  @Input() idCaso: string = '';//Id del caso
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';//Nombre de la etapa
  @Input() idEtapa: string = '';//Id de la etapa
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() idActoTramiteCaso!: string;
  @Input() idEstadoTramite!: number;
  @Input() iniTramiteCreado: boolean = false;
  @Output() peticionParaEjecutar = new EventEmitter<() => any>();
  /**@Output() ocultarTitulo = new EventEmitter<boolean>();
  @Output() ocultarTramiteIniciado = new EventEmitter<boolean>();**/

  private readonly desuscribir$ = new Subject<void>();

  public alertas: AlertaFormulario[] = [];
  public causales: CasillaSeleccionable[] = [];
  public causalesSeleccionadas: CasillaSeleccionable[] = [];
  public causalesSeleccionadasIniciales: CasillaSeleccionable[] = [];
  private readonly suscripciones: Subscription[] = [];
  protected desactivarFormulario: boolean = false;
  protected seHanRegistradoAsociaciones: boolean = false;
  /**public alertaMostrada: boolean = false;**/

  constructor(
    private readonly reusablesAlertas: ReusablesAlertas,
    private readonly archivarCasoService: ArchivarCasoService,
    protected tramiteService: TramiteService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly tokenService: TokenService,
    private readonly alertaService: AlertaService,
  ) { }

  async ngOnInit(): Promise<void> {
    //resuleve las alertas del caso
    this.resolverAlertas();

    //Carga de datos iniciales
    this.causales = [...CAUSALES_ARCHIVO];
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());
    //
    await this.obtenerAlertas();
    this.obtenerCausalesArchivamiento();
  }

  resolverAlertas() {
    if (this.iniTramiteCreado && (this.idEtapa == ID_ETAPA.CALIFICACION || this.idEtapa == ID_ETAPA.PRELIMINAR)) {
      this.solucionarAlerta();
    }
  }

  /**async ngOnInit(): Promise<void> {
    console.log('this.validacionCompleta = ', this.tramiteService.validacionCompleta);
    this.alertaMostrada = this.tramiteService.validacionCompleta;
    if (this.alertaMostrada) {

      this.ocultarTramiteIniciado.emit(true);
      this.tramiteService.verEditor = true;
      await this.initializarOk();
    
    } else {
      await this.validarInitializar();
    }
  }**/

  /**private async validarInitializar(): Promise<void> {
    this.suscripciones.push(
      this.reusablesAlertas.obtenerAlertaEscritosSinAtender(this.idCaso).subscribe({
        next: (resp) => {
          console.log('Respuesta exitosa:', resp);
          if(resp === 'VALIDADO'){
            console.log('entro VALIDADO')
            this.tramiteService.validacionCompleta = true;
            //this.alertaMostrada = false;
            this.ocultarTitulo.emit(false);
            this.tramiteService.verIniciarTramite = true;
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.error) {
            //this.alertaMostrada = false;
            this.ocultarTitulo.emit(false);
            try {
              const data = JSON.parse(err.error);
              const escritosSinAtender: number = Number(data.message.split('::')[1]);
              const texto: string = `Este trámite no puede ser creado porque existe <b>${escritosSinAtender}</b><br/> escrito(s), relacionados a este caso, sin atender. Por favor<br/> revíselo para poder crear el trámite. <a href="/app/documentos-ingresados" style="text-decoration: underline; color: #d9a927">Revisar bandeja</a>`;
              this.mensajeInfo('warning', 'TRÁMITE NO DISPONIBLE', texto, 'Aceptar');
            } catch (e) {
              this.mensajeInfo('error', 'Error inesperado', 'No se pudo interpretar el mensaje del servidor.', 'Aceptar');
            }
          }
        }
      })
    );
  }**/

  /**async initializarOk() {
    //resuleve las alertas del caso
    this.resolverAlertas();

    //Carga de datos iniciales
    this.causales = [...CAUSALES_ARCHIVO];
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());
 
    await this.obtenerAlertas();
    this.obtenerCausalesArchivamiento();
  }**/

  solucionarAlerta(): void {
    console.log('numeroCaso = ', this.numeroCaso);
    console.log('codDespacho = ', this.tokenService.getDecoded().usuario.codDespacho);
    console.log('usuario = ', this.tokenService.getDecoded().usuario.usuario);

    const alerta: Alerta = {
      codigoCaso: this.numeroCaso,
      codigoDespacho: this.tokenService.getDecoded().usuario.codDespacho,
      fechaCreacion: '',
      codigoUsuarioDestino: this.tokenService.getDecoded().usuario.usuario,
      texto: '',
      idAsignado: this.tokenService.getDecoded().usuario.usuario
    }
    this.alertaService
      .solucionarAlerta(alerta)
      .pipe(takeUntil(this.desuscribir$))
  }

  private async obtenerAlertas(): Promise<void> {
    const validaciones = [
      this.reusablesAlertas.obtenerAlertaSujetosProcesalesDebidamenteRegistrados(this.idCaso),
      /**this.reusablesAlertas.obtenerAlertaEscritosSinAtender(this.idCaso),**/
      this.reusablesAlertas.obtenerAlertaFaltaTipificarDelito(this.idCaso),
      this.reusablesAlertas.obtenerAlertaExistenNotificacionesPendientes(this.idCaso)
    ];
    const resultados = await Promise.allSettled(
      validaciones.map((validacion) => firstValueFrom(validacion))
    );
    this.alertas = obtenerAlertasDeArchivo(resultados);
  }

  public obtenerCausalesArchivamiento(): void {
    this.suscripciones.push(
      this.archivarCasoService.obtenerCausalesArchivamiento(this.etapa, this.idActoTramiteCaso).subscribe({
        next: (resp) => {
          const causalesMap = {
            hechoNoConstituye: CAUSALES_ARCHIVO[0],
            extincionAccionPenal: CAUSALES_ARCHIVO[1],
            noJustificable: CAUSALES_ARCHIVO[2],
          };
          this.causalesSeleccionadas = Object.entries(causalesMap).filter(([key]) => resp[key] === '1').map(([, value]) => value);
          //
          this.validarHabilitarGuardar();
        },
        error: () => {
          this.modalDialogService.error('Error', 'No se puede obtener los datos causales', 'Aceptar');
        },
      })
    );
  }

  private guardarFormulario(): Observable<any> {
    if (!this.causalesSeleccionadas.length) {
      this.modalDialogService.error('Causales', 'Debe seleccionar al menos un causal de archivamiento.', 'Aceptar');
      return throwError(() => new Error('Falta completar los datos del causal'));
    }
    const actualizarCausales: ActualizarCausales = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      etapa: this.etapa,
      hechoNoConstituye: this.tieneCausal(1),
      extincionAccionPenal: this.tieneCausal(2),
      noJustificable: this.tieneCausal(3),
    };
    return this.archivarCasoService.actualizarCausalesArchivamiento(actualizarCausales).pipe(
      tap(() => {
        this.tramiteService.formularioEditado = false;
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
        return throwError(() => new Error('Error al guardar.'));
      })
    );
  }

  private tieneCausal(id: number): '1' | '0' {
    return this.causalesSeleccionadas.some(c => c.id === id) ? '1' : '0';
  }

  protected eventoSeleccionarCausal(e: any) {
    this.validarHabilitarGuardar();
  }

  private validarHabilitarGuardar() {
    if (this.causalesSeleccionadas.length > 0 && this.alertas.length === 0 && this.seHanRegistradoAsociaciones) {
      this.formularioEditado(true);
      this.habilitarGuardar(true);
    } else {
      this.formularioEditado(true);
      this.habilitarGuardar(false);
    }
    //
    this.desactivarFormulario = (+this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO || this.alertas.length > 0);
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }
  protected verificarDesactivarFormulario(): void {
    if (+this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO) {
      this.desactivarFormulario = true;
      return;
    }
    this.desactivarFormulario = this.tramiteService.tramiteEnModoVisor;
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  protected establecerSiSeHanRegistradoAsociaciones(valor: boolean): void {
    this.seHanRegistradoAsociaciones = valor;
    this.validarHabilitarGuardar();
  }

}
