import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MaestroService } from '@core/services/shared/maestro.service';
import { CmpLibModule } from 'dist/cmp-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { actualizarContadorInputTextArea, convertirStringAmericanoANumero, formatearNumeroAmericano, getDateFromString, limpiarFormcontrol, validarRangoMontoAmericano } from '@core/utils/utils';
import { icono, IconUtil, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { DigitOnlyModule } from '@core/directives/digit-only.module';
import { TableModule } from 'primeng/table';
import { DateMaskModule } from '@core/directives/date-mask.module';
import dayjs from 'dayjs';
import { MensajeCompletarCamposComponent } from '@core/components/mensajes/mensaje-completar-campos/mensaje-completar-campos.component';
import { valid } from '@core/utils/string';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';
import { DatosEditarReparacionCivil } from '@core/interfaces/reusables/reparacion-civil/datos-editar-reparacion-civil';
import { AcuerdosActasService } from '@core/services/reusables/efe/acuerdos-actas/acuerdos-actas.service';
import { DatosGenericosInput } from '@core/interfaces/reusables/generico/datos-genericos-input';
import { ACUERDO_ACTA } from '@core/types/reutilizable/acuerdo-acta.type';
import { DatosAcuerdoActa } from '@core/interfaces/reusables/acuerdo-acta/datos-acuerdo-acta';
import { DatosAcuerdoActaReparacionCivil } from '@core/interfaces/reusables/acuerdo-acta/datos-acuerdo-acta-reparacion-civil';
import { REPARACION_CIVIL } from '@core/types/reutilizable/reparacion-civil.type';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { convertStringToDate } from '@core/utils/date';

@Component({
  selector: 'app-registrar-acuerdo-acta',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    MessagesModule,
    InputTextareaModule,
    RadioButtonModule,
    InputTextModule,
    CalendarModule,
    CheckboxModule,
    DigitOnlyModule,
    TableModule,
    DateMaskModule,
    MensajeCompletarCamposComponent,
    ValidationModule
  ],
  providers: [NgxCfngCoreModalDialogService],
  templateUrl: './registrar-acuerdo-acta.component.html',
  styleUrl: './registrar-acuerdo-acta.component.scss'
})
export class RegistrarAcuerdoActaComponent {

  @Input() data!: DatosGenericosInput;

  @Input() modoLectura!: boolean;

  @Input() enviarDatosAcuerdoActa!: BehaviorSubject<DatosAcuerdoActa | null>;

  datosAcuerdoActa: DatosAcuerdoActa | null = null;

  @Output() guardadoAccion = new EventEmitter<any>();

  @Output() enviarEstadoBoton = new EventEmitter<boolean>(); //Exclusivo para Reparación Civil

  formAcuerdoActa!: FormGroup;

  idCaso!: string;

  idActoTramiteCaso!: string;

  ACUERDO_ACTA = ACUERDO_ACTA;

  REPARACION_CIVIL = REPARACION_CIVIL;

  private readonly subscriptions: Subscription[] = [];

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  protected actualizarContadorInputTextArea = actualizarContadorInputTextArea;

  protected valid = valid;

  protected caracteresRestantesObservacion: number = ACUERDO_ACTA.OBSERVACION_LENGTH;

  protected caracteresRestantesAcuerdo: number = ACUERDO_ACTA.OBSERVACION_OTROS_ACUERDOS_LENGTH;

  protected visibleMensajeError: boolean = false;

  protected txtMensajeError: string = "";

  protected porcentajeMinisterio: number = 0.1;

  protected listaBanco: any = [];

  protected listaTipoPago: any = [];

  protected listaPeriodicidad: any = [];
  
  protected fechaActual: Date | null = null;
  
  protected fechaMinimaPago: Date | null = null;

  protected fechaMaximoPago: Date | null = null;

  protected fechaMaximoPenalDay: any = null;

  protected fechaMaximoPenal: Date | null = null;

