import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { RegistrarPlazoRequest } from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom, Observable, Subject, Subscription, takeUntil, throwError } from 'rxjs';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { FormalizarPreparatoria } from '@interfaces/provincial/tramites/comun/preliminar/formalizar-preparatoria.interface';
import { FormalizacinPreparatoriaService } from '@services/provincial/tramites/formalizar-preparatoria.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { Router } from '@angular/router';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { catchError, map, tap } from 'rxjs/operators';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { AsociarSujetosDelitosComponent } from '@core/components/reutilizable/asociar-sujetos-delitos/asociar-sujetos-delitos.component'
import { ESTADO_REGISTRO, IconAsset } from 'dist/ngx-cfng-core-lib';
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants';
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { AlertaService } from '@core/services/shared/alerta.service';
import { ID_ETAPA } from '@core/constants/menu';
import { TokenService } from '@core/services/shared/token.service';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
@Component({
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    CheckboxModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    MenuModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    AlertasTramiteComponent,
    AsociarSujetosDelitosComponent
  ],
  selector: 'app-formalizacion-investigacion-preparatoria',
  templateUrl: './formalizacion-investigacion-preparatoria.component.html',
  styleUrls: ['./formalizacion-investigacion-preparatoria.component.scss'],
  providers: [ DialogService, NgxCfngCoreModalDialogService ],
})
export class FormalizacionInvestigacionPreparatoriaComponent implements OnInit {

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso!: string;
  @Input() idEstadoTramite!: number;
  @Input() deshabilitado: boolean = false;
  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>();
  @Input() iniTramiteCreado: boolean = false;

  protected seHanRegistradoAsociaciones: boolean = false
  public subscriptions: Subscription[] = [];
  public alertas: AlertaFormulario[] = [];
  public casoFiscal: Expediente | null = null;
  public plazoRequest: RegistrarPlazoRequest | null = null;
  private formalizarPreparatoria: FormalizarPreparatoria | null = null;
  private readonly desuscribir$ = new Subject<void>();
  private informacionCasoInicial: string = '';
  protected iconAsset = inject(IconAsset)
  private readonly router = inject(Router)
  private readonly dialogService = inject(DialogService)
  private readonly tramiteService = inject(TramiteService)
  private readonly reusablesAlertas = inject(ReusablesAlertas)
  private readonly gestionCasoService = inject(GestionCasoService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly formalizacinPreparatoriaService = inject(FormalizacinPreparatoriaService)
  private readonly alertaService = inject(AlertaService);
  private readonly tokenService = inject(TokenService);
  private readonly casoService = inject(Casos)
  protected bloquearFormulario: boolean = false

  ngOnInit(): void {
    //resuleve las alertas del caso
    this.resolverAlertas();

    !this.tramiteEstadoFirmado && this.modalInicial();
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());
    this.cargarAlertas();
    this.getCasoFiscal();
    this.firmaRealizada();
  }

  private getCasoFiscal(): void {
    this.casoFiscal = this.gestionCasoService.expedienteActual;
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

  resolverAlertas() {
      if (this.iniTramiteCreado && (this.idEtapa == ID_ETAPA.PRELIMINAR)) {
        this.solucionarAlerta();
      }
    }

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

  ngOnDestroy(): void {
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  get formularioValido(): boolean {
    const { nroPlazo } = this.plazoRequest ?? {};
    return this.alertas?.length === 0 && nroPlazo! > 0 && this.seHanRegistradoAsociaciones;
  }

  get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected alSeleccionar(): void {
    this.formalizarPreparatoria = {
      plazosRequest: this.plazoRequest!,
      idCaso: this.idCaso,
      numeroCaso: this.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
    };

    if(this.plazoRequest === null){
      this.formularioEditado(true);
      this.habilitarGuardar(false);
      return;
    }

    this.establecerBotonesTramiteSiCambio();
  }

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.formalizarPreparatoria)
  }

