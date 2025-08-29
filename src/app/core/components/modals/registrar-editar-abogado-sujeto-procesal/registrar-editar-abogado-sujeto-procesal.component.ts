import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';
import { DateMaskModule } from '@core/directives/date-mask.module';
import { DigitOnlyModule } from '@core/directives/digit-only.module';
import { LetterOnlyModule } from '@core/directives/letter-only.module';
import { TrimSpacesModule } from '@core/directives/trim-space.module';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';
import { AbogadoService } from '@core/services/generales/sujeto/abogado.service';
import { SujetoGeneralService } from '@core/services/generales/sujeto/sujeto-general.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { valid, validString } from '@core/utils/string';
import { validarEmail, validOnlyAlphanumeric, validOnlyAlphanumericDrop, validOnlyAlphanumericOnPaste, validOnlyNumberDrop } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { DOCUMENTOS_IDENTIDAD_ABOGADOS, IconUtil, RESPUESTA_MODAL, ValidationModule, validOnlyNumberOnPaste, validOnlyNumbers } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { convertStringToDate } from '@core/utils/date';
dayjs.extend(isSameOrBefore);

@Component({
  selector: 'app-crear-editar-abogado-sujeto-procesal',
  standalone: true,
  imports: [
    CmpLibModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextareaModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
    DateMaskModule,
    InputTextModule,
    DigitOnlyModule,
    LetterOnlyModule,
    NgxCfngCoreModalDialogModule,
    UpperCaseInputModule,
    SharedModule,
    ValidationModule,
    MensajeGenericoComponent,
    TrimSpacesModule
  ],
  providers: [
    NgxCfngCoreModalDialogService,
  ],
  templateUrl: './registrar-editar-abogado-sujeto-procesal.component.html',
  styleUrl: './registrar-editar-abogado-sujeto-procesal.component.scss'
})
export class CrearEditarAbogadoSujetoProcesalComponent {

  protected formAbogado!: FormGroup;

  protected lstTipoDocIdentidad: any = [];

  private readonly subscriptions: Subscription[] = [];

  protected showBtnBuscar: boolean = false;

  protected datosReniec: any=null;

  protected isVerificadoReniec: boolean=false;

  protected longitudMinimaInput: number = 8;

  protected longitudMaximaInput: number = 8;

  protected alfanumericoInput: boolean = false;

  protected dataAbogado:any=null;

  protected idSujetoCaso!:string;

  protected textoValidacion:string | null = null;

  private valoresIniciales!: any;

  constructor(
    public ref: DynamicDialogRef,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly fb: FormBuilder,
    protected iconUtil: IconUtil,
    private readonly maestrosService: MaestroService,
    private readonly sujetoGeneralService: SujetoGeneralService,
    public config: DynamicDialogConfig,
    private readonly abogadoService: AbogadoService,
  ) {
    this.dataAbogado = this.config.data.data;
    this.idSujetoCaso = this.config.data.idSujetoCaso;
  }

  ngOnInit() {
    this.formBuild();
    this.obtenerTipoDocIdentidad();
    this.cargarAbogadoEdicion();
    this.formAbogado.statusChanges.subscribe(() => {
      if(!this.formAbogado.invalid){
        this.textoValidacion=null;
      }
    });
  }

  get edicion():boolean {
    return this.dataAbogado != null;
  }

  get titulo():string{
    return `${this.edicion ? 'EDICIÓN': 'REGISTRO'} DE ABOGADO`
  }

  formBuild() {
    this.formAbogado = this.fb.group({
      tipoDocIdentidad: [null, Validators.required],
      nroDocumento:  [null, Validators.required],
      nombresCompletos:  [null, Validators.required],
      apellidPaterno:  [null, Validators.required],
      apellidoMaterno:  [null, Validators.required],
      numeroColegiatura:  [null, Validators.required],
      detalles: [null],
      sexo: [null,  Validators.required],
      fechaApersonamiento: [null],
      fechaFinServicio: [null],
      tipoRegistro: [{ value: false, disabled: false }],
      celular: [null, Validators.required],
      correo: ['', [Validators.required]],
    });
  }