  constructor(
    private readonly maestroService: MaestroService,
    private readonly acuerdosActasService: AcuerdosActasService,
    private readonly fb: FormBuilder,
    private readonly gestionCasoService: GestionCasoService,
    protected iconUtil: IconUtil,

  ) {
    this.formBuild();
    this.cuotas.valueChanges.subscribe(() => this.validarOrdenFecha())
    this.fechaActual = dayjs().toDate();
    this.fechaMinimaPago= getDateFromString(this.gestionCasoService.expedienteActual.fechaHecho);
    this.fechaMaximoPago = dayjs().add(12, 'month').toDate();
    this.fechaMaximoPenalDay=dayjs().add(35, 'year');
    this.fechaMaximoPenal = this.fechaMaximoPenalDay.toDate();
  }
  ngOnInit() {
    this.idCaso = this.data.idCaso;
    this.idActoTramiteCaso = this.data.idActoTramiteCaso;
    this.subscriptions.push(
      this.enviarDatosAcuerdoActa.subscribe((datosAcuerdoActa) => {
        this.datosAcuerdoActa = datosAcuerdoActa ?? null;
        if (this.datosAcuerdoActa) {
          console.log(this.datosAcuerdoActa)
          this.limpiarFormulario();
          this.listarTipoPago();
          this.obtenerAcuerdosDatos();
          //VALIDACION DE MODO LECTURA

          if (this.modoLectura) {
            Object.keys(this.formAcuerdoActa.controls).forEach((controlName) => {
              if (controlName !== 'tipoPagoTotal') {
                this.formAcuerdoActa.get(controlName)?.disable();
              }
            });
            this.formAcuerdoActa.get('tipoPagoTotal')?.disable({ emitEvent: true });
          }
          else if (!this.datosAcuerdoActa?.idAcuerdosActa) {
            this.mostrarMensajeError("Pendiente de registrar información");
          }

        }})
      );

      this.formAcuerdoActa.statusChanges.subscribe(() => {

        if(this.visibleMensajeError && !this.formAcuerdoActa.invalid) this.visibleMensajeError=false

        this.enviarEstadoBoton.emit(this.formAcuerdoActa.invalid);
      });
  }

  formBuild() {
    this.formAcuerdoActa = this.fb.group({
      tipoPagoTotal: [ACUERDO_ACTA.PAGO_TOTAL, [Validators.required]],
      tipoPago: [null, [Validators.required]],
      codigoDepositoJudicial: [null],
      banco: [null],
      nroCuenta: [null],
      montoTotalPago: [null, [Validators.required, validarRangoMontoAmericano(0.99,REPARACION_CIVIL.LIMITE_MONTO)]],
      checkMontoMinisterio: [false],
      montoMinisterio: [{ value: '', disabled: true }],
      fechaInicioPago: [null, [Validators.required]],
      nroCuotas: [null],
      periodicidad: [null],
      rangoDiasPeriodicidad: [null],
      observaciones: ['', [Validators.required, Validators.maxLength(1000)]],
      otrosAcuerdos: [false],
      fechaOtrosAcuerdo: [null],
      detalleOtrosAcuerdo: [''],
      checkFechaLimiteAcuerdo: [false],
      cuotas: this.fb.array([]),
      fechaLimiteAcuerdo: [null],
    });
  }

  get cuotas(): FormArray {
    return this.formAcuerdoActa.get('cuotas') as FormArray;
  }

