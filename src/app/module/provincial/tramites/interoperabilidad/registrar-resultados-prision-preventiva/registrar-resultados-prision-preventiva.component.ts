import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms'
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';
import { IconUtil, MEDIDA_COERCION, RES_1ERA_INSTANCIA, CUADERNO_TIPO_MEDIDA, StringUtil, TIPO_MEDIDA_COERCION, UNIDAD_MEDIDA } from 'ngx-cfng-core-lib';
import { DropdownModule } from 'primeng/dropdown'
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect'
import { TooltipModule } from 'primeng/tooltip'
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from "primeng/checkbox";
import { CalendarModule } from 'primeng/calendar';
import { JsonPipe, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CatalogoInterface } from '@core/interfaces/comunes/catalogo-interface';
import { MaestroService } from '@core/services/shared/maestro.service';
import { Subscription } from 'rxjs';
import { ResolucionAutoResuelvePrisionPreventivaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-prision-preventiva.service';
import {
  DelitoSujetoProcesal,
  GrupoControlInterface,
  ResultadoPrisionPreventivaInterface,
  SujetoProcesal,
  SujetoResultadoPrisionPreventivaInterface
} from '@core/interfaces/comunes/AutoResuelvePrisionPreventivaRequest';
import { DigitOnlyModule } from '@directives/digit-only.module'
import { GenericResponseList } from '@core/interfaces/comunes/GenericResponse';
import { MaestroInterface } from '@core/interfaces/comunes/maestro-interface';
import { ListarResultadosPrisionPreventivaComponent } from './listar-resultados-prision-preventiva/listar-resultados-prision-preventiva.component';
import { CapitalizePipe } from '@core/pipes/capitalize.pipe';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';
import { GestionCasoService } from '@services/shared/gestion-caso.service';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { convertStringToDate } from '@utils/date';
@Component({
  selector: 'app-registrar-resultados-prision-preventiva',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    TooltipModule,
    RadioButtonModule,
    CheckboxModule,
    CalendarModule,
    NgClass,
    InputTextModule,
    InputTextareaModule,
    DigitOnlyModule,
    NgxCfngCoreModalDialogModule,
    ListarResultadosPrisionPreventivaComponent,
    CapitalizePipe,
    MensajeGenericoComponent,
    JsonPipe
  ],
  templateUrl: './registrar-resultados-prision-preventiva.component.html',
  styleUrl: './registrar-resultados-prision-preventiva.component.scss'
})
export class RegistrarResultadosPrisionPreventivaComponent implements OnInit, OnDestroy {

  @ViewChild('multiSelect') multiSelect!: MultiSelect

  protected readonly ref = inject(DynamicDialogRef);
  protected readonly config = inject(DynamicDialogConfig);
  protected readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  protected readonly iconUtil = inject(IconUtil);
  protected readonly stringUtil = inject(StringUtil);
  protected readonly casoService = inject(Casos);
  protected readonly maestroService = inject(MaestroService);
  protected readonly resolucionAutoResuelvePrisionPreventivaService = inject(ResolucionAutoResuelvePrisionPreventivaService);
  protected readonly gestionCasoService = inject(GestionCasoService);
  protected eventoActualizarTablaResultados: boolean = false;
  protected mensajeNoResultados: string = 'No se encontraron resultados'
  protected mensajeNoResultadosProlongado: string = 'No se encontraron resultados'
  protected mensajeNoResultadosAdecuacion: string = 'No se encontraron resultados'
  protected mensajeExcedePlazoOtorgado: string | null = null
  protected mensajeResultadoUnico: string = '';
  protected numeroCaso: string = ''
  protected idCaso: string = ''
  protected idCasoPadre: string = ''
  protected idActoTramiteCaso: string = ''
  protected tramiteEnModoEdicion: boolean = false;
  protected actualizar: boolean = false;
  protected prolongacion: boolean = false;
  protected cesacion: boolean = false;
  protected adecuacion: boolean = false;
  protected reo: boolean = false;
  protected existeResultadosRegistrados: boolean = false;
  protected fechaActual: Date = new Date();
  protected fechaHecho: Date | null = null;


