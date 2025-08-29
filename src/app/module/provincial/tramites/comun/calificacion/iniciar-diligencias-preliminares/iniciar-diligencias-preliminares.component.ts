import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CmpLibModule } from 'dist/cmp-lib';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { TramiteProcesal } from '@interfaces/comunes/tramiteProcesal';
import { IniciarDiligenciaPreliminarService } from '@services/provincial/tramites/iniciar-diligencia-preliminar.service';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';
import { ESTADO_REGISTRO, IconAsset, icono } from 'dist/ngx-cfng-core-lib';
import {
  Observable,
  firstValueFrom,
  Subscription,
  throwError,
  map,
  catchError,
  tap,
  takeUntil,
  Subject,
} from 'rxjs';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import { AlertaFormulario } from '@interfaces/comunes/alerta-formulario.interface';
import { DiligenciaPreliminar } from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import { RegistrarPlazoRequest } from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component';
import { CheckboxModule } from 'primeng/checkbox';
import { Expediente } from '@utils/expediente';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { Router } from '@angular/router';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import {
  ESPECIALIDAD_LAVADO_ACTIVOS,
} from 'ngx-cfng-core-lib';
import { TokenService } from '@core/services/shared/token.service';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogModule,
  NgxCfngCoreModalDialogService,
} from 'dist/ngx-cfng-core-modal/dialog';
import { AsociarSujetosDelitosComponent } from '@core/components/reutilizable/asociar-sujetos-delitos/asociar-sujetos-delitos.component'
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants';
import { AlertaService } from '@core/services/shared/alerta.service';
import { ID_ETAPA } from '@core/constants/menu';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';