  obtenerAcuerdosDatos() {
    if (this.datosAcuerdoActa?.idAcuerdosActa) {
      this.subscriptions.push(
        this.acuerdosActasService.obtenerAcuerdosDatos(this.datosAcuerdoActa?.idAcuerdosActa).subscribe({

          next: resp => {
            this.cambiarTipoReparacion(resp.tipoPagoTotal);
            this.cambiarTipoPago(resp.tipoPago);
            this.cambiarOtrosAcuerdos(resp.otrosAcuerdos);
            this.cambiarFechaLimiteAcuerdo(resp.checkFechaLimiteAcuerdo);
            this.formAcuerdoActa.patchValue({
              tipoPagoTotal: resp.tipoPagoTotal,
              tipoPago: resp.tipoPago,
              codigoDepositoJudicial: resp.codigoDepositoJudicial,
              banco: resp.banco,
              nroCuenta: resp.nroCuenta,
              montoTotalPago: formatearNumeroAmericano(resp.montoTotalPago),
              checkMontoMinisterio: resp.checkMontoMinisterio,
              montoMinisterio: Number(resp.montoMinisterio) > 0 ? formatearNumeroAmericano(resp.montoMinisterio) : null,
              fechaInicioPago: convertStringToDate(resp.fechaInicioPago),
              nroCuotas: resp.nroCuotas,
              periodicidad: resp.periodicidad,
              rangoDiasPeriodicidad: resp.rangoDiasPeriodicidad,
              observaciones: resp.observaciones,
              otrosAcuerdos: resp.otrosAcuerdos,
              fechaOtrosAcuerdo: convertStringToDate(resp.fechaOtrosAcuerdo),
              detalleOtrosAcuerdo: resp.detalleOtrosAcuerdo,
              checkFechaLimiteAcuerdo: resp.checkFechaLimiteAcuerdo,
              fechaLimiteAcuerdo: convertStringToDate(resp.fechaLimiteAcuerdo),
            });
            if (valid(resp.observaciones)) {
              this.caracteresRestantesObservacion = this.caracteresRestantesObservacion - String(resp.observaciones).length
            }
            if (valid(resp.observaciones)) {
              this.caracteresRestantesAcuerdo = this.caracteresRestantesAcuerdo - String(resp.detalleOtrosAcuerdo).length
            }
            if (resp.tipoPagoTotal == ACUERDO_ACTA.PAGO_PARCIAL) {
              resp.cuotas.forEach((item: any) => {
                this.agregarCuota(item.monto, convertStringToDate(item.fecha))
              });
            }
          },
          error: error => {
            this.modalDialogService.error("Error", `Se ha producido un error al intentar recuperar la información de la reparación civil`, 'Aceptar');
          }
        })
      )
    }
  }