  protected sujetosProcesales: SujetoProcesal[] = []
  protected delitosSujetoProcesal: DelitoSujetoProcesal[] = []
  protected unidadesMedida: MaestroInterface[] = []
  protected medidasCoercion: MaestroInterface[] = []
  protected medidasCoercionBK: MaestroInterface[] = []
  protected tipoResultados: CatalogoInterface[] = []
  protected tipoResultadosTodos: CatalogoInterface[] = []
  protected tipoMedidasCoercion: CatalogoInterface[] = []
  protected reglasConducta: MaestroInterface[] = []
  protected resultadosPrisionPreventiva: ResultadoPrisionPreventivaInterface[] = []
  protected resultadosPrisionPreventivaTodos: ResultadoPrisionPreventivaInterface[] = []
  private readonly subscriptions: Subscription[] = []
  protected longitudMaximaObservaciones: number = 200;
  protected formularioRespuestaPrision: FormGroup = new FormGroup({
    idActoTramiteResultadoSujetoPadre: new FormControl(null),
    idActoTramiteResultadoSujeto: new FormControl(null),
    idActoTramiteCaso: new FormControl(null, Validators.required),
    idTipoResultado: new FormControl(null, Validators.required),
    idSujetoCaso: new FormControl(null, Validators.required),
    idTipoParteSujeto: new FormControl(null, Validators.required),
    idDelitoSujeto: new FormControl([], Validators.required),
    reoAusenteContumaz: new FormControl(false),
    reoAusenteContumazNuevo: new FormControl(false),
    fechaInicio: new FormControl(null, Validators.required),
    fechaCese: new FormControl(null),
    fechaInicioCesacion: new FormControl(null),
    plazoOtorgado: new FormControl(null,[Validators.required, Validators.min(1)]),
    plazoProlongado: new FormControl(null),
    plazoCesacion: new FormControl(null),
    plazoAdecuacion: new FormControl(null),
    idUnidadMedida: new FormControl(null, Validators.required),
    idUnidadMedidaProlongado: new FormControl(null),
    idUnidadMedidaCesacion: new FormControl(null),
    idUnidadMedidaAdecuacion: new FormControl(null),
    fechaCalculada: new FormControl({value: null, disabled: true}),
    fechaCalculadaProlongado: new FormControl({value: null, disabled: true}),
    fechaCalculadaCesacion: new FormControl({value: null, disabled: true}),
    fechaCalculadaAdecuacion: new FormControl({value: null, disabled: true}),
    idTipoMedidaCoercion: new FormControl(TIPO_MEDIDA_COERCION.PERSONAL),
    idMedidaCoercion: new FormControl(MEDIDA_COERCION.PRISION_PREVENTIVA),
    idReglaConducta: new FormControl([]),
    descripcion: new FormControl('', [Validators.maxLength(this.longitudMaximaObservaciones)]),
    enEdicion: new FormControl(false)
  });

  private readonly formControlInfundado: string[] = [
    'idTipoMedidaCoercion', 'idMedidaCoercion', //---> Medidas coerción
  ];

  private readonly formControlReoAusente: string[] = [
    'fechaInicio', 'plazoOtorgado', 'idUnidadMedida'
  ];

  private readonly formControlReglasConducta: string[] = [
    'idReglaConducta'
  ];

  private readonly formControlProlongacion: string[] = [
    'plazoProlongado', 'idUnidadMedidaProlongado', 'fechaCalculadaProlongado'
  ];

  private readonly formControlCesacion: string[] = [
    'fechaCese', 'fechaInicioCesacion', 'plazoCesacion', 'idUnidadMedidaCesacion', 'fechaCalculadaCesacion'
  ];

  private readonly formControlAdecuacion: string[] = [
   'plazoAdecuacion', 'idUnidadMedidaAdecuacion', 'fechaCalculadaAdecuacion'
  ];

  get cantidadCaracteresObservacion(): number {
    return this.formularioRespuestaPrision.get('descripcion')?.value?.length ?? 0;
  }

  get formularioValido(): boolean {
    return this.formularioRespuestaPrision.valid && this.mensajeResultadoUnico == '';
  }

  get tipoResultadoInfundado(): boolean {
    return this.formularioRespuestaPrision.get('idTipoResultado')?.getRawValue() === RES_1ERA_INSTANCIA.INFUNDADO;
  }

  get tipoResultadoFundado(): boolean {
    return this.formularioRespuestaPrision.get('idTipoResultado')?.getRawValue() === RES_1ERA_INSTANCIA.FUNDADO;
  }

  get esReoAusenteContumaz(): boolean {
    return this.formularioRespuestaPrision.get('reoAusenteContumaz')?.value;
  }

  get nombreMedidaCoercion(): string {
    return this.medidasCoercionBK.find(p => p.id === this.formularioRespuestaPrision.get('idMedidaCoercion')?.getRawValue())?.nombre!
  }

  get esMedidaCoercionComparecenciaRestringida(): boolean {
    return this.formularioRespuestaPrision.get('idMedidaCoercion')?.getRawValue() === MEDIDA_COERCION.COMPARECENCIA_RESTRICCIONES;
  }

  get regitroEnModoEdicion(): boolean {
    return this.formularioRespuestaPrision.get('enEdicion')?.value && !this.actualizar;
  }

  get nombreSujetoProcesal(): string {
    return this.sujetosProcesales.find(p => p.idSujetoCaso === this.obtenerIdSujetoCaso(this.formularioRespuestaPrision.get('idSujetoCaso')?.getRawValue()))?.nombreSujetoProcesal!
  }

  get tipoMedida(): string {
    return this.prolongacion ? CUADERNO_TIPO_MEDIDA.PROLONGACION :
    this.cesacion ? CUADERNO_TIPO_MEDIDA.CESACION :
    this.adecuacion ? CUADERNO_TIPO_MEDIDA.ADECUACION :
    CUADERNO_TIPO_MEDIDA.PRISION_PREVENTIVA;
  }

  get delitosHabilitados(): boolean {
    return this.formularioRespuestaPrision.get('idDelitoSujeto')?.enabled ?? false;
  }

  get nombreResultado(): string {
    return this.cesacion? 'Resultado de la Cesación: ' : 'Resultado: ';
  }