  cargarAbogadoEdicion(){
    if(this.dataAbogado != null){
      this.isVerificadoReniec= this.showBtnBuscar = this.dataAbogado.verificado == "1";
      this.formAbogado.patchValue({
        tipoDocIdentidad: this.dataAbogado.tipoDocumento,
        nroDocumento: this.dataAbogado.nroDocumento,
        nombresCompletos: this.dataAbogado.nombresCompletos,
        apellidPaterno: this.dataAbogado.apellidoPaterno,
        apellidoMaterno: this.dataAbogado.apellidoMaterno,
        numeroColegiatura: this.dataAbogado.colegiatura,
        detalles: this.dataAbogado.detalle,
        sexo: this.dataAbogado.sexo,
        fechaApersonamiento: convertStringToDate(this.dataAbogado.fapersonamiento),
        fechaFinServicio: convertStringToDate(this.dataAbogado.ffinServicio),
        tipoRegistro:!this.isVerificadoReniec,
        celular: this.dataAbogado.celular,
        correo: this.dataAbogado.correo,
      });
      this.desactivarInputsNombre(!this.isVerificadoReniec);

      this.valoresIniciales = this.formAbogado.getRawValue();
      this.establecerLongitudCampo(parseInt(this.dataAbogado.tipoDocumento));
    }
    else{
      this.desactivarInputsNombre(false)
      this.showBtnBuscar = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  cambiarTipoDocumento(event: any) {
    this.isVerificadoReniec = false;
    this.formAbogado.get('nroDocumento')?.setValue(null);
    if (event?.value == parseInt(DOCUMENTOS_IDENTIDAD_ABOGADOS.DNI)) {
      this.formAbogado.get('tipoRegistro')?.setValue(false);
      this.desactivarInputsNombre(false);
      this.formAbogado.get('tipoRegistro')?.enable();
      this.limpiarInputsNombre();
      this.showBtnBuscar = true;
    } else {
      this.formAbogado.get('tipoRegistro')?.setValue(true);
      this.desactivarInputsNombre(true);
      this.formAbogado.get('tipoRegistro')?.disable();
      this.showBtnBuscar = false;
    }
    this.establecerLongitudCampo(parseInt(event?.value));
  }

  cambiarRegistroManual(event: any) {
    this.isVerificadoReniec = false;
    this.limpiarInputsNombre();
    if (event?.checked) {
      this.showBtnBuscar = false;
      this.desactivarInputsNombre(true);
    } else {
      this.showBtnBuscar = true;
      this.desactivarInputsNombre(false);
    }
  }

  obtenerTipoDocIdentidad() {
    this.subscriptions.push(
      this.maestrosService.obtenerTipoDocIdentidad().subscribe({
        next: (resp) => {
          const idsValidos = [
            parseInt(DOCUMENTOS_IDENTIDAD_ABOGADOS.DNI),
            parseInt(DOCUMENTOS_IDENTIDAD_ABOGADOS.CARNETEXT),
            parseInt(DOCUMENTOS_IDENTIDAD_ABOGADOS.PASAPORTE),
          ];
          this.lstTipoDocIdentidad = resp.data.filter((x: any) =>
            idsValidos.includes(x.id)
          );
        },
      })
    );
  }
  validarBuscarNaturalDocumento(): boolean {
    const nroDocumentoBuscar: string = this.formAbogado.get('nroDocumento')?.value;
    return !valid(nroDocumentoBuscar) || nroDocumentoBuscar.length !== 8;
  }

  buscarAbogadoReniec() {
    let nroDocumento = this.formAbogado.get('nroDocumento')!.value;
    this.datosReniec=null;
    this.isVerificadoReniec = false;
    this.subscriptions.push(
      this.sujetoGeneralService.getConsultaReniec(nroDocumento).subscribe({
        next: resp => {
          if (resp.nombres) {
            this.datosReniec = resp;
            this.formAbogado.patchValue({
              nombresCompletos: validString(this.datosReniec.nombres),
              apellidoMaterno: validString(this.datosReniec.apellidoMaterno),
              apellidPaterno: validString(this.datosReniec.apellidoPaterno)
            });
            this.isVerificadoReniec = true;
          }
        },
        error: error => {
          this.formAbogado.get('tipoRegistro')?.setValue(true);
          this.modalDialogService.warning("Advertencia",
                                        'El servicio de RENIEC no se encuentra disponible en este momento. Por favor, ingrese los datos manualmente.',
                                        'Aceptar');
          this.formAbogado.get('tipoRegistro')?.enable();
          this.cambiarRegistroManual({ checked: true });
          this.limpiarInputsNombre();
        }
      })
    )
  }

  limpiarInputsNombre(){
    this.formAbogado.get('nombresCompletos')?.setValue(null);
    this.formAbogado.get('apellidPaterno')?.setValue(null);
    this.formAbogado.get('apellidoMaterno')?.setValue(null);
  }
  desactivarInputsNombre(valid:boolean){
    if(valid){
      this.formAbogado.get('nombresCompletos')?.enable();
      this.formAbogado.get('apellidPaterno')?.enable();
      this.formAbogado.get('apellidoMaterno')?.enable();
      return
    }
    this.formAbogado.get('nombresCompletos')?.disable();
    this.formAbogado.get('apellidPaterno')?.disable();
    this.formAbogado.get('apellidoMaterno')?.disable();
  }
  resetearCambioInputDocumento(){
    if(this.isVerificadoReniec){
      this.limpiarInputsNombre();
      this.datosReniec = null;
      this.isVerificadoReniec = false;
    }
  }

  establecerLongitudCampo(id: number) {
    const configuraciones: { [key: number]: { min: number, max: number, alfanumerico: boolean } } = {
      1: { min: 8, max: 8, alfanumerico: false },
      4: { min: 4, max: 12, alfanumerico: true },
      5: { min: 4, max: 12, alfanumerico: true }
    };
    const config = configuraciones[id] || { min: 0, max: 50, alfanumerico: true };
    this.longitudMinimaInput = config.min;
    this.longitudMaximaInput = config.max;
    this.alfanumericoInput = config.alfanumerico;
  }

  validarLongitudDocumento(numeroDocumento: string | null): boolean {
    return numeroDocumento != null && this.validarLongitudCampo(numeroDocumento.length);
  }
  mostrarErrorLongitudDocumento(): void {
    console.log(this.longitudMinimaInput)
    console.log(this.longitudMaximaInput)

    const mensajeLongitudRango: string = this.longitudMinimaInput !== this.longitudMaximaInput ?

    `Debe tener entre ${this.longitudMinimaInput} y ${this.longitudMaximaInput} dígitos`
     : `Debe tener exactamente ${this.longitudMinimaInput} dígitos`;

    const mensaje = `La longitud del campo número de documento no es correcta. ${mensajeLongitudRango}. Inténtelo nuevamente.`;
    this.textoValidacion=mensaje;
  }
  validarLongitudCampo(length: number): boolean {
    return (length >= this.longitudMinimaInput && length <= this.longitudMaximaInput);
  }

  guardar() {
    this.textoValidacion=null;
    const formulario = this.formAbogado.getRawValue();
    if (this.formAbogado.invalid) {
      this.formAbogado.markAllAsTouched();
      this.textoValidacion='Debe completar todos los campos obligatorios para continuar con el registro';
      return;
    }

    if(!validarEmail(formulario.correo)){
      this.textoValidacion='El email ingresado no es válido';
      return;
    }
    if(formulario.celular.length !== 9){
      this.textoValidacion='El celular ingresado debe tener 9 dígitos';
      return;
    }
    if (!formulario.tipoRegistro && !this.isVerificadoReniec) {
      this.textoValidacion = 'Debe validar el DNI con RENIEC para continuar con el registro';
      return;
    }

    if (!this.validarLongitudDocumento(formulario.nroDocumento)) {
      this.mostrarErrorLongitudDocumento();
      return;
    }

    if(formulario.fechaApersonamiento !== null && formulario.fechaFinServicio){
        if(!this.validarFechasAbogado(formulario.fechaApersonamiento,formulario.fechaFinServicio)){
          this.textoValidacion='La fecha de fin de servicio debe ser mayor o igual a la fecha de apersonamiento';
          return;
        }
    }
    if(this.edicion && !this.validarCambiosForm()){
      this.modalDialogService.info("Información",
        `No se ha realizado ningún cambio en la información del abogado`,
        'Aceptar');
        return;
    }

    this.agregarModificarAbogado();
  }

  validarCambiosForm(): boolean {
    return JSON.stringify(this.valoresIniciales) !== JSON.stringify(this.formAbogado.getRawValue());
  }

   agregarModificarAbogado(){
    let request = {
      idVinculoSujeto: this.dataAbogado?.idAbogado,
      tipoRegistro: this.isVerificadoReniec? "1" : "0",
      tipoDocumento: this.formAbogado.get('tipoDocIdentidad')!.value,
      numeroDocumento: this.formAbogado.get('nroDocumento')!.value,
      nombres: this.formAbogado.get('nombresCompletos')!.value,
      apellidoPaterno: this.formAbogado.get('apellidPaterno')!.value,
      apellidoMaterno: this.formAbogado.get('apellidoMaterno')!.value,
      sexo: this.formAbogado.get('sexo')!.value,
      numeroColegiatura: this.formAbogado.get('numeroColegiatura')!.value,
      fechaApersonamiento:this.formAbogado.get('fechaApersonamiento')!.value,
      fechaFinServicio:this.formAbogado.get('fechaFinServicio')!.value,
      detalles: this.formAbogado.get('detalles')!.value,
      sujeto: this.idSujetoCaso,
      correo: String(this.formAbogado.get('correo')!.value).toLowerCase(),
      celular: this.formAbogado.get('celular')!.value,
      habilitado: this.dataAbogado?.habilitado ?? '1'
    };
    //console.log(request)
      const dialog = this.modalDialogService.question(
        `Confirmación de ${this.edicion ? 'edición': 'registro'}`,
        `¿Desea ${this.edicion ? 'editar': 'registrar'} al abogado?`,
        'Continuar',
        'Cancelar'
      );
      dialog.subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.subscriptions.push(
              this.abogadoService.agregarEditarAbogado(request)
                .subscribe({
                  next: (resp) => {
                    if (resp.code == 200) {
                      this.modalDialogService.success(`Abogado  ${this.edicion ? 'actualizado': 'registrado'}`,
                        `Se  ${this.edicion?'actualizó':'registró'} correctamente el abogado.`,
                        'Aceptar');
                      this.ref.close(RESPUESTA_MODAL.OK);
                    }
                  },
                  error: error => {
                    this.modalDialogService.error("Error",
                                                  `Se ha producido un error al intentar ${this.edicion ? 'editar': 'registrar'} al abogado`,
                                                  'Aceptar');
                  }
                })
            );
          }
        },
      });
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


  protected validOnlyNumbers(evento: any): boolean {
    return validOnlyNumbers(evento);
  }

  protected validOnlyNumberOnPaste(evento: ClipboardEvent): any {
    return validOnlyNumberOnPaste(evento);
  }

  protected validOnlyNumberDrop(evento: DragEvent): any {
    return validOnlyNumberDrop(evento);
  }

  protected validOnlyAlphanumeric(evento: any): boolean {
    return validOnlyAlphanumeric(evento);
  }
   
  protected validOnlyAlphanumericOnPaste(evento: ClipboardEvent): any {
    return validOnlyAlphanumericOnPaste(evento);
  }
  
  protected validOnlyAlphanumericDrop(evento: DragEvent): any {
    return validOnlyAlphanumericDrop(evento);
  }

  validarFechasAbogado(fechaInicio: any, fechaFin: any): boolean {
    return dayjs(fechaInicio).isSameOrBefore(dayjs(fechaFin));
  }
}