  limpiarFormulario() {
    this.formAcuerdoActa.patchValue({
      tipoPagoTotal: ACUERDO_ACTA.PAGO_TOTAL,
      tipoPago: null,
      codigoDepositoJudicial: null,
      banco: null,
      nroCuenta: null,
      montoTotalPago: null,
      checkMontoMinisterio: false,
      montoMinisterio: '',
      fechaInicioPago: null,
      nroCuotas: null,
      periodicidad: null,
      rangoDiasPeriodicidad: null,
      observaciones: '',
      otrosAcuerdos: false,
      fechaOtrosAcuerdo: null,
      detalleOtrosAcuerdo: '',
      checkFechaLimiteAcuerdo: false,
      fechaLimiteAcuerdo: null
    });
    this.resetearCuotas();
    limpiarFormcontrol(this.formAcuerdoActa.get('codigoDepositoJudicial'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('banco'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('nroCuenta'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('nroCuotas'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('periodicidad'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('rangoDiasPeriodicidad'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('fechaOtrosAcuerdo'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('detalleOtrosAcuerdo'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('fechaLimiteAcuerdo'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('cuotas'), []);
    this.caracteresRestantesObservacion = ACUERDO_ACTA.OBSERVACION_LENGTH;
    this.caracteresRestantesAcuerdo = ACUERDO_ACTA.OBSERVACION_OTROS_ACUERDOS_LENGTH;
    this.visibleMensajeError = false;
    this.txtMensajeError = "";
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  listarTipoPago() {
    if (this.listaTipoPago.length == 0) {
      this.maestroService.listaTipoAcuerdoActa().subscribe({
        next: resp => {
          this.listaTipoPago = resp.data
        }
      })
    }
  }
  listarPeriodicidad() {
    this.maestroService.obtenerCatalogo('ID_N_PERIODICIDAD_ACUERDO').subscribe({
      next: resp => {
        this.listaPeriodicidad = resp.data
      }
    })
  }
  listarBancos() {
    this.maestroService.listaBancos().subscribe({
      next: resp => {
        this.listaBanco = resp.data
      }
    })
  }
  mostrarMensajeError(text: string) {
    this.txtMensajeError = text;
    this.visibleMensajeError = true;
  }

  cambiarTipoReparacion(value: any) {
    this.resetearCuotas();
    this.formAcuerdoActa.patchValue({
      nroCuotas: null,
      periodicidad: null,
      rangoDiasPeriodicidad: null,
    });
    limpiarFormcontrol(this.formAcuerdoActa.get('nroCuotas'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('periodicidad'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('rangoDiasPeriodicidad'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('cuotas'), []);

    if (value == ACUERDO_ACTA.PAGO_PARCIAL) {
      if (this.listaPeriodicidad.length == 0) {
        this.listarPeriodicidad();
      }
      limpiarFormcontrol(this.formAcuerdoActa.get('nroCuotas'), [Validators.required, this.validarTiempoValido()]);
      limpiarFormcontrol(this.formAcuerdoActa.get('cuotas'), [Validators.required, this.validarOrdenFechas]);
      limpiarFormcontrol(this.formAcuerdoActa.get('periodicidad'), [Validators.required]);
    }
  }
  cambiarTipoPago(value: any) {
    this.formAcuerdoActa.patchValue({
      codigoDepositoJudicial: null,
      banco: null,
      nroCuenta: null
    });
    limpiarFormcontrol(this.formAcuerdoActa.get('banco'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('nroCuenta'), []);
    limpiarFormcontrol(this.formAcuerdoActa.get('codigoDepositoJudicial'), []);
    switch (value) {
      case ACUERDO_ACTA.DEPOSITO_JUDICIAL:
        limpiarFormcontrol(this.formAcuerdoActa.get('codigoDepositoJudicial'), [Validators.required]);
        break;
      case ACUERDO_ACTA.DEPOSITO_CUENTA_AGRAVIADO:
        if (this.listaBanco.length == 0) {
          this.listarBancos();
        }
        limpiarFormcontrol(this.formAcuerdoActa.get('banco'), [Validators.required]);
        limpiarFormcontrol(this.formAcuerdoActa.get('nroCuenta'), [Validators.required]);
        break;
    }
  }
  cambiarPeriodicidad(value: any) {
    this.formAcuerdoActa.get('rangoDiasPeriodicidad')?.setValue(null);
    if (value == ACUERDO_ACTA.PERIODICIDAD_PERSONALIZADO) {
      limpiarFormcontrol(this.formAcuerdoActa.get('rangoDiasPeriodicidad'), [Validators.required, validarRangoMontoAmericano(0,999)]);
    }
    else {
      limpiarFormcontrol(this.formAcuerdoActa.get('rangoDiasPeriodicidad'), []);
    }
  }

  formatearMonto(input: string) {
    if (this.formAcuerdoActa.get(input)?.value) {
      this.formAcuerdoActa.get(input)?.setValue(formatearNumeroAmericano(this.formAcuerdoActa.get(input)?.value));
    }
  }
  formatearMontoCuotas(index: number) {
    const control = this.cuotas.at(index).get('monto');
    if (control?.value) {
      control.setValue(formatearNumeroAmericano(control.value));
    }
  }

  calcularMontoMinisterio() {
    const monto: number = convertirStringAmericanoANumero(this.formAcuerdoActa.value.montoTotalPago);
    if (this.porcentajeMinisterio > 0 &&
      this.formAcuerdoActa.value.checkMontoMinisterio
      && this.formAcuerdoActa.value.montoTotalPago
      && !isNaN(monto)) {
      this.formAcuerdoActa.get("montoMinisterio")?.setValue(formatearNumeroAmericano(monto * this.porcentajeMinisterio));
    }
    else {
      this.formAcuerdoActa.get("montoMinisterio")?.setValue(null);
    }
  }

  cambiarOtrosAcuerdos(value: boolean) {
    this.formAcuerdoActa.patchValue({
      fechaOtrosAcuerdo: null,
      detalleOtrosAcuerdo: '',
      checkFechaLimiteAcuerdo: false,
      fechaLimiteAcuerdo: null,
    });
    this.caracteresRestantesAcuerdo = 1000;
    limpiarFormcontrol(this.formAcuerdoActa.get('fechaLimiteAcuerdo'), []);
    if (value) {
      limpiarFormcontrol(this.formAcuerdoActa.get('fechaOtrosAcuerdo'), [Validators.required]);
      limpiarFormcontrol(this.formAcuerdoActa.get('detalleOtrosAcuerdo'), [Validators.required, Validators.maxLength(1000)]);
    }
    else {
      limpiarFormcontrol(this.formAcuerdoActa.get('fechaOtrosAcuerdo'), []);
      limpiarFormcontrol(this.formAcuerdoActa.get('detalleOtrosAcuerdo'), []);
    }
  }
  cambiarFechaLimiteAcuerdo(value: boolean) {
    this.caracteresRestantesAcuerdo = 1000;
    this.formAcuerdoActa.get("fechaLimiteAcuerdo")?.setValue(null);
    if (value) {
      limpiarFormcontrol(this.formAcuerdoActa.get('fechaLimiteAcuerdo'), [Validators.required]);
    }
    else {
      limpiarFormcontrol(this.formAcuerdoActa.get('fechaLimiteAcuerdo'), []);
    }
  }

  protected eventoContadorInputTextArea(e: Event) {
    return actualizarContadorInputTextArea(
      1000,
      (e.target as HTMLTextAreaElement).value
    );
  }

  validarGeneracionCuotas(): boolean {
    return (!this.formAcuerdoActa.get('nroCuotas')?.errors &&
      !this.formAcuerdoActa.get('montoTotalPago')?.errors &&
      !this.formAcuerdoActa.get('periodicidad')?.errors &&
      !this.formAcuerdoActa.get('fechaInicioPago')?.errors &&
      !this.formAcuerdoActa.get('rangoDiasPeriodicidad')?.errors
    );
  }
  
  generarCuotas() {
    const numeroCuotas: number = Number(this.formAcuerdoActa.value.nroCuotas);
    if (numeroCuotas >= 100 || numeroCuotas <= 0) {
      this.mostrarMensajeError("Debes agregar un número de cuotas válido");
      return;
    }
    const montoTotal: number = convertirStringAmericanoANumero(this.formAcuerdoActa.value.montoTotalPago);
    const fechaInicio: any = this.formAcuerdoActa.value.fechaInicioPago;
    let diasEntreCuotas: number = 0;
    this.resetearCuotas();

    const montoPorCuota = parseFloat((montoTotal / numeroCuotas).toFixed(2));
    let fechaPago = dayjs(fechaInicio);

    for (let i = 0; i < numeroCuotas; i++) {
      switch (this.formAcuerdoActa.value.periodicidad) {
        case ACUERDO_ACTA.PERIODICIDAD_QUINCENAL:
          if (i > 0) {
            fechaPago = fechaPago.add(15, 'day'); // Sumar 15 días solo después de la primera cuota
          }
          this.formAcuerdoActa.get('rangoDiasPeriodicidad')?.setValue("15");
          break;
        case ACUERDO_ACTA.PERIODICIDAD_MENSUAL:
          if (i > 0) {
            fechaPago = fechaPago.add(1, 'month'); // Sumar 1 mes solo después de la primera cuota
          }
          this.formAcuerdoActa.get('rangoDiasPeriodicidad')?.setValue("30");
          break;
        default:
          diasEntreCuotas = this.formAcuerdoActa.value.rangoDiasPeriodicidad;
          if (i > 0) {
            fechaPago = fechaPago.add(diasEntreCuotas, 'day'); // Sumar días solo después de la primera cuota
          }
          break;
      }

      if(fechaPago.isAfter(this.fechaMaximoPenalDay)){
        this.modalDialogService.error(
          "No puede continuar con la generación de las cuotas",
          `Una de las fechas generadas para las cuotas excede el límite permitido de 35 años desde la fecha actual (${this.fechaMaximoPenalDay.format('DD/MM/YYYY')}).`,
          "Aceptar"
        );
        this.resetearCuotas();
        return;
      }
      // Ajustar el monto de la última cuota para evitar diferencias por redondeo
      const montoCuota = i === numeroCuotas - 1 ? montoTotal - (montoPorCuota * i) : montoPorCuota;
      // Agregar la cuota con la fecha y el monto calculados
      this.agregarCuota(montoCuota, fechaPago.toDate());
    }
  }


  agregarCuota(monto: number = 0, fecha: any = null): void {
    const cuotaFormGroup = this.fb.group({
      monto: new FormControl(
        { value: formatearNumeroAmericano(monto), disabled: this.modoLectura },
        [Validators.required, validarRangoMontoAmericano(0,REPARACION_CIVIL.LIMITE_MONTO)]
      ),
      fecha: new FormControl(
        { value: fecha, disabled: this.modoLectura },
        [Validators.required]
      )
    });

    this.cuotas.push(cuotaFormGroup);
  }
  eliminarCuota(index: number): void {
    this.cuotas.removeAt(index);
    this.actualizarMontoTotal();
  }

  agregarCuotasVacias() {
    if (this.validarTodosLosCamposCuotas()) {
      this.agregarCuota();
    }
    else {
      this.mostrarMensajeError("Debes completar y validar que todo este correcto para agregar otra nueva cuota");
    }
  }

  validarTodosLosCamposCuotas(): boolean {
    let todosValidos = true;
    if (this.cuotas.invalid) {
      todosValidos = false;
    }
    this.cuotas.controls.forEach(control => {
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
          const campo = control.get(key);
          campo?.markAsTouched();
          if (campo?.invalid) {
            todosValidos = false;
          }
        });
      }
    });
    return todosValidos;
  }
  validarOrdenFechas(formArray: AbstractControl): ValidationErrors | null {
    const dates = (formArray as FormArray).controls.map(control => control.get('fecha')?.value);
    for (let i = 1; i < dates.length; i++) {
      if (dayjs(dates[i]).isBefore(dayjs(dates[i - 1])) || dayjs(dates[i]).isSame(dayjs(dates[i - 1]))) {
        return { validarOrdenFechas: 'validarOrdenFechas' };
      }
    }
    return null;
  }

  validarTiempoValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value !== null && (isNaN(value) || value <= 1)) {
        return { validarTiempoValido: true };
      }
      return null;
    };
  }
  actualizarMontoTotal() {
    const total = this.cuotas.controls.reduce((acc, control) => {
      const monto = convertirStringAmericanoANumero(control.get('monto')?.value);
      return acc + (monto || 0);
    }, 0);
    const totalPago = total > 0 ? formatearNumeroAmericano(total) : null;
    this.formAcuerdoActa.get('montoTotalPago')?.setValue(totalPago);
    const nroCuotasAcualizadas = this.cuotas.value.length > 0 ? this.cuotas.value.length : null;
    this.formAcuerdoActa.get('nroCuotas')?.setValue(nroCuotasAcualizadas);
    this.calcularMontoMinisterio();
  }

  resetearCuotas() {
    this.cuotas.clear();
  }

  validarReseteoCuotasPorInputs() {
    if (this.cuotas.controls.length > 0) {
      this.resetearCuotas();
      this.mostrarMensajeError('Al modificar el “Monto de la reparación civil”, se debe volver a generar las cuotas.');
    }
  }

  validarOrdenFecha() {
    const errores = this.formAcuerdoActa.get('cuotas')?.errors;
    if (errores?.['validarOrdenFechas']) {
      this.mostrarMensajeError('Las fechas de las cuotas deben estar en orden ascendente y sin repetir días.');
    }
  }

  devolverCuotasFormateada() {
    if (this.formAcuerdoActa.value.tipoPagoTotal == ACUERDO_ACTA.PAGO_PARCIAL) {
      return this.cuotas.value.map((item: any, index: any) => ({
        ...item,
        monto: convertirStringAmericanoANumero(item.monto),
        nroCuota: index + 1
      }));
    }
    else {
      //SI ES PAGO TOTAL DEBE DEVOLVER SI O SI UNA SOLA CUOTA
      return [
        {
          nroCuota: 1,
          monto: convertirStringAmericanoANumero(this.formAcuerdoActa.value.montoTotalPago),
          fecha: this.formAcuerdoActa.value.fechaInicioPago
        }
      ]
    }
  }
  devolverNroCuotas(): number {
    if (this.formAcuerdoActa.value.tipoPagoTotal == ACUERDO_ACTA.PAGO_PARCIAL) {
      return Number(this.formAcuerdoActa.value.nroCuotas)
    }
    else {
      return 1
    }
  }

  guardar() {
    if (this.datosAcuerdoActa?.idSujetoCaso != null && this.datosAcuerdoActa?.idAcuerdosActa == null) {
      const dialog = this.modalDialogService.question("Acuerdo del Acta", "¿Está seguro de generar el acuerdo del acta?", 'Si', 'No');
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.guardarAcuerdoActa();
          }
        }
      });
    }
    else {
      this.guardarAcuerdoActa();
    }
  }

  guardarAcuerdoActa() {
    const formValues=this.formAcuerdoActa.getRawValue()
    const request = {
      ...formValues,
      idAcuerdosActa: this.datosAcuerdoActa?.idAcuerdosActa,
      idDenunciado: null,
      idCaso: this.idCaso,
      fechaAcuerdoActa: null,
      descripcionAcuerdoActa: null,
      porcentajeMinisterio: this.porcentajeMinisterio,
      tipoOtros: '0',
      tipoPagoReparacion: null,
      cantidadCuotas: this.cuotas.length,
      tipoMoneda: ACUERDO_ACTA.MONEDA_NUEVO_SOL,
      idReparacionCivil: null,//this.datosAcuerdoActa?.reparacionCivil?.idReparacionCivil,
      cuotas: this.devolverCuotasFormateada(),
      nroCuotas: this.devolverNroCuotas(),
      idActoTramiteCaso: this.idActoTramiteCaso,
      idSujetoCaso: this.datosAcuerdoActa?.idSujetoCaso,
      montoTotalPago:convertirStringAmericanoANumero(formValues.montoTotalPago),
      montoMinisterio:convertirStringAmericanoANumero(formValues.montoMinisterio),
    };
    this.subscriptions.push(
      this.acuerdosActasService.registrarEditar(request).subscribe({
        next: resp => {
          if (resp?.code === '200') {
            this.guardadoAccion.emit(true);
          }
        },
        error: error => {
          this.modalDialogService.error("Error", `Se ha producido un error al intentar registrar los acuerdos actos`, 'Aceptar');
        }
      })
    )
  }


  /**
   * guardarReparacionCivil -> Función exclusiva para el proceso de Reparación Civil
  **/

  async guardarAcuerdoActaReparacionCivil(idReparacionCivil: string = ''): Promise<DatosEditarReparacionCivil | null> {
    if (this.datosAcuerdoActa?.reparacionCivil) {
      const dataReparacion: DatosAcuerdoActaReparacionCivil = this.datosAcuerdoActa?.reparacionCivil;

      if (dataReparacion.pendienteRegistrar && idReparacionCivil !== '') {
        dataReparacion.idReparacionCivil = idReparacionCivil;
      }
      const formValues=this.formAcuerdoActa.getRawValue()
      const request = {
        ...formValues,
        idAcuerdosActa: dataReparacion.pendienteRegistrar ? null : this.datosAcuerdoActa?.idAcuerdosActa,
        idDenunciado: null,
        idCaso: this.idCaso,
        fechaAcuerdoActa: null,
        descripcionAcuerdoActa: null,
        porcentajeMinisterio: this.porcentajeMinisterio,
        tipoOtros: '0',
        tipoPagoReparacion: null,
        cantidadCuotas: this.cuotas.length,
        tipoMoneda: ACUERDO_ACTA.MONEDA_NUEVO_SOL,
        idReparacionCivil: dataReparacion.idReparacionCivil,
        cuotas: this.devolverCuotasFormateada(),
        nroCuotas: this.devolverNroCuotas(),
        idActoTramiteCaso:this.idActoTramiteCaso,
        montoTotalPago:convertirStringAmericanoANumero(formValues.montoTotalPago),
        montoMinisterio:convertirStringAmericanoANumero(formValues.montoMinisterio),
      };
      try {
        const resp = await firstValueFrom(this.acuerdosActasService.registrarEditar(request));
        if (resp?.code === '200') {
          const datosEditarReparacionCivil: DatosEditarReparacionCivil = {
            idReparacionCivil: dataReparacion.idReparacionCivil,
            pendienteRegistrar: dataReparacion.pendienteRegistrar,
            codReparacionCivil: dataReparacion.codReparacionCivil,
            idAcuerdosActa: this.datosAcuerdoActa?.idAcuerdosActa
          }
          return datosEditarReparacionCivil;
        } else {
          console.warn('Error en la respuesta del servicio:', resp);
          return null;
        }


      } catch (error) {
        this.modalDialogService.error(
          "Error",
          `Se ha producido un error al intentar registrar las cuotas de reparación civil`,
          "Aceptar"
        );
        return null;
      }
    }
    return null;
  }
  icono(name: string): string {
    return icono(name);
  }
  campoInvalidoCuotas(index: number, fieldName: string): boolean | undefined {
    const control = this.cuotas.at(index).get(fieldName);
    return control?.invalid;
  }


}