  ngOnInit(): void {
    this.numeroCaso = this.config.data?.numeroCaso;
    this.idCaso = this.config.data?.idCaso;
    this.idCasoPadre = this.config.data?.idCasoPadre;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.tramiteEnModoEdicion = this.config.data?.tramiteEnModoEdicion;
    this.actualizar = this.config.data?.actualizar;
    this.prolongacion = this.config.data?.prolongacion;
    this.cesacion = this.config.data?.cesacion;
    this.adecuacion = this.config.data?.adecuacion;
    this.reo = this.config.data?.reo;
    this.formularioRespuestaPrision.get('idActoTramiteCaso')?.setValue( this.idActoTramiteCaso )
    this.infoCasoPadre();
    this.obtenerTipoResultados();
    this.obtenerSujetosProcesales();
    this.obtenerUnidadMedida();
    this.obtenerTipoMedidaCoercion();
    this.actualizarValidaciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private infoCasoPadre(): void {
    this.subscriptions.push(
      this.casoService.obtenerCasoFiscal(this.idCasoPadre).subscribe({
        next: (resp) => {
          this.fechaHecho = convertStringToDate(resp.fechaHecho, 'DD/MM/YYYY');
        }
      })
    );
  }

  private obtenerTipoResultados(): void {
    this.tipoResultadosTodos = [
      {
        id: RES_1ERA_INSTANCIA.FUNDADO,
        noDescripcion: 'Fundado/Procedente',
        coDescripcion: ''
      },
      {
        id: RES_1ERA_INSTANCIA.FUNDADO_PARTE,
        noDescripcion: 'Fundado en parte/Procedente en parte',
        coDescripcion: ''
      },   {
        id: RES_1ERA_INSTANCIA.INFUNDADO,
        noDescripcion: 'Infundado/Improcedente',
        coDescripcion: ''
      },
    ]

    this.tipoResultados = this.cesacion ? this.tipoResultadosTodos.filter(r => r.id != RES_1ERA_INSTANCIA.FUNDADO_PARTE) : this.tipoResultadosTodos;
  }

  private obtenerTipoResultadosNombre(idTipoResultado: number): string {
    return this.tipoResultadosTodos.find(r => r.id == idTipoResultado)?.noDescripcion ?? '';
  }

  private obtenerSujetosProcesales(): void {
    if (this.prolongacion) {
      this.subscriptions.push(
        this.resolucionAutoResuelvePrisionPreventivaService
          .obtenerSujetosProcesalesProlongacion(this.idCaso).subscribe({
          next: resp => {
            this.sujetosProcesales = resp.map(s => ({
              ...s,
              idConcatenado: `${s.idSujetoCaso}-${s.idTipoResultado}-${s.idActoTramiteResultadoSujeto}`,
              nombreSujetoProcesalConcatenado: `${s.nombreSujetoProcesal} - ${this.obtenerTipoResultadosNombre(s.idTipoResultado)}`
            }));
          }
        })
      );
    } else if (this.cesacion) {
      this.subscriptions.push(
        this.resolucionAutoResuelvePrisionPreventivaService
          .obtenerSujetosProcesalesCesacion(this.idCaso).subscribe({
          next: resp => {
            this.sujetosProcesales = resp.map(s => ({
              ...s,
              idConcatenado: `${s.idSujetoCaso}-${s.idTipoResultado}-${s.idActoTramiteResultadoSujeto}`,
              nombreSujetoProcesalConcatenado: `${s.nombreSujetoProcesal} - ${this.obtenerTipoResultadosNombre(s.idTipoResultado)}`
            }));
          }
        })
      );
    } else if (this.adecuacion) {
      this.subscriptions.push(
        this.resolucionAutoResuelvePrisionPreventivaService
          .obtenerSujetosProcesalesAdecuacion(this.idCaso).subscribe({
          next: resp => {
            this.sujetosProcesales = resp.map(s => ({
              ...s,
              idConcatenado: `${s.idSujetoCaso}-${s.idTipoResultado}-${s.idActoTramiteResultadoSujeto}`,
              nombreSujetoProcesalConcatenado: `${s.nombreSujetoProcesal} - ${this.obtenerTipoResultadosNombre(s.idTipoResultado)}`
            }));
          }
        })
      );
    } else {
      this.subscriptions.push(
        this.resolucionAutoResuelvePrisionPreventivaService
          .obtenerSujetosProcesales(this.idCaso).subscribe({
          next: resp => {
            this.sujetosProcesales = resp.map(s => ({
              ...s,
              idConcatenado: `${s.idSujetoCaso}-${s.idTipoResultado}`,
              nombreSujetoProcesalConcatenado: `${s.nombreSujetoProcesal}`
            }));
          }
        })
      );
    }
  }

  private obtenerMedidasCoercion(idTipoMedidaCoercion: number): void {
    this.subscriptions.push(
      this.maestroService.obtenerMedidasCoercion(idTipoMedidaCoercion).subscribe({
        next: (resp: GenericResponseList<MaestroInterface>) => {
          this.medidasCoercionBK = this.medidasCoercion = resp.data
        }
      })
    )
  }

  private obtenerUnidadMedida(): void {
    this.subscriptions.push(
      this.maestroService.listarUnidadMedida().subscribe({
        next: (resp: MaestroInterface[]) => {
          const permitidos = [UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS, UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES];
          this.unidadesMedida = resp.filter(item => permitidos.includes(item.id as typeof permitidos[number]));
        }
      })
    )
  }

  private obtenerTipoMedidaCoercion(): void {
    this.subscriptions.push(
      this.maestroService.getCatalogo('ID_N_TIPO_MEDIDA_COERCION').subscribe({
        next: (resp: GenericResponseList<CatalogoInterface>) => {
          const permitidos = [TIPO_MEDIDA_COERCION.PERSONAL];
          this.tipoMedidasCoercion = resp.data.filter(item => permitidos.includes(item.id as typeof permitidos[number]));
          this.obtenerMedidasCoercion(TIPO_MEDIDA_COERCION.PERSONAL)
        }
      })
    )
  }

  private obtenerReglasDeConducta(): void {
    this.subscriptions.push(
      this.maestroService.getReglasConducta().subscribe({
        next: (resp: GenericResponseList<MaestroInterface>) => {
          this.reglasConducta = resp.data
        }
      })
    )
  }

  private obtenerDelitosSujetoProcesal(): void {
    const idSujetoCaso = this.obtenerIdSujetoCaso(this.formularioRespuestaPrision.get('idSujetoCaso')?.value);
    this.subscriptions.push(
      this.resolucionAutoResuelvePrisionPreventivaService
      .obtenerDelitosSujetoProcesal(idSujetoCaso).subscribe({
        next: resp => {
          this.delitosSujetoProcesal = resp
        },
        complete: () => {
          this.validarResultadoUnico();
        }
      })
    )
  }

  private obtenerResultadosSujetoProcesal(): void {
    const idSujetoCaso = this.obtenerIdSujetoCaso(this.formularioRespuestaPrision.get('idSujetoCaso')?.value);
    const idActoTramiteResultadoSujeto = this.obtenerIdSujetoResultado(this.formularioRespuestaPrision.get('idSujetoCaso')?.value);
    this.subscriptions.push(
      this.resolucionAutoResuelvePrisionPreventivaService
        .obtenerResultadosSujetoProcesal(this.idActoTramiteCaso, idSujetoCaso, idActoTramiteResultadoSujeto).subscribe({
        next: resp => {
          this.delitosSujetoProcesal = resp.delitosSujetoProcesal;
          this.formularioRespuestaPrision.get('idActoTramiteResultadoSujetoPadre')?.setValue(resp.idActoTramiteResultadoSujeto);

          if (this.prolongacion) {
            this.llenarPrision(resp);
          }

          if (this.cesacion || this.adecuacion) {
            const padre = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == resp.idActoTramiteResultadoSujeto);
            if (padre) {
              let pri = null;
              if (padre.idTipoResultadoProceso == 1517) {
                pri = this.resultadosPrisionPreventivaTodos.find(r => r.idActoTramiteResultadoSujeto == padre.idActoTramiteResultadoSujetoPadre);
                this.llenarProlongacion(padre);
                if (pri) {
                  pri.fechaCalculada = pri.fechaFin;
                  this.llenarPrision(pri);
                }
              } else {
                this.llenarPrision(resp);
              }
            }
          }
        },
        complete: () => {
          this.validarResultadoUnico();
        }
      })
    );
  }

