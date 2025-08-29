import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { MaestroService } from '@core/services/shared/maestro.service';
import { CmpLibModule } from 'dist/cmp-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DigitOnlyModule } from '@directives/digit-only.module';
import dayjs from 'dayjs';
import { valid } from '@core/utils/string';
import { CheckboxModule } from 'primeng/checkbox';
import { Subscription } from 'rxjs';
import { RegistrarPenasService } from '@core/services/reusables/otros/registrar-penas.service';
import { convertirStringAmericanoANumero, formatearNumeroAmericano, getDateFromString, limpiarFormcontrol, validarRangoMontoAmericano } from '@core/utils/utils';
import { MensajeCompletarCamposComponent } from '@core/components/mensajes/mensaje-completar-campos/mensaje-completar-campos.component';
import { IconUtil } from 'dist/ngx-cfng-core-lib';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TIPO_ACCION } from '@core/types/tipo-accion.type';
import { DataPena } from '@core/interfaces/reusables/registrar-penas/data-pena.interface';
import { REGISTRAR_PENAS } from '@core/types/reutilizable/registrar-penas.type';
import { convertStringToDate } from '@core/utils/date';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';

@Component({
  selector: 'app-registrar-penas',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    CmpLibModule,
    CommonModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    DateMaskModule,
    DigitOnlyModule,
    CheckboxModule,
    RadioButtonModule,
    MensajeCompletarCamposComponent
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './registrar-penas.component.html',
  styleUrl: './registrar-penas.component.scss'
})
export class RegistrarPenasComponent {
  /**
   * 🟢 **Variable de tipo DataPena**
   * - Envia los campos `idCaso` y `idActoTramiteCaso` en un objeto
   */
  @Input() data!: DataPena;

  /**
   * 🔄 **Acción a realizar**
   * - Define el tipo de acción a ejecutar usando `TIPO_ACCION`
   * : CREAR = 0 VISUALIZAR = 1 EDITAR = 2
   */
  @Input() accion!: TIPO_ACCION;

  /**
   * 🔑 **Identificador del Sujeto Caso por Delito**
   * - **Nota:** Solo debe enviarse cuando se edite o visualice en modo lectura
   */
  @Input() idActoTramiteDelitoSujeto!: string;

  /**
 * 🔑 **Identificador de la Pena por Delito**
 * - **Nota:** Solo debe enviarse cuando se edite o visualice en modo lectura
 */
  @Input() idPena!: string;

  /**
   * 🔘 **RadioButtons de Conformidad de Pretensión**
   * - Enviar `true` si desea activar los radioButtons de:
   *   - Conformada total por pretensión
   *   - Conformada parcial por pretensión
   */
  @Input() conformadaPretension: boolean = false;

  /**
   * 🧾 **Identificador del Tipo de Sentencia**
   * - Envia el ID del tipo de sentencia que se registra a la Pena
   */
  @Input() tipoSentencia: number = 0;

  /**
   * 🟢 **Variable de tipo boolean**
   * - Envia un flag para indicar si el componente esta en modo lectura
   */
  @Input() modoLectura!: boolean;

  /**
   * 🔘 **Checkbox de ejecución inmediata**
   * - Enviar `true` si desea visualizar el checkbox de ejecución inmediata (Exclusivo para CUS.PRO.JUZ.010.1 - Registrar sentencia condenatoria)
   */
  @Input() ejecucionInmediata: boolean = false;

  /**
   * 🔘 **Variable de tipo Number (opcional)**
   * - Si es nula , listará por defecto los imputados , caso contrario listara de acuerdo al campo que se envie (ID_N_TIPO_PARTE_SUJETO)
   */
  @Input() tipoParteSujeto: number | null = null;

  /**
   * 📤 **Evento de Respuesta del Formulario**
   * - Emite un valor `true` en caso de que se haya editado o guardado una pena exitosamente.
   */
  @Output() respuestaFormulario = new EventEmitter<any>();

  private readonly subscriptions: Subscription[] = [];
  REGISTRAR_PENAS = REGISTRAR_PENAS;

  TIPO_ACCION = TIPO_ACCION;
  idActoTramiteCaso!: string;
  idCaso!: string;
  listaSujetoProcesal: any = [];
  listaDelitos: any = [];
  listaClasePenas: any = [];
  listaTipoPenas: any = [];
  listaReglasConducta: any = [];
  formPenas!: FormGroup;
  validarFechaPeriodoPena: Boolean = false;
  validarFechaPeriodoPrueba: Boolean = false;
  txtMensajeError: string = "";