@Component({
  selector: 'app-iniciar-diligencias-preliminares',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    ReactiveFormsModule,
    CmpLibModule,
    AlertasTramiteComponent,
    ButtonModule,
    NgxCfngCoreModalDialogModule,
    AsociarSujetosDelitosComponent
  ],
  providers: [DialogService],
  templateUrl: './iniciar-diligencias-preliminares.component.html',
  styleUrls: ['./iniciar-diligencias-preliminares.component.scss'],
})
export class IniciarDiligenciasPreliminaresComponent implements OnInit, OnDestroy {

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() validacionTramite!: ValidacionTramite;
  @Input() idEstadoTramite!: number;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() iniTramiteCreado: boolean = false;

  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  protected subscriptions: Subscription[] = [];
  protected usuario: any;
  public alertas: AlertaFormulario[] = [];
  public casoFiscal: Expediente | null = null;
  protected diligenciaPreliminar: DiligenciaPreliminar | null = null;
  protected plazoRequest: RegistrarPlazoRequest | null = null;
  protected esCasoReservadoInicial: boolean = false;
  protected seHanRegistradoAsociaciones: boolean = false
  protected formRegistro: FormGroup = new FormGroup({
    esCasoReservado: new FormControl(false)
  });

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  protected fb = inject(FormBuilder)
  protected dialogService = inject(DialogService)
  protected tramiteService = inject(TramiteService)
  protected reusablesAlertas = inject(ReusablesAlertas)
  protected gestionCasoService = inject(GestionCasoService)
  protected router = inject(Router)
  protected diligenciasService = inject(IniciarDiligenciaPreliminarService)
  private readonly tokenService = inject(TokenService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly alertaService = inject(AlertaService)
  protected iconAsset = inject(IconAsset)
  private readonly desuscribir$ = new Subject<void>();
  protected bloquearFormulario: boolean = false
  private readonly casoService = inject(Casos)

  get esFiscaliaLavadoActivos(): boolean {
    return ESPECIALIDAD_LAVADO_ACTIVOS === this.usuario.usuario.codEspecialidad
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  ngOnInit(): void {
    //resuleve las alertas del caso
    this.resolverAlertas();

    this.usuario = this.tokenService.getDecoded();
    !this.tramiteEstadoFirmado && this.modalInicial();
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());
    this.cargarAlertas();
    this.getCasoFiscal();
    this.firmaRealizada();
  }

  resolverAlertas() {
    if (this.iniTramiteCreado && (this.idEtapa==ID_ETAPA.CALIFICACION)) {
      this.solucionarAlerta();
    }
  }

  solucionarAlerta(): void {
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

  protected firmaRealizada(): void {
    this.firmaIndividualService.esFirmadoCompartidoObservable
      .pipe(takeUntil(this.desuscribir$))
      .subscribe((respuesta: any) => {
        if (respuesta.esFirmado) {
          this.registrarAlertas();
          this.bloquearFormulario = true
        }
      });
  }

  private async cargarAlertas(): Promise<void> {
    const validaciones = [
      this.reusablesAlertas.obtenerAlertaSujetosProcesalesDebidamenteRegistrados(this.idCaso),
      this.reusablesAlertas.obtenerAlertaFaltaTipificarDelito(this.idCaso),
    ];
    const resultados = await Promise.allSettled(
      validaciones.map((validacion) => firstValueFrom(validacion))
    );

    this.alertas = [...this.alertas, ...obtenerAlertasDeArchivo(resultados)];
    this.obtenerDiligencia();
  }

  getCasoFiscal(): void {
    this.casoFiscal = this.gestionCasoService.expedienteActual;
  }

  private guardarFormulario(): Observable<any> {
    const plazosRequest = this.diligenciaPreliminar?.plazosRequest;
    const nroPlazo = plazosRequest?.nroPlazo;

    if (!plazosRequest || nroPlazo === 0) {
      this.modalDialogService.error(
        'Plazo',
        'Debe asignar un plazo.',
        'Aceptar'
      );
      return throwError(() => new Error('Falta completar los datos del causal'));
    }

    if (!this.diligenciaPreliminar) {
      return throwError(() => new Error('Falta completar los datos de la diligencia'));
    }

    return this.diligenciasService.procesarDiligenciaPreliminar(this.diligenciaPreliminar).pipe(
      tap(() => {
        this.modalDialogService.success(
          'Datos guardados correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        );
        if (this.formularioValido) {
          this.habilitarFirma();
        }
      }),
      map(() => 'válido'),
      catchError(() => {
        this.modalDialogService.error(
          'Error',
          'No se pudo guardar la información para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        );
        return throwError(() => new Error('Error al guardar.'));
      })
    );
  }

  public habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  public obtenerDiligencia(): void {
    this.subscriptions.push(
      this.diligenciasService
        .obtenerDiligenciaPreliminar(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.obtenerDetalleActoTramiteCaso()
            if (resp) {
              this.diligenciaPreliminar = resp;
              this.esCasoReservadoInicial = this.diligenciaPreliminar!.flCasoReservado;
              this.formRegistro.get('esCasoReservado')?.setValue(this.diligenciaPreliminar?.flCasoReservado);
              this.plazoRequest = this.diligenciaPreliminar!.plazosRequest;
              this.plazoRequest.esEditado = false;
              this.formularioEditado(this.diligenciaPreliminar?.plazosRequest == null || !this.formularioValido);
              this.habilitarGuardar(this.formularioValido);
            }
          },
          error: (error) => {
            this.modalDialogService.error("Error en el servicio", error.error.messagge, 'Aceptar');
          },
        })
    );
  }

  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso( this.idActoTramiteCaso )
      .subscribe({
        next: (resp: any) => {
          if ( resp.idEstadoTramite === ESTADO_REGISTRO.FIRMADO ) {
            this.bloquearFormulario = true
          }
        }
    })
  }

  public mostrarModal(): void {
    const ref = this.dialogService.open(RegistrarPlazoComponent, {
      showHeader: false,
      width: '60rem',
      data: {
        idCaso: this.idCaso,
        calificarCaso: this.casoFiscal,
        idTramite: this.tramiteSeleccionado?.idTramite,
        idActoProcesal: this.tramiteSeleccionado!.idActoTramiteConfigura,
        idActoTramiteEstado: this.tramiteSeleccionado!.idActoTramiteEstado,
        plazos: this.diligenciaPreliminar?.plazosRequest,
        bloquearFormulario: this.bloquearFormulario,
      },
    });

    ref.onClose.subscribe((data) => {
      if (data) {
        this.plazoRequest = data;
        this.alSeleccionar();
      }
    });
  }

  public modalInicial(): void {
    const dialog = this.modalDialogService.warning(
      'Atención',
      `¿Los sujetos procesales y la tipifación del delito están correctamente registrados?. En caso requiera verificar ir a la sección de <strong>sujetos procesales,</strong> de lo contrario continúe con el trámite.`,
      'Continuar',
      true,
      'Ir a sujetos procesales'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Cancelado) {
          this.router.navigateByUrl(`/app/administracion-casos/consultar-casos-fiscales/calificacion/caso/${this.idCaso}/sujeto`);
        }
      },
    });
  }

  public alSeleccionar(): void {
    this.diligenciaPreliminar = {
      plazosRequest: this.plazoRequest!,
      flCasoReservado: this.formRegistro.get('esCasoReservado')!.value,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
    };

    if (this.plazoRequest === null || this.plazoRequest === undefined) {
      this.formularioEditado(true);
      this.habilitarGuardar(false);
      return;
    }

    if (this.plazoRequest?.esEditado || (this.esCasoReservadoInicial !== this.diligenciaPreliminar.flCasoReservado)) {
      this.formularioEditado(true);
    } else {
      this.formularioEditado(false);
    }
    this.habilitarGuardar(this.formularioValido);
  }

  public icono(name: string): string {
    return icono(name);
  }

  get formularioValido(): boolean {
    const { nroPlazo } = this.plazoRequest ?? {};
    return this.alertas?.length === 0 && nroPlazo! > 0 && this.seHanRegistradoAsociaciones;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((suscripcion) => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  protected establecerSiSeHanRegistradoAsociaciones(valor: boolean): void {
    this.seHanRegistradoAsociaciones = valor
    this.alSeleccionar()
  }

  private registrarAlertas(): void {
    const request: AlertaGeneralRequestDTO = {
      idCaso: this.idCaso,
      numeroCaso: this.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_DP,
      idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
      destino: CodigoDestinoAlertaTramiteEnum.PROV_FISCAL_ASIGNADO
    };
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

}