  llenarPrision(resp: SujetoResultadoPrisionPreventivaInterface | ResultadoPrisionPreventivaInterface): void {
    this.formularioRespuestaPrision.get('idDelitoSujeto')?.setValue(resp.idDelitoSujeto);
    this.formularioRespuestaPrision.get('idTipoMedidaCoercion')?.setValue(resp.idTipoMedidaCoercion);
    this.formularioRespuestaPrision.get('idMedidaCoercion')?.setValue(resp.idMedidaCoercion);
    this.formularioRespuestaPrision.get('fechaInicio')?.setValue(resp.fechaInicio);
    this.formularioRespuestaPrision.get('plazoOtorgado')?.setValue(resp.plazoOtorgado);
    this.formularioRespuestaPrision.get('idUnidadMedida')?.setValue(resp.idUnidadMedida);
    this.formularioRespuestaPrision.get('fechaCalculada')?.setValue(resp.fechaCalculada);
  }

  llenarProlongacion(resultado: ResultadoPrisionPreventivaInterface): void {
    this.formularioRespuestaPrision.get('fechaCalculadaProlongado')?.setValue(resultado.fechaFin);
    this.formularioRespuestaPrision.get('plazoProlongado')?.setValue(resultado.plazoOtorgado);
    this.formularioRespuestaPrision.get('idUnidadMedidaProlongado')?.setValue(resultado.idUnidadMedida);
  }

  obtenerIdSujetoCaso(idConcatenado: string): string {
    if (!idConcatenado) return '';
    const partes = idConcatenado.split('-');
    return partes.length > 0 ? partes[0] : '';
  }

  obteneridTipoResultado(idConcatenado: string): string {
    if (!idConcatenado) return '';
    const partes = idConcatenado.split('-');
    return partes.length > 1 ? partes[1] : '';
  }

  obtenerIdSujetoResultado(idConcatenado: string): string {
    if (!idConcatenado) return '';
    const partes = idConcatenado.split('-');
    return partes.length > 1 ? partes[2] : '';
  }

  private actualizarValidaciones(): void {
    this.actualizarValidacionesProlongacion();
    this.actualizarValidacionesCesacion();
    this.actualizarValidacionesAdecuacion();
  }