  TOTAL_POR_PRETENSION: number = this.REGISTRAR_PENAS.TOTAL_POR_PRETENSION;
  PARCIAL_POR_PRETENSION: number = this.REGISTRAR_PENAS.PARCIAL_POR_PRETENSION;
  ID_N_PENA: string = this.REGISTRAR_PENAS.ID_N_PENA;
  LIMITATIVAS_DERECHO_CLASE_PENA: number = this.REGISTRAR_PENAS.LIMITATIVAS_DERECHO_CLASE_PENA;
  MULTA_CLASE_PENA: number = this.REGISTRAR_PENAS.MULTA_CLASE_PENA;
  PRIVATIVA_LIBERTAD_CLASE_PENA: number = this.REGISTRAR_PENAS.PRIVATIVA_LIBERTAD_CLASE_PENA;
  RESTRICTIVA_LIBERTAD_CLASE_PENA: number = this.REGISTRAR_PENAS.RESTRICTIVA_LIBERTAD_CLASE_PENA;
  INHABILITACION_ACCESORIA_TIPO_PENA: number = this.REGISTRAR_PENAS.INHABILITACION_ACCESORIA_TIPO_PENA;
  INHABILITACION_PRINCIPAL_TIPO_PENA: number = this.REGISTRAR_PENAS.INHABILITACION_PRINCIPAL_TIPO_PENA;
  LIMITACION_DIAS_LIBRES_TIPO_PENA: number = this.REGISTRAR_PENAS.LIMITACION_DIAS_LIBRES_TIPO_PENA;
  PRESTACION_SERVICIO_COMUNIDAD_TIPO_PENA: number = this.REGISTRAR_PENAS.PRESTACION_SERVICIO_COMUNIDAD_TIPO_PENA;
  EFECTIVA_TIPO_PENA: number = this.REGISTRAR_PENAS.EFECTIVA_TIPO_PENA;
  RESERVA_FALLO_CONDENATORIO_TIPO_PENA: number = this.REGISTRAR_PENAS.RESERVA_FALLO_CONDENATORIO_TIPO_PENA;
  SUSPENDIDA_TIPO_PENA: number = this.REGISTRAR_PENAS.SUSPENDIDA_TIPO_PENA;
  VIDEOVIGILANCIA_TIPO_PENA: number = this.REGISTRAR_PENAS.VIDEOVIGILANCIA_TIPO_PENA;
  ANHOS_REVISION_CADENA_PERPETUA: number = this.REGISTRAR_PENAS.ANHOS_REVISION_CADENA_PERPETUA;

  protected fechaHechoCaso: Date | null = null;
  protected fechaActual: Date = new Date();

  ngOnInit() {
    this.idActoTramiteCaso = this.data?.idActoTramiteCaso;
    this.idCaso = this.data?.idCaso;
    this.iniciarDatos();
    this.modoLectura && this.formPenas.disable();
  }