  private establecerBotonesTramiteSiCambio(): void {
    const cambio = this.elFormularioHaCambiado()
    if ( cambio ) {
      this.formularioEditado(true)
      this.habilitarGuardar(this.formularioValido)
    } else if ( this.formularioValido) {
       this.habilitarFirma()
    } else {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

  private obtenerFormulario(): void {
    this.subscriptions.push(
      this.formalizacinPreparatoriaService
        .obtenerInfoFormalizacion(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.obtenerDetalleActoTramiteCaso()
            if (resp) {
              this.formalizarPreparatoria = resp;
              this.informacionCasoInicial = JSON.stringify(resp);
              this.plazoRequest = this.formalizarPreparatoria!.plazosRequest;
              this.plazoRequest.esEditado = false;
              this.formularioEditado(this.formalizarPreparatoria?.plazosRequest == null || !this.formularioValido);
              this.habilitarGuardar(this.formularioValido);
            }
          },
          error: (error) => {
            this.modalDialogService.error("Error en el servicio",error.error.messagge,'Acpetar');
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

  private async cargarAlertas(): Promise<void> {
    const validaciones = [
      this.reusablesAlertas.obtenerAlertaSujetosProcesalesDebidamenteRegistrados(this.idCaso),
      this.reusablesAlertas.obtenerAlertaFaltaTipificarDelito(this.idCaso),
    ];
    const resultados = await Promise.allSettled(
      validaciones.map((validacion) => firstValueFrom(validacion))
    );

    this.alertas = [...this.alertas, ...obtenerAlertasDeArchivo(resultados)];
    this.obtenerFormulario();
  }

  private registrarAlertas(): void {
    const request: AlertaGeneralRequestDTO = {
      idCaso: this.idCaso,
      numeroCaso: this.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_FI,
      idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
      destino: CodigoDestinoAlertaTramiteEnum.PROV_FISCAL_ASIGNADO
    };
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  protected modalInicial(): void {
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

  public mostrarModal(): void {
    const ref = this.dialogService.open(RegistrarPlazoComponent, {
      showHeader: false,
      width: '60rem',
      data: {
        idCaso: this.idCaso,
        calificarCaso: this.casoFiscal,
        idTramite: this.tramiteSeleccionado!.idTramite,
        idActoProcesal: this.tramiteSeleccionado!.idActoTramiteConfigura,
        plazos: this.formalizarPreparatoria?.plazosRequest,
        bloquearFormulario: this.bloquearFormulario,
      },
    });

    ref.onClose.subscribe((data) => {
      this.plazoRequest = data;
      this.alSeleccionar();
    });
  }

  private guardarFormulario(): Observable<any> {
    const plazosRequest = this.formalizarPreparatoria?.plazosRequest;
    const nroPlazo = plazosRequest?.nroPlazo;

    if (!plazosRequest || nroPlazo === 0) {
      this.modalDialogService.error(
        'Plazo',
        'Debe asignar un plazo.',
        'Aceptar'
      );
      return throwError(() => new Error('Falta completar los datos del causal'));
    }

    if (!this.formalizarPreparatoria) {
      return throwError(() => new Error('Falta completar los datos de la diligencia'));
    }

    return this.formalizacinPreparatoriaService.registraFormalizacion(this.formalizarPreparatoria).pipe(
      tap(() => {
        this.modalDialogService.success(
          'Datos guardados correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        )
        this.informacionCasoInicial = JSON.stringify(this.formalizarPreparatoria)
        this.habilitarFirma()
      }),
      map(() => 'válido'),
      catchError(() => {
        this.modalDialogService.error(
          'Error',
          'No se pudo guardar la información para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        )
        return throwError(() => new Error('Error al guardar'))
      })
    )
  }

  public habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  protected establecerSiSeHanRegistradoAsociaciones(valor: boolean): void {
    this.seHanRegistradoAsociaciones = valor
    this.alSeleccionar()
  }

}