  private actualizarValidacionesProlongacion(): void {
    if (!this.prolongacion) return;
    if (this.tipoResultadoInfundado) {
      this.actualizarControles([], this.formControlProlongacion);
    } else {
      this.actualizarControles([
        {controlActual: this.formularioRespuestaPrision.get('plazoProlongado')!, validador: [Validators.required, Validators.min(1)]},
        {controlActual: this.formularioRespuestaPrision.get('idUnidadMedidaProlongado')!, validador: [Validators.required]},
      ], this.formControlProlongacion);
    }
    this.desabilitarControlProlongacion();
  }

  private desabilitarControlProlongacion(): void {
    this.formularioRespuestaPrision.get('idDelitoSujeto')?.disable();
    this.formularioRespuestaPrision.get('idTipoMedidaCoercion')?.disable();
    this.formularioRespuestaPrision.get('idMedidaCoercion')?.disable();
    this.formularioRespuestaPrision.get('fechaInicio')?.disable();
    this.formularioRespuestaPrision.get('plazoOtorgado')?.disable();
    this.formularioRespuestaPrision.get('idUnidadMedida')?.disable();
    this.formularioRespuestaPrision.get('fechaCalculada')?.disable();
  }

  private actualizarValidacionesCesacion(): void {
    if (!this.cesacion) return;
    if (this.tipoResultadoInfundado) {
      this.actualizarControles([],
        this.formControlCesacion);
    } else {
      this.actualizarControles([
          {controlActual: this.formularioRespuestaPrision.get('idTipoMedidaCoercion')!, validador: [Validators.required]},
          {controlActual: this.formularioRespuestaPrision.get('idMedidaCoercion')!, validador: [Validators.required]},
          {controlActual: this.formularioRespuestaPrision.get('fechaCese')!, validador: [Validators.required]},
          {controlActual: this.formularioRespuestaPrision.get('fechaInicioCesacion')!, validador: [Validators.required]},
          {
            controlActual: this.formularioRespuestaPrision.get('plazoCesacion')!,
            validador: [Validators.required, Validators.min(1)]
          },
          {
            controlActual: this.formularioRespuestaPrision.get('idUnidadMedidaCesacion')!,
            validador: [Validators.required]
          }
        ],
        this.formControlCesacion);
    }
    this.desabilitarControlProlongacion();
    this.desabilitarControlCesacion();
  }

   private actualizarValidacionesAdecuacion(): void {
    if (!this.adecuacion) return;
    if (this.tipoResultadoInfundado) {
      this.actualizarControles([],
        this.formControlAdecuacion);
    } else {
      this.actualizarControles([
          {controlActual: this.formularioRespuestaPrision.get('idTipoMedidaCoercion')!, validador: [Validators.required]},
          {controlActual: this.formularioRespuestaPrision.get('idMedidaCoercion')!, validador: [Validators.required]},
          {
            controlActual: this.formularioRespuestaPrision.get('plazoAdecuacion')!,
            validador: [Validators.required, Validators.min(1)]
          },
          {
            controlActual: this.formularioRespuestaPrision.get('idUnidadMedidaAdecuacion')!,
            validador: [Validators.required]
          }
        ],
        this.formControlAdecuacion);
    }
    this.desabilitarControlProlongacion();
    this.desabilitarControlAdecuacion();
  }

  private desabilitarControlCesacion(): void {
    if (this.tipoResultadoFundado) {
      this.formularioRespuestaPrision.get('idTipoMedidaCoercion')?.enable();
      this.formularioRespuestaPrision.get('idMedidaCoercion')?.enable();
    }
    this.formularioRespuestaPrision.get('plazoProlongado')?.disable();
    this.formularioRespuestaPrision.get('idUnidadMedidaProlongado')?.disable();
    this.formularioRespuestaPrision.get('fechaCalculadaProlongado')?.disable();
  }

  private desabilitarControlAdecuacion(): void {
    this.formularioRespuestaPrision.get('plazoProlongado')?.disable();
    this.formularioRespuestaPrision.get('idUnidadMedidaProlongado')?.disable();
    this.formularioRespuestaPrision.get('fechaCalculadaProlongado')?.disable();
  }

  protected cerrarModal(): void {
    this.ref.close({existeResultadosRegistrados: this.existeResultadosRegistrados});
  }

  protected alCambiarMedidaCoercion(): void {
    if ( this.esMedidaCoercionComparecenciaRestringida ) {
      this.obtenerReglasDeConducta()
      this.actualizarControles([
        { controlActual: this.formularioRespuestaPrision.get('idReglaConducta')!, validador: [Validators.required,] }],
        this.formControlReglasConducta);
    } else {
      this.actualizarControles([], this.formControlReglasConducta);
      this.resetearValoresReglaConducta();
    }
  }

  protected alCambiarReoAusente(): void {
    if ( this.esReoAusenteContumaz ) {
      this.actualizarControles([], this.formControlReoAusente);
    } else {
      this.actualizarControles([
        { controlActual: this.formularioRespuestaPrision.get('fechaInicio')!, validador: [Validators.required,] },
        { controlActual: this.formularioRespuestaPrision.get('plazoOtorgado')!, validador: [Validators.required, Validators.min(1)] },
        { controlActual: this.formularioRespuestaPrision.get('idUnidadMedida')!, validador: [Validators.required,] }],
        this.formControlReoAusente);
    }
  }