  constructor(
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly registrarPenasService: RegistrarPenasService,
    private readonly maestroService: MaestroService,
    private readonly fb: FormBuilder,
    protected iconUtil: IconUtil,
    private readonly gestionCasoService: GestionCasoService,
  ) {
    this.formBuild();
    this.fechaHechoCaso = getDateFromString(this.gestionCasoService.expedienteActual.fechaHecho);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  private formBuild() {
    this.formPenas = this.fb.group({
      sujeto: [null, [Validators.required]],
      delito: [null, [Validators.required]],
      clasePena: [null, [Validators.required]],
      tipoPena: [null],
      montoMultaPena: [null],
      fechaExpulsionPais: [null],
      periodoPenaDias: [null],
      periodoPenaMeses: [null],
      periodoPenaAnhos: [null],
      periodoPenaFechaInicio: [null],
      fechaPeriodoPena: [{ value: '', disabled: true }],
      nroJornadasSemanales: [null],
      cadenaPerpetua: [false],
      penaConvertida: [false],
      sentenciaEjecProvicional: [false],
      fechaInicioRevisionCadenaPerpetua: [null],
      fechaRevisionCadenaPerpetua: [{ value: '', disabled: true }],
      reglasConducta: this.fb.array([]),
      periodoPenaDiasPrueba: [null, [Validators.min(0), Validators.max(29)]],
      periodoPenaMesesPrueba: [null, [Validators.min(0), Validators.max(11)]],
      periodoPenaAnhosPrueba: [null, [Validators.min(0), Validators.max(99)]],
      periodoPenaFechaInicioPrueba: [null],
      fechaPeriodoPenaPrueba: [{ value: '', disabled: true }],
      tipoPretension: [null],
      reparacionCivil: [false],
      ejecucionInmediata: [false],
      observaciones: ['', [Validators.maxLength(200)]],
    });
  }
  iniciarDatos() {
    this.listarSujetosProcesal();
    this.listarClasePenas();
    this.cargarDatosPena();
    this.cargarConformadaPretension();
  }

  cargarConformadaPretension() {
    if (this.conformadaPretension) {
      this.formPenas.get("tipoPretension")?.setValue(this.TOTAL_POR_PRETENSION);
    }
  }
  counterReportChar(): number {
    return this.formPenas.get('observaciones')!.value !== null
      ? this.formPenas.get('observaciones')!.value.length
      : 0;
  }

  cargarDatosPena() {
    if (this.accion == TIPO_ACCION.VISUALIZAR || this.accion == TIPO_ACCION.EDITAR) {
      this.subscriptions.push(
        this.registrarPenasService.obtenerPena(this.idActoTramiteDelitoSujeto, this.idPena).subscribe({
          next: resp => {
            //PRIMERA EJECUCION
            this.formPenas.get("sujeto")?.setValue(resp.sujeto);
            this.formPenas.get("clasePena")?.setValue(resp.clasePena);

            this.listarDelitos(resp.sujeto);
            this.cambioClasesPenas(resp.clasePena);
            this.formPenas.get("tipoPena")?.setValue(resp.tipoPena);

            if (this.formPenas.get('clasePena')?.value === this.PRIVATIVA_LIBERTAD_CLASE_PENA && (this.formPenas.get('tipoPena')?.value === this.RESERVA_FALLO_CONDENATORIO_TIPO_PENA
              || this.formPenas.get('tipoPena')?.value === this.SUSPENDIDA_TIPO_PENA
              || this.formPenas.get('tipoPena')?.value === this.VIDEOVIGILANCIA_TIPO_PENA
            )) {
              this.listarReglasConducta();
            }

            this.formPenas.patchValue({
              delito: resp.delito,
              sujeto: resp.sujeto,
              fechaExpulsionPais: convertStringToDate(resp.fechaExpulsionPais),
              periodoPenaDias: resp.periodoPenaDias,
              periodoPenaMeses: resp.periodoPenaMeses,
              periodoPenaAnhos: resp.periodoPenaAnhos,
              periodoPenaFechaInicio: convertStringToDate(resp.periodoPenaFechaInicio),
              nroJornadasSemanales: resp.nroJornadasSemanales,
              cadenaPerpetua: resp.cadenaPerpetua,
              penaConvertida: resp.penaConvertida,
              sentenciaEjecProvicional: resp.sentenciaEjecProvicional,
              fechaInicioRevisionCadenaPerpetua: convertStringToDate(resp.fechaInicioRevisionCadenaPerpetua),
              fechaRevisionCadenaPerpetua: convertStringToDate(resp.fechaRevisionCadenaPerpetua),
              periodoPenaDiasPrueba: resp.periodoPenaDiasPrueba,
              periodoPenaMesesPrueba: resp.periodoPenaMesesPrueba,
              periodoPenaAnhosPrueba: resp.periodoPenaAnhosPrueba,
              periodoPenaFechaInicioPrueba: convertStringToDate(resp.periodoPenaFechaInicioPrueba),
              fechaPeriodoPena: convertStringToDate(resp.fechaPeriodoPena),
              fechaPeriodoPenaPrueba: convertStringToDate(resp.fechaPeriodoPenaPrueba),
              montoMultaPena: formatearNumeroAmericano(resp.montoMultaPena),
              tipoPretension: resp.tipoPretension,
              observaciones: resp.observaciones,
              ejecucionInmediata:resp.ejecucionInmediata
            });


            //SEGUNDA EJECUCION
            setTimeout(() => {
              if (resp.reglasConducta?.length > 0) {
                const checkboxesReglasConducta = this.formPenas.controls['reglasConducta'] as FormArray;
                this.listaReglasConducta.forEach((item: any, index: number) => {
                  const isChecked = resp.reglasConducta.includes(item.id);
                  checkboxesReglasConducta.at(index).setValue(isChecked);
                });
              }
              if (this.accion == TIPO_ACCION.VISUALIZAR) {
                this.formPenas.disable();
              }
              else {
                this.formPenas.get('sujeto')?.disable();
              }
            }, 100);
          },
          error: error => {
            this.modalDialogService.error("Error", "Se ha producido un error al intentar obtener la información de la pena", 'Ok');
          }
        })
      )
    }
  }

  listarSujetosProcesal() {
    this.subscriptions.push(
      this.registrarPenasService.listarSujetos(this.idCaso,this.tipoParteSujeto).subscribe({
        next: resp => {
          this.listaSujetoProcesal = resp
        }
      })
    )
  }
  listarDelitos(sujeto: string) {
    this.subscriptions.push(
      this.registrarPenasService.listarDelitosxSujeto(sujeto).subscribe({
        next: resp => {
          this.listaDelitos = resp
        }
      })
    )
  }
  listarClasePenas() {
    this.subscriptions.push(
      this.maestroService.obtenerCatalogo(this.ID_N_PENA).subscribe({
        next: resp => {
          this.listaClasePenas = resp.data
        }
      })
    )
  }

  listarTipoPenas(value: number) {
    this.subscriptions.push(
      this.maestroService.getTipoPena(value).subscribe({
        next: resp => {
          this.listaTipoPenas = resp.data
        }
      })
    )
  }

  listarReglasConducta() {
    this.subscriptions.push(
      this.maestroService.getReglasConducta().subscribe({
        next: resp => {
          this.listaReglasConducta = resp.data
          this.cargarCheckboxReglasConducta();
        }
      })
    )
  }

  cargarCheckboxReglasConducta() {
    const checkboxesReglasConducta = this.formPenas.controls['reglasConducta'] as FormArray;
    this.listaReglasConducta.forEach(() => {
      checkboxesReglasConducta.push(this.fb.control(false));
    });
  }

  limpiarCheckboxReglasConducta() {
    this.listaReglasConducta = [];
    (this.formPenas.get('reglasConducta') as FormArray).clear();
  }

  cambioClasesPenas(value: any) {
    this.limpiarInputsFlujosAlternativos();
    this.formPenas.get("tipoPena")?.setValue(null);
    this.formPenas.get("fechaExpulsionPais")?.setValue(null);
    this.formPenas.get("observaciones")?.setValue(null);
    if (this.formPenas.value.clasePena == this.RESTRICTIVA_LIBERTAD_CLASE_PENA) {
      limpiarFormcontrol(this.formPenas.get('tipoPena'), []);
      limpiarFormcontrol(this.formPenas.get('fechaExpulsionPais'), [Validators.required]);
    }
    else {
      limpiarFormcontrol(this.formPenas.get('tipoPena'), [Validators.required]);
      limpiarFormcontrol(this.formPenas.get('fechaExpulsionPais'), []);
      this.listarTipoPenas(value);
    }
  }

  formatearMonto(input: string) {
    if (this.formPenas.get(input)?.value) {
      this.formPenas.get(input)?.setValue(formatearNumeroAmericano(this.formPenas.get(input)?.value));
    }
  }
  validarInputsPendientes(formGroup: FormGroup): string[] {
    const validarInputsconPendiente: string[] = [];
    Object.keys(formGroup.controls).forEach(campo => {
      const control = formGroup.get(campo);
      if (control && control.invalid && (control.validator || control.asyncValidator)) {
        validarInputsconPendiente.push(campo);
      }
    });
    return validarInputsconPendiente;
  }


  cambiarTipoPena(value: any) {
    this.limpiarInputsFlujosAlternativos();
    switch (this.formPenas.value.clasePena) {
      case this.LIMITATIVAS_DERECHO_CLASE_PENA:
        switch (value) {
          case this.INHABILITACION_ACCESORIA_TIPO_PENA:
          case this.INHABILITACION_PRINCIPAL_TIPO_PENA:
            this.validarCamposPeriodoPena();
            break;
          case this.LIMITACION_DIAS_LIBRES_TIPO_PENA:
          case this.PRESTACION_SERVICIO_COMUNIDAD_TIPO_PENA:
            limpiarFormcontrol(this.formPenas.get('nroJornadasSemanales'), [Validators.required]);
            break;
          default:
            break;
        }

        break;
      case this.MULTA_CLASE_PENA:
        if (this.formPenas.value.tipoPena != null) {
          limpiarFormcontrol(this.formPenas.get('montoMultaPena'), [Validators.required, validarRangoMontoAmericano(0.99,REGISTRAR_PENAS.LIMITE_MONTO_MULTA)]);
        }
        break;
      case this.PRIVATIVA_LIBERTAD_CLASE_PENA:
        switch (value) {
          case this.EFECTIVA_TIPO_PENA:
            this.validarCamposPeriodoPena();
            this.formPenas.get("cadenaPerpetua")?.setValue(false);
            this.formPenas.get("penaConvertida")?.setValue(false);
            this.formPenas.get("sentenciaEjecProvicional")?.setValue(false);
            break;
          case this.RESERVA_FALLO_CONDENATORIO_TIPO_PENA:
          case this.SUSPENDIDA_TIPO_PENA:
          case this.VIDEOVIGILANCIA_TIPO_PENA:
            this.validarCamposPeriodoPena();
            this.listarReglasConducta();
            this.validacionReglasConducta();
            this.formPenas.get("penaConvertida")?.setValue(false);
            this.formPenas.get("sentenciaEjecProvicional")?.setValue(false);
            if (value == this.SUSPENDIDA_TIPO_PENA) {
              limpiarFormcontrol(this.formPenas.get('periodoPenaDiasPrueba'), [Validators.required]);
              limpiarFormcontrol(this.formPenas.get('periodoPenaMesesPrueba'), [Validators.required]);
              limpiarFormcontrol(this.formPenas.get('periodoPenaAnhosPrueba'), [Validators.required]);
              limpiarFormcontrol(this.formPenas.get('periodoPenaFechaInicioPrueba'), [Validators.required]);
              limpiarFormcontrol(this.formPenas.get('fechaPeriodoPenaPrueba'), [Validators.required]);
            }
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  limpiarInputsFlujosAlternativos() {
    const camposCambio = [
      { name: 'montoMultaPena', value: null },
      { name: 'periodoPenaDias', value: null },
      { name: 'periodoPenaMeses', value: null },
      { name: 'periodoPenaAnhos', value: null },
      { name: 'periodoPenaFechaInicio', value: null },
      { name: 'fechaPeriodoPena', value: { value: '', disabled: true } },
      { name: 'nroJornadasSemanales', value: null },
      { name: 'cadenaPerpetua', value: null },
      { name: 'penaConvertida', value: null },
      { name: 'sentenciaEjecProvicional', value: null },
      { name: 'fechaInicioRevisionCadenaPerpetua', value: null },
      { name: 'fechaRevisionCadenaPerpetua', value: { value: '', disabled: true } },
      { name: 'periodoPenaDiasPrueba', value: null },
      { name: 'periodoPenaMesesPrueba', value: null },
      { name: 'periodoPenaAnhosPrueba', value: null },
      { name: 'periodoPenaFechaInicioPrueba', value: null },
      { name: 'fechaPeriodoPenaPrueba', value: { value: '', disabled: true } }
    ];
    const formValues = camposCambio.reduce((acc: any, campo: any) => {
      acc[campo.name] = campo.value;
      limpiarFormcontrol(this.formPenas.get(campo.name), []);
      return acc;
    }, {});
    this.validarFechaPeriodoPena = false;
    this.validarFechaPeriodoPrueba = false;
    this.formPenas.patchValue(formValues);
    this.limpiarCheckboxReglasConducta();
  }
  validarCamposPeriodoPena() {
    limpiarFormcontrol(this.formPenas.get('periodoPenaDias'), [Validators.required]);
    limpiarFormcontrol(this.formPenas.get('periodoPenaMeses'), [Validators.required]);
    limpiarFormcontrol(this.formPenas.get('periodoPenaAnhos'), [Validators.required]);
    limpiarFormcontrol(this.formPenas.get('periodoPenaFechaInicio'), [Validators.required]);
    limpiarFormcontrol(this.formPenas.get('fechaPeriodoPena'), [Validators.required]);
  }
  validacionReglasConducta(): Boolean {
    const esPrivativaLibertadOtros = this.formPenas.value.clasePena === this.PRIVATIVA_LIBERTAD_CLASE_PENA
      && [this.RESERVA_FALLO_CONDENATORIO_TIPO_PENA, this.SUSPENDIDA_TIPO_PENA, this.VIDEOVIGILANCIA_TIPO_PENA].includes(this.formPenas.value.tipoPena);
    if (esPrivativaLibertadOtros) {
      const lista: [] = this.listaReglasConducta
        .filter((option: any, index: any) => this.formPenas.value.reglasConducta[index]);
      return lista.length > 0
    }
    return true;
  }
  calcularFechaPena(prueba: boolean) {
    let textInputPrueba: string = "";
    if (prueba) {
      textInputPrueba = "Prueba";
    }
    let dias = this.formPenas.get("periodoPenaDias" + textInputPrueba)?.value;
    let meses = this.formPenas.get("periodoPenaMeses" + textInputPrueba)?.value;
    let anhos = this.formPenas.get("periodoPenaAnhos" + textInputPrueba)?.value;
    let periodoPenaFechaInicio = this.formPenas.get("periodoPenaFechaInicio" + textInputPrueba)?.value;

    if (valid(dias) && valid(meses) && valid(anhos) && periodoPenaFechaInicio !== undefined && periodoPenaFechaInicio !== null) {
      const fechaInicial = dayjs(periodoPenaFechaInicio);
      const nuevaFecha = fechaInicial.add(anhos, 'year').add(meses, 'month').add(dias, 'day');
      this.formPenas.get("fechaPeriodoPena" + textInputPrueba)?.setValue(nuevaFecha.toDate());
      this.validBooleanFechaPena(prueba, true);
    }
    else {
      this.formPenas.get("fechaPeriodoPena" + textInputPrueba)?.setValue(null);
      this.validBooleanFechaPena(prueba, false);
    }
  }
  validBooleanFechaPena(prueba: boolean, valor: boolean) {
    this[prueba ? 'validarFechaPeriodoPrueba' : 'validarFechaPeriodoPena'] = valor;
  }

  convertirInputNumero(event: any, controlName: string): void {
    const inputValue = event.target.value;
    if (inputValue === '') {
      this.formPenas.get(controlName)?.setValue('');
    }
    else {
      const numericValue = parseInt(inputValue, 10);
      this.formPenas.get(controlName)?.setValue(String(numericValue), { emitEvent: false });
    }
  }

  validarPeriodoPena(): Boolean {
    const { clasePena, tipoPena, cadenaPerpetua } = this.formPenas.value;

    const esLimitativaDerecho = clasePena === this.LIMITATIVAS_DERECHO_CLASE_PENA
      && (tipoPena === this.INHABILITACION_ACCESORIA_TIPO_PENA || tipoPena === this.INHABILITACION_PRINCIPAL_TIPO_PENA);

    const esPrivativaLibertadEfectiva = clasePena === this.PRIVATIVA_LIBERTAD_CLASE_PENA
      && tipoPena === this.EFECTIVA_TIPO_PENA && !cadenaPerpetua;

    const esPrivativaLibertadOtros = clasePena === this.PRIVATIVA_LIBERTAD_CLASE_PENA
      && [this.RESERVA_FALLO_CONDENATORIO_TIPO_PENA, this.SUSPENDIDA_TIPO_PENA, this.VIDEOVIGILANCIA_TIPO_PENA].includes(tipoPena);

    return esLimitativaDerecho || esPrivativaLibertadEfectiva || esPrivativaLibertadOtros;
  }

  validarPenaConvertidaEjecucion(): Boolean {
    const { clasePena, tipoPena } = this.formPenas.value;
    const tiposPenaValidos = [
      this.EFECTIVA_TIPO_PENA,
      this.RESERVA_FALLO_CONDENATORIO_TIPO_PENA,
      this.SUSPENDIDA_TIPO_PENA,
      this.VIDEOVIGILANCIA_TIPO_PENA
    ];

    return clasePena === this.PRIVATIVA_LIBERTAD_CLASE_PENA && tiposPenaValidos.includes(tipoPena);
  }
  validarReglasConducta(): Boolean {
    const { clasePena, tipoPena } = this.formPenas.value;

    const tiposPenaValidos = [
      this.RESERVA_FALLO_CONDENATORIO_TIPO_PENA,
      this.SUSPENDIDA_TIPO_PENA,
      this.VIDEOVIGILANCIA_TIPO_PENA
    ];

    return clasePena === this.PRIVATIVA_LIBERTAD_CLASE_PENA && tiposPenaValidos.includes(tipoPena);
  }
  cambiarCadenaPerpetua(event: any) {
    this.formPenas.patchValue({
      periodoPenaDias: null,
      periodoPenaMeses: null,
      periodoPenaAnhos: null,
      periodoPenaFechaInicio: null,
      fechaPeriodoPena: { value: null, disabled: true },
      fechaInicioRevisionCadenaPerpetua: null,
      fechaRevisionCadenaPerpetua: { value: null, disabled: true }
    });
    if (event.checked) {
      limpiarFormcontrol(this.formPenas.get('fechaInicioRevisionCadenaPerpetua'), [Validators.required]);
      limpiarFormcontrol(this.formPenas.get('fechaRevisionCadenaPerpetua'), [Validators.required]);
      limpiarFormcontrol(this.formPenas.get('periodoPenaDias'), []);
      limpiarFormcontrol(this.formPenas.get('periodoPenaMeses'), []);
      limpiarFormcontrol(this.formPenas.get('periodoPenaAnhos'), []);
      limpiarFormcontrol(this.formPenas.get('periodoPenaFechaInicio'), []);
      limpiarFormcontrol(this.formPenas.get('fechaPeriodoPena'), []);
    }
    else {
      this.validarCamposPeriodoPena();
      limpiarFormcontrol(this.formPenas.get('fechaRevisionCadenaPerpetua'), []);
      limpiarFormcontrol(this.formPenas.get('fechaInicioRevisionCadenaPerpetua'), []);
    }
  }

  calcularCadenaPerpetua() {
    let fechaInicioRevisionCadenaPerpetua = this.formPenas.value.fechaInicioRevisionCadenaPerpetua;
    if (fechaInicioRevisionCadenaPerpetua !== undefined && fechaInicioRevisionCadenaPerpetua !== null) {
      const fechaInicial = dayjs(fechaInicioRevisionCadenaPerpetua);
      const nuevaFecha = fechaInicial.add(this.ANHOS_REVISION_CADENA_PERPETUA, 'year');
      this.formPenas.get("fechaRevisionCadenaPerpetua")?.setValue(nuevaFecha.toDate());
    }
    else {
      this.formPenas.get("fechaRevisionCadenaPerpetua")?.setValue(null);
    }
  }

  validarFechaPruebaPenal(): boolean {
    if (this.validarFechaPeriodoPrueba && this.validarFechaPeriodoPena) {
      const dias = this.formPenas.get("periodoPenaDias")?.value || 0;
      const meses = this.formPenas.get("periodoPenaMeses")?.value || 0;
      const anhos = this.formPenas.get("periodoPenaAnhos")?.value || 0;
      const diasPrueba = this.formPenas.get("periodoPenaDiasPrueba")?.value || 0;
      const mesesPrueba = this.formPenas.get("periodoPenaMesesPrueba")?.value || 0;
      const anhosPrueba = this.formPenas.get("periodoPenaAnhosPrueba")?.value || 0;
      const hoy = dayjs();
      const fechaPenal = hoy.add(anhos, 'year').add(meses, 'month').add(dias, 'day');
      const fechaPenalPrueba = hoy.add(anhosPrueba, 'year').add(mesesPrueba, 'month').add(diasPrueba, 'day');
      return fechaPenal.isAfter(fechaPenalPrueba) || fechaPenal.isSame(fechaPenalPrueba);
    }
    return true;
  }

  validarIngresoDePeriodoPena(): boolean {
    if ((
      (this.formPenas.get('clasePena')?.value === this.LIMITATIVAS_DERECHO_CLASE_PENA &&
        (this.formPenas.get('tipoPena')?.value === this.INHABILITACION_ACCESORIA_TIPO_PENA
          || this.formPenas.get('tipoPena')?.value === this.INHABILITACION_PRINCIPAL_TIPO_PENA)
      ) ||
      (
        this.formPenas.get('clasePena')?.value === this.PRIVATIVA_LIBERTAD_CLASE_PENA &&
        ((this.formPenas.get('tipoPena')?.value === this.EFECTIVA_TIPO_PENA && !this.formPenas.get('cadenaPerpetua')?.value)
          || this.formPenas.get('tipoPena')?.value === this.RESERVA_FALLO_CONDENATORIO_TIPO_PENA
          || this.formPenas.get('tipoPena')?.value === this.VIDEOVIGILANCIA_TIPO_PENA)
      )
    ) && (
        (this.formPenas.controls['periodoPenaDias'].value === '0'
          && this.formPenas.controls['periodoPenaMeses'].value === '0'
          && this.formPenas.controls['periodoPenaAnhos'].value === '0'
        )
      )
    ) {
      return false;
    } else if (
      this.formPenas.get('clasePena')?.value === this.PRIVATIVA_LIBERTAD_CLASE_PENA
      && this.formPenas.get('tipoPena')?.value === this.SUSPENDIDA_TIPO_PENA &&
      (
        (this.formPenas.controls['periodoPenaDias'].value === '0'
          && this.formPenas.controls['periodoPenaMeses'].value === '0'
          && this.formPenas.controls['periodoPenaAnhos'].value === '0'
        ) || (this.formPenas.controls['periodoPenaDiasPrueba'].value === '0'
          && this.formPenas.controls['periodoPenaMesesPrueba'].value === '0'
          && this.formPenas.controls['periodoPenaAnhosPrueba'].value === '0'
        )
      )
    ) {
      return false;
    }
    return true;
  }

  guardar() {
    const request = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: this.formPenas.get('sujeto')?.value,
      idDelitoSujeto: this.formPenas.get('delito')?.value,
      idTipoPena: this.formPenas.get('tipoPena')?.value,
      idPena: this.idPena
    }

    this.subscriptions.push(
      this.registrarPenasService.validar(request).subscribe({
        next: resp => {
          const sujeto = this.listaSujetoProcesal.find((item: any) => item.id === this.formPenas.get("sujeto")?.value).nombre;
          const delito = this.listaDelitos.find((item: any) => item.id === this.formPenas.get("delito")?.value).nombre;
          if (resp?.code === "0" && resp?.message === 'DUPLICADO') {
            this.modalDialogService.warning("REGISTRO DUPLICADO", `Los datos de la pena a ingresar para el sujeto procesal ${sujeto} con el delito ${delito} ya se encuentra registrado. Por favor, verifique la información e intentelo nuevamente`, 'Aceptar');
          }
          else if (resp?.code === "0" && resp?.message === 'SENTENCIA DELITO') {
            this.modalDialogService.warning("REGISTRO DUPLICADO", `Los datos del sujeto procesal ${sujeto} con el delito ${delito} ya se encuentra registrado en otra sentencia. Por favor, verifique la información e intentelo nuevamente`, 'Aceptar');
          }
          else {
            this.agregarEditarPena();
          }
        },
        error: () => {
          this.modalDialogService.error("Error", "Se ha producido un error al intentar validar la existencia de la pena", 'Ok');
        }
      })
    )
  }
  agregarEditarPena() {

    const request = { ...this.formPenas.getRawValue() };
    const reglasConductaId = this.listaReglasConducta
      .filter((option: any, index: any) => this.formPenas.value.reglasConducta[index])
      .map((option: any) => option.id);
    request.reglasConducta = reglasConductaId;
    if (request.fechaPeriodoPena?.disabled != undefined) {
      request.fechaPeriodoPena = null;
    }
    if (request.fechaPeriodoPenaPrueba?.disabled != undefined) {
      request.fechaPeriodoPenaPrueba = null;
    }
    if (request.fechaRevisionCadenaPerpetua?.disabled != undefined) {
      request.fechaRevisionCadenaPerpetua = null;
    }
 
    request.montoMultaPena = convertirStringAmericanoANumero(request.montoMultaPena);
    
    request.idActoTramiteCaso = this.idActoTramiteCaso;

    request.tipoSentencia = this.tipoSentencia;
    request.idActoTramiteDelitoSujeto = this.idActoTramiteDelitoSujeto;
    request.idPena = this.idPena;

    let text: string = "Se registro correctamente";
    let textError: string = "registrar";
    if (this.accion == TIPO_ACCION.EDITAR) {
      text = "Se editó correctamente";
      textError = "editar";
    }

    this.subscriptions.push(
      this.registrarPenasService.crearEditarPena(request).subscribe({
        next: resp => {
          if (resp?.code === "0") {
            this.modalDialogService.success("Exito", `${text} la pena`, 'Ok');
            this.salirFormulario(true);
            this.limpiarInputs();
          }
        },
        error: error => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar ${textError} la pena`, 'Ok');
        }
      })
    )


  }

  limpiarInputs() {
    this.formPenas.reset();
    this.limpiarInputsFlujosAlternativos();
    this.formPenas.get("reparacionCivil")?.setValue(false);
    this.listaTipoPenas = []

  }

  validarMensajesErrorEspeciales(): boolean {
    const form = this.formPenas.controls;


    if (
      ((
        (this.formPenas.get('clasePena')?.value === this.LIMITATIVAS_DERECHO_CLASE_PENA &&
          (this.formPenas.get('tipoPena')?.value === this.INHABILITACION_ACCESORIA_TIPO_PENA
            || this.formPenas.get('tipoPena')?.value === this.INHABILITACION_PRINCIPAL_TIPO_PENA)
        ) ||
        (
          this.formPenas.get('clasePena')?.value === this.PRIVATIVA_LIBERTAD_CLASE_PENA &&
          ((this.formPenas.get('tipoPena')?.value === this.EFECTIVA_TIPO_PENA && !this.formPenas.get('cadenaPerpetua')?.value)
            || this.formPenas.get('tipoPena')?.value === this.RESERVA_FALLO_CONDENATORIO_TIPO_PENA
            || this.formPenas.get('tipoPena')?.value === this.VIDEOVIGILANCIA_TIPO_PENA)
        )
      ) &&
        (this.formPenas.controls['periodoPenaDias'].value === '0'
          && this.formPenas.controls['periodoPenaMeses'].value === '0'
          && this.formPenas.controls['periodoPenaAnhos'].value === '0'
        )
      )) {

      this.txtMensajeError = "Por favor completar mínimo los datos obligatorios solicitados para el periodo de pena";
    } else if (
      (
        this.formPenas.get('clasePena')?.value === this.PRIVATIVA_LIBERTAD_CLASE_PENA
        && this.formPenas.get('tipoPena')?.value === this.SUSPENDIDA_TIPO_PENA &&
        (
          (this.formPenas.controls['periodoPenaDias'].value === '0'
            && this.formPenas.controls['periodoPenaMeses'].value === '0'
            && this.formPenas.controls['periodoPenaAnhos'].value === '0'
          ) || (this.formPenas.controls['periodoPenaDiasPrueba'].value === '0'
            && this.formPenas.controls['periodoPenaMesesPrueba'].value === '0'
            && this.formPenas.controls['periodoPenaAnhosPrueba'].value === '0'
          )
        )
      )
    ) {
      this.txtMensajeError = "Por favor completar mínimo los datos obligatorios solicitados para el periodo de prueba";
    } else {
      this.txtMensajeError = "";
    }
    return this.txtMensajeError !== "";
  }
  salirFormulario(respuesta: any = null) {
    this.respuestaFormulario.emit({ respuesta: respuesta });
  }
  validarRango(event: KeyboardEvent, minimo: number, maximo: number) {
    let valor = (event.target as HTMLInputElement).value + event.key;

    if (parseInt(valor, minimo) > maximo) {
      event.preventDefault();
    }
  }

}