  private resetearValoresReglaConducta(): void {
    this.formularioRespuestaPrision.get('idReglaConducta')?.setValue([])
  }

  protected alcambiarTipoResultado(): void {
    if ((this.tipoResultadoInfundado && !this.cesacion && !this.adecuacion)
      || (this.tipoResultadoFundado && this.cesacion && this.adecuacion)) {
      this.actualizarControles([
        { controlActual: this.formularioRespuestaPrision.get('idTipoMedidaCoercion')!, validador: [Validators.required,] },
        { controlActual: this.formularioRespuestaPrision.get('idMedidaCoercion')!, validador: [Validators.required,] }],
        this.formControlInfundado);
    } else {
      this.actualizarControles([], this.formControlInfundado);
    }
    if (!this.prolongacion) {
      this.logicaMedidaCoercion();
    }
    this.actualizarValidaciones();
    this.alCambiarMedidaCoercion();
    this.validarResultadoUnico();
  }

  private logicaMedidaCoercion(): void {
    const aExcluir = [MEDIDA_COERCION.PRISION_PREVENTIVA];
    if ((this.tipoResultadoInfundado && !this.cesacion && !this.adecuacion)
      || (this.tipoResultadoFundado && this.cesacion)) {
      this.formularioRespuestaPrision.get('idMedidaCoercion')?.setValue(null)
      this.medidasCoercion = this.medidasCoercionBK.filter(item => !aExcluir.includes(item.id as typeof aExcluir[number]));
    } else {
      this.medidasCoercion = this.medidasCoercionBK;
      this.formularioRespuestaPrision.get('idMedidaCoercion')?.setValue(MEDIDA_COERCION.PRISION_PREVENTIVA)
    }
  }

  protected alCambiarTipoMedidaCoercion(event: any): void {
    this.medidasCoercion = [];
    this.obtenerMedidasCoercion(event.value);
  }

  protected alCambiarSujetoProcesal(event: any): void {
    this.delitosSujetoProcesal = [];
    this.formularioRespuestaPrision.get('idDelitoSujeto')?.setValue([])
    this.setearIdTipoParteSujeto(this.obtenerIdSujetoCaso(event.value));
    if (this.prolongacion || this.cesacion || this.adecuacion) {
      this.obtenerResultadosSujetoProcesal();
    } else {
      this.obtenerDelitosSujetoProcesal();
    }
  }

  protected alCambiarUnidadAdecuacion(id: number): void {
    let max = 1;
    if (id == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS) {
      max = 9999;
    }
    if (id == UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES) {
      max = 99;
    }
    this.actualizarControles([
        { controlActual: this.formularioRespuestaPrision.get('plazoAdecuacion')!,
          validador: [Validators.required, Validators.min(1), Validators.max(max)]
        }],
      this.formControlAdecuacion);
  }

  private setearIdTipoParteSujeto(idSujetoCaso: string): void {
    let idTipoParteSujeto = this.sujetosProcesales.find(p => p.idSujetoCaso === idSujetoCaso)?.idTipoParteSujeto
    this.formularioRespuestaPrision.get('idTipoParteSujeto')?.setValue( idTipoParteSujeto )
  }

  protected quitarDelito(
      delito: DelitoSujetoProcesal,
      event: Event,
      multiSelect: any
  ): void {
    event.stopPropagation()
    const control = this.formularioRespuestaPrision.get('idDelitoSujeto')!;
    const nuevosDelitos = control.value.filter(
        (d: string) => d !== delito.idDelitoSujeto
      );
    control.setValue(nuevosDelitos);
    multiSelect.hide()
  }

  protected eliminarCerosIniciales(event: Event, control: string): void {
    const inputElement = event.target as HTMLInputElement
    let valor = inputElement.value
    valor = valor.replace(/^0+(?!$)/, '')
    inputElement.value = valor
    const formControl = this.formularioRespuestaPrision.get(control)
    if (formControl) formControl.setValue(valor, { emitEvent: false })
  }

  private actualizarControles(grupoControl: GrupoControlInterface[], controles: string[]): void {
    const controls = this.formularioRespuestaPrision.controls;
    controles.forEach(name => {
      const grupo = grupoControl.find(_ => _.controlActual === controls[name]);
      this.setearValorValidacion(controls[name], grupo?.validador ?? null);
    });
  }

  private setearValorValidacion(control: AbstractControl, validator: ValidatorFn[] | null): void {
    control.setValidators(validator);
    control.updateValueAndValidity();
  }

  protected agregarGuardarResultado(): void {
    this.mensajeExcedePlazoOtorgado = null;
    this.valorReoNuevo();
    if (this.mismoSujetoReo()) {
      const idSujetoCaso = this.obtenerIdSujetoCaso(this.formularioRespuestaPrision.getRawValue().idSujetoCaso);
      const nombreSujetoCaso = this.sujetosProcesales.find((s: any) => s.idSujetoCaso === idSujetoCaso)?.nombreSujetoProcesal ?? '';

      const dialog = this.modalDialogService.question(
        'ACTUALIZAR REO AUSENTE/CONTUMAZ',
        `Se tiene registrado al sujeto procesal “${nombreSujetoCaso}” con un valor diferente de “Reo ausente/contumaz”. Se procederá a actualizar los registros anteriores con el nuevo valor. ¿Desea confirmar?”`,
        'Aceptar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.ejecutarGuadardo();
          }
        },
      });
    } else {
      this.ejecutarGuadardo();
    }
  }

  protected ejecutarGuadardo(): void {
    this.actualizarTablaResultados(false);
    const data: ResultadoPrisionPreventivaInterface = this.formularioRespuestaPrision.getRawValue();
    data.tipoMedida = this.tipoMedida;
    data.idSujetoCaso = this.obtenerIdSujetoCaso(this.formularioRespuestaPrision.get('idSujetoCaso')?.value);
    this.subscriptions.push(
      this.resolucionAutoResuelvePrisionPreventivaService
        .registrarResultadosPrisionPreventiva(data).subscribe({
        next: resp => {
          this.modalDialogService.success(
            'REGISTRO CORRECTO',
            `Se registró correctamente el resultado`,
            'Aceptar'
          );
          this.actualizarTablaResultados( true );
          this.limpiarControles();
          this.actualizarValidaciones();
        },
        error: (err) => {
          if (err.error.code == '42201117') this.mensajeRegistroDuplicado(err.error.message);
          else if (err.error.code == '42201118') this.mensajeExcedePlazo(err.error.message);
          else this.modalDialogService.error('Error', `Error en el servidor ${err.error.message}`, 'Aceptar');
        },
      })
    );
  }

  private validarResultadoUnico(): void {
    if (this.regitroEnModoEdicion) {
      this.mensajeResultadoUnico = '';
      return;
    }
    const idActoTramiteResultadoSujetoPadre = this.formularioRespuestaPrision.get('idActoTramiteResultadoSujetoPadre')?.value;
    const idActoTramiteResultadoSujeto = this.obtenerIdSujetoResultado(this.formularioRespuestaPrision.get('idSujetoCaso')?.value);
    const idTipoResultado = this.formularioRespuestaPrision.get('idTipoResultado')?.value;
    const idSujetoCaso = this.obtenerIdSujetoCaso(this.formularioRespuestaPrision.get('idSujetoCaso')?.value);

    const duplicado = this.resultadosPrisionPreventiva
      .find(r => r.idTipoResultado === idTipoResultado && r.idSujetoCaso === idSujetoCaso && r.idActoTramiteResultadoSujeto !== idActoTramiteResultadoSujetoPadre);
    const asignado = this.resultadosPrisionPreventiva
      .find(r => (this.prolongacion || this.cesacion || this.adecuacion) && r.idActoTramiteResultadoSujetoPadre == idActoTramiteResultadoSujeto);
    this.mensajeResultadoUnico = !!duplicado ? 'Ya se tiene registrado el mismo resultado para el sujeto y medida de coerción, solo puede editar el registro existente'
      : !!asignado ? 'Ya se tiene registrado el mismo Sujeto procesal - Resultado, sólo puede editar el registro existente' : '';
  }

  private mismoSujetoReo(): boolean {
    const idSujetoCaso = this.obtenerIdSujetoCaso(this.formularioRespuestaPrision.getRawValue().idSujetoCaso);
    const reoAusenteContumaz = this.formularioRespuestaPrision.getRawValue().reoAusenteContumaz;
    const buscado = this.resultadosPrisionPreventiva.find(r => r.idSujetoCaso == idSujetoCaso && r.reoAusenteContumaz != reoAusenteContumaz);
    return !!buscado;
  }

  private mensajeExcedePlazo(mensaje: string): void {
    this.mensajeExcedePlazoOtorgado = mensaje
  }

  private valorReoNuevo(): void {
    if (this.actualizar) {
      this.formularioRespuestaPrision.get('reoAusenteContumazNuevo')?.setValue(false);
    } else {
      this.formularioRespuestaPrision.get('reoAusenteContumazNuevo')?.setValue(this.esReoAusenteContumaz);
    }
  }

  private mensajeRegistroDuplicado(delitos: string): void {
    const mensaje: string = `Los datos a ingresar para el sujeto procesal <strong>${this.nombreSujetoProcesal}</strong> con el(los) delito(s): ${delitos} ya se encuentran registrados. Por favor, verifique la información e inténtelo nuevamente.`;
    this.modalDialogService.warningRed('REGISTRO DUPLICADO', `${mensaje}`, 'Aceptar');
  }

  protected alSeleccionarResultado(resultado: ResultadoPrisionPreventivaInterface): void {
    if ( this.formularioRespuestaPrision.get('idActoTramiteResultadoSujeto')?.value === resultado.idActoTramiteResultadoSujeto ) this.limpiarControles();
    else this.establecerValoresEdicion( resultado );
  }

  protected listaResultados(resultadosPrisionPreventiva: ResultadoPrisionPreventivaInterface[]): void {
    this.resultadosPrisionPreventiva = resultadosPrisionPreventiva;
  }

  protected listaResultadosTodos(resultadosPrisionPreventiva: ResultadoPrisionPreventivaInterface[]): void {
    this.resultadosPrisionPreventivaTodos = resultadosPrisionPreventiva;
  }

  private establecerValoresEdicion(resultado: ResultadoPrisionPreventivaInterface): void {
    this.formularioRespuestaPrision.patchValue({
      idActoTramiteResultadoSujeto: resultado.idActoTramiteResultadoSujeto,
      idActoTramiteResultadoSujetoPadre: resultado.idActoTramiteResultadoSujetoPadre,
      idActoTramiteCaso: resultado.idActoTramiteCaso,
      idTipoResultado: resultado.idTipoResultado,
      idSujetoCaso: resultado.idSujetoCaso + '-0',
      idTipoParteSujeto: resultado.idTipoParteSujeto,
      idDelitoSujeto: resultado.idDelitoSujeto,
      reoAusenteContumaz: resultado.reoAusenteContumaz,
      fechaInicio: resultado.fechaInicio,
      fechaInicioCesacion: resultado.fechaInicioCesacion,
      fechaCese: resultado.fechaCese,
      plazoOtorgado: resultado.plazoOtorgado || null,
      plazoProlongado: resultado.plazoProlongado || null,
      plazoCesacion: resultado.plazoCesacion || null,
      plazoAdecuacion: resultado.plazoAdecuacion || null,
      idUnidadMedida: resultado.idUnidadMedida || null,
      idUnidadMedidaProlongado: resultado.idUnidadMedidaProlongado || null,
      idUnidadMedidaAdecuacion: resultado.idUnidadMedidaAdecuacion || null,
      idUnidadMedidaCesacion: resultado.idUnidadMedidaCesacion || null,
      fechaCalculada: resultado.fechaCalculada,
      fechaCalculadaProlongado: resultado.fechaCalculadaProlongado,
      fechaCalculadaAdecuacion: resultado.fechaCalculadaAdecuacion,
      fechaCalculadaCesacion: resultado.fechaCalculadaCesacion,
      idTipoMedidaCoercion: resultado.idTipoMedidaCoercion,
      idMedidaCoercion: resultado.idMedidaCoercion,
      idReglaConducta: resultado.idReglaConducta,
      descripcion: resultado.descripcion,
      enEdicion: resultado.enEdicion
    })
    if (this.prolongacion) {
      this.formularioRespuestaPrision.patchValue({
        idTipoResultado: resultado.idTipoResultadoProlongada,
        idSujetoCaso: resultado.idSujetoCaso + '-' + resultado.idTipoResultado + '-' + resultado.idActoTramiteResultadoSujetoPadre,
      });
    }
    if (this.cesacion) {
      this.formularioRespuestaPrision.patchValue({
        idTipoResultado: resultado.idTipoResultadoCesacion,
        idSujetoCaso: resultado.idSujetoCaso + '-' + resultado.idTipoResultado + '-' + resultado.idActoTramiteResultadoSujetoPadre,
      });
    }
    if (this.adecuacion) {
      this.formularioRespuestaPrision.patchValue({
        idTipoResultado: resultado.idTipoResultadoAdecuacion,
        idSujetoCaso: resultado.idSujetoCaso + '-' + resultado.idTipoResultado + '-' + resultado.idActoTramiteResultadoSujetoPadre,
      });
    }
    this.obtenerDelitosSujetoProcesal();
    this.alCambiarMedidaCoercion();
    this.alCambiarReoAusente();
    this.toggleControles(false);
  }

  private toggleControles(habilitar: boolean): void {
    const controles = [
      'idTipoResultado',
      'idSujetoCaso',
      'idDelitoSujeto',
      'idTipoMedidaCoercion',
      'idMedidaCoercion',
      'idReglaConducta'
    ];

    controles.forEach(control => {
      const formControl = this.formularioRespuestaPrision.get(control);
      if (formControl) {
        habilitar ? formControl.enable() : formControl.disable();
      }
    });
  }

  private actualizarTablaResultados(estado: boolean): void {
    this.eventoActualizarTablaResultados = estado;
  }

  protected limpiarControles(): void {
    this.formularioRespuestaPrision.patchValue({
      idActoTramiteResultadoSujeto: null,
      idTipoResultado: null,
      idSujetoCaso: null,
      idTipoParteSujeto: null,
      idDelitoSujeto: [],
      reoAusenteContumaz: false,
      fechaInicio: null,
      plazoOtorgado: null,
      idUnidadMedida: null,
      fechaCalculada: null,
      idTipoMedidaCoercion: TIPO_MEDIDA_COERCION.PERSONAL,
      idMedidaCoercion: MEDIDA_COERCION.PRISION_PREVENTIVA,
      idReglaConducta: [],
      descripcion: '',
      enEdicion: false
    })
    if (this.prolongacion) {
      this.formularioRespuestaPrision.patchValue({
        plazoProlongado: null,
        idUnidadMedidaProlongado: null,
        fechaCalculadaProlongado: null,
      });
      this.formularioRespuestaPrision.get('idTipoResultado')?.enable();
      this.formularioRespuestaPrision.get('idSujetoCaso')?.enable();
      return;
    }
    if (this.cesacion) {
      this.formularioRespuestaPrision.patchValue({
        fechaCese: null,
        fechaInicioCesacion: null,
        plazoCesacion: null,
        fechaCalculadaCesacion: null,
        idUnidadMedidaCesacion: null,
      });
      return;
    }
    this.toggleControles(true);
  }

}
