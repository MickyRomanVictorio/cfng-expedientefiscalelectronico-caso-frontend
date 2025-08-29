import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PATTERN_CORREO } from '@core/constants/pattern';
import { ContactoParentescoForm } from '@core/interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/ContactosParentesco';
import { ITipoDocIdentidadModel, SujetoGeneralService } from '@core/services/generales/sujeto/sujeto-general.service';
import { getConfiguracionTipoDocumento } from '@core/utils/input-documento';
import { validOnlyAlphanumeric, validOnlyAlphanumericDrop, validOnlyAlphanumericOnPaste, validOnlyNumberDrop, validOnlyNumberOnPaste, validOnlyNumbers } from '@core/utils/utils';
import { CmpLibModule } from 'dist/cmp-lib';
import { ValidationModule } from 'dist/ngx-cfng-core-lib';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';
import * as Icons from 'ngx-mpfn-dev-icojs-regular';
import { DigitOnlyModule } from '@core/directives/digit-only.module';
import { LetterOnlyModule } from '@core/directives/letter-only.module';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';

@Component({
  selector: 'app-contacto-parentesco',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    InputTextModule,
    CheckboxModule,
    CommonModule,
    ValidationModule,
    DropdownModule,
    CmpLibModule,
    DigitOnlyModule,
    LetterOnlyModule,
    UpperCaseInputModule,
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    NgxCfngCoreModalDialogService,
  ],
  templateUrl: './contacto-parentesco.component.html',
  styleUrl: './contacto-parentesco.component.scss'
})
export class ContactoParentescoComponent implements OnInit {

  @Input() listaParentesco: any[] = [];
  @Input() listaTiposDocumentosIdentidad: ITipoDocIdentidadModel[] = [];
  @Input() listaContactos: ContactoParentescoForm[] = [];
  @Input() contacto!: ContactoParentescoForm;
  @Input() index!: number;

  @Output() eliminar = new EventEmitter<number>();
  @Output() cambio = new EventEmitter<{ index: number, data: ContactoParentescoForm}>();

  protected longitudMaximaInput: number = 8;
  protected longitudMinimaInput: number = 8;
  protected alfanumericoInput: boolean = false;

  formContacto: FormGroup;
  private readonly subscriptions: Subscription[] = [];
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private esCargaInicial = true;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly messageService: MessageService,
    private readonly sujetoGeneralService: SujetoGeneralService,

  ) {
    this.formContacto = this.formBuilder.group({
      idPersona: [''],
      registrosManuales: [''],
      parentesco: new FormControl(null, [Validators.required]),
      tipoDocumento: new FormControl('', [Validators.required]),
      numeroDocumento: new FormControl('', [Validators.required]),
      apellidoPaterno: new FormControl('', [Validators.required]),
      apellidoMaterno: [''],
      nombresParentesco: new FormControl('', [Validators.required]),
      rbSexo: new FormControl('', [Validators.required]),
      celularPrincipalParentesco: [''],
      celularSecundarioParentesco: [''],
      celularSecundarioOpParentesco: [''],
      correoPrincipalParentesco: new FormControl('', Validators.pattern(PATTERN_CORREO)),
      correoSecundarioParentesco: new FormControl('', Validators.pattern(PATTERN_CORREO)),
      telefonoPrincipalParentesco: [''],
      telefonoSecundarioParentesco: [''],
      telefonoSecundarioOpParentesco: [''],
      casillaElectronicaPrincipalParentesco: [''],
      botonBuscarDni: [{ value: null, disabled: true }],
    });

    this.formContacto.valueChanges.subscribe(value => {
      if (!this.esCargaInicial) {
        console.log('cambio valores ');
        let data = value;
        data.valid = this.formContacto.valid;
        this.cambio.emit({ index: this.index, data: value });
      }
    });
  }

  ngOnInit(): void {
    this.formContacto.patchValue({
      idPersona: this.contacto.idPersona,
      registrosManuales: this.contacto.registrosManuales,
      parentesco: this.contacto.parentesco,
      tipoDocumento: this.contacto.tipoDocumento,
      numeroDocumento: this.contacto.numeroDocumento,
      apellidoPaterno: this.contacto.apellidoPaterno,
      apellidoMaterno: this.contacto.apellidoMaterno,
      nombresParentesco: this.contacto.nombresParentesco,
      rbSexo: this.contacto.rbSexo,
      celularPrincipalParentesco: this.contacto.celularPrincipalParentesco,
      celularSecundarioParentesco: this.contacto.celularSecundarioParentesco,
      celularSecundarioOpParentesco: this.contacto.celularSecundarioOpParentesco,
      correoPrincipalParentesco: this.contacto.correoPrincipalParentesco,
      correoSecundarioParentesco: this.contacto.correoSecundarioParentesco,
      telefonoPrincipalParentesco: this.contacto.telefonoPrincipalParentesco,
      telefonoSecundarioParentesco: this.contacto.telefonoSecundarioParentesco,
      telefonoSecundarioOpParentesco: this.contacto.telefonoSecundarioOpParentesco,
      casillaElectronicaPrincipalParentesco: this.contacto.casillaElectronicaPrincipalParentesco,
      botonBuscarDni: this.contacto.botonBuscarDni,
      valido: this.contacto.valido
    })

    this.formContacto.get('apellidoPaterno')?.disable();
    this.formContacto.get('apellidoMaterno')?.disable();
    this.formContacto.get('nombresParentesco')?.disable();
    this.formContacto.get('rbSexo')?.disable();

    setTimeout(() => {
      this.esCargaInicial = false;
    });
  }

  protected habilitarDeshabilitar(): void {
    const valueRegistrosManuales = this.formContacto.get('registrosManuales')?.value[0];

    if (valueRegistrosManuales === 'registroManual') {

      this.formContacto.get('botonBuscarDni')?.disable();

      this.formContacto.get('apellidoPaterno')?.enable();
      this.formContacto.get('apellidoMaterno')?.enable();
      this.formContacto.get('nombresParentesco')?.enable();
      this.formContacto.get('rbSexo')?.enable();

    } else {

      this.formContacto.get('botonBuscarDni')?.enable();

      this.formContacto.get('apellidoPaterno')?.setValue('');
      this.formContacto.get('apellidoPaterno')?.disable();

      this.formContacto.get('apellidoMaterno')?.setValue('');
      this.formContacto.get('apellidoMaterno')?.disable();

      this.formContacto.get('nombresParentesco')?.setValue('');
      this.formContacto.get('nombresParentesco')?.disable();

      this.formContacto.get('rbSexo')?.setValue('');
      this.formContacto.get('rbSexo')?.disable();
    }
  }

  protected consultaServicioReniec(): void {

    const numeroDocumentoControl = this.formContacto.get('numeroDocumento');
    const tipoDocumento = this.formContacto.get('tipoDocumento');
    let numeroDocu = numeroDocumentoControl?.value;
    let tipoDocu = tipoDocumento?.value;

    if (tipoDocu === 1 && numeroDocu.length !== 8) {
      numeroDocumentoControl?.setErrors({ invalidLength: true });
      return;
    }

    numeroDocumentoControl?.setErrors(null);
    this.spinner.show();

    if (tipoDocu === 1) {
      this.subscriptions.push(
        this.sujetoGeneralService.getConsultaReniec(numeroDocu).subscribe({
          next: (resp) => {
            this.spinner.hide();
            if (resp.nombres) {
              this.formContacto.get('nombresParentesco')?.setValue(resp.nombres);
              this.formContacto.get('apellidoPaterno')?.setValue(resp.apellidoPaterno);
              this.formContacto.get('apellidoMaterno')?.setValue(resp.apellidoMaterno);
              if (resp.codigoGenero === '1') {
                this.formContacto.get('rbSexo')?.patchValue('masculino');
              } else if (resp.codigoGenero === '2') {
                this.formContacto.get('rbSexo')?.patchValue('femenino');
              }
            } else {
              this.modalDialogService.info(
                'Documento no encontrado',
                `No se encontró este documento, por favor inténtelo nuevamente`,
                'Ok'
              );
            }
          },
          error: () => {
            this.spinner.hide();
            this.formContacto.get('registrosManuales')?.setValue(["registroManual"]);
            this.habilitarDeshabilitar();
            this.modalDialogService.warning(
              'Advertencia',
              'El servicio de RENIEC no se encuentra disponible en este momento. Por favor, ingrese los datos manualmente.',
              'Aceptar'
            );
          },
        })
      );
    }
  }

  protected eventChangeTipoDocumento(): void {
    const tipoDocumentoValue = this.formContacto.get('tipoDocumento');
    const numDocumentoControl = this.formContacto.get('numeroDocumento');

    const botonBuscarControl = this.formContacto.get('botonBuscarDni');
    const valueRegistrosManuales =
      this.formContacto.get('registrosManuales')?.value[0];

    if (tipoDocumentoValue?.value === 3 || tipoDocumentoValue?.value === 15) {
      numDocumentoControl?.disable();
      botonBuscarControl?.disable();
    } else if (tipoDocumentoValue?.value === 16) {
      this.formContacto.get('numeroDocumento')?.disable();
      this.formContacto.get('registrosManuales')?.setValue(['registroManual']);
      this.formContacto.get('apellidoPaterno')?.enable();
      this.formContacto.get('apellidoMaterno')?.enable();
      this.formContacto.get('nombresParentesco')?.enable();
      this.formContacto.get('rbSexo')?.enable();
    } else {

      numDocumentoControl?.enable();

      if (
        (tipoDocumentoValue?.value === 1 || tipoDocumentoValue?.value === 2) &&
        valueRegistrosManuales !== 'registroManual'
      ) {
        botonBuscarControl?.enable();
      } else {
        botonBuscarControl?.disable();

        this.formContacto.patchValue({
          numeroDocumento: null,
          apellidoPaterno: null,
          apellidoMaterno: null,
          nombresParentesco: '',
          rbSexo: null,
        });
      }
    }
    this.establecerLongitudNumeroDocumento(tipoDocumentoValue?.value);
  }

  protected establecerLongitudNumeroDocumento(id: number) {
    const config = getConfiguracionTipoDocumento(id);

    this.longitudMinimaInput = config.min;
    this.longitudMaximaInput = config.max;
    this.alfanumericoInput = config.alfanumerico;
  }

  protected validarNumeroDocumento(event: FocusEvent): void {
    const numeroDocumento = (event.target as HTMLInputElement).value;
    const tipoDocumento = this.formContacto.get('tipoDocumento')?.value;
        
    const existe = this.listaContactos.some(contacto =>
      contacto.numeroDocumento === numeroDocumento &&
      contacto.tipoDocumento === tipoDocumento
    );

    if (existe) {
      this.formContacto.get('numeroDocumento')?.setValue(null);
      this.modalDialogService.warning(
        'Validación',
        'Documento ya existe',
        'Ok'
      );
    }
  }

  removerContactoParentesco() {
    this.eliminar.emit(this.index)
  }

  protected validarSoloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorActual = input.value;
    input.value = valorActual.replace(/[^0-9]/g, '');
  }

  validarNombresParentesco(): void {
    const tipoDocumento = this.formContacto.get('tipoDocumento')?.value;

    if (tipoDocumento === 16) {
      const apellidoPaterno =  this.formContacto.get('apellidoPaterno')?.value;
      const apellidoMaterno =  this.formContacto.get('apellidoMaterno')?.value;
      const nombresParentesco =  this.formContacto.get('nombresParentesco')?.value;

      const existe = this.listaContactos.some(contacto =>
        contacto.apellidoPaterno === apellidoPaterno &&
        contacto.apellidoMaterno === apellidoMaterno &&
        contacto.nombresParentesco === nombresParentesco
      );

      if (existe) {
        this.formContacto.get('apellidoPaterno')?.setValue(null);
        this.formContacto.get('apellidoMaterno')?.setValue(null);
        this.formContacto.get('nombresParentesco')?.setValue(null);

        this.modalDialogService.warning(
          'Validación',
          'Los nombres completos ya existen',
          'Ok'
        );
      }
    }
  }

  protected obtenerIcono(iconName: string): any {
    const iconData = (Icons as any)[iconName];

    const esIconoValido = (iconData: any) => {
      return (
        typeof iconData === 'object' &&
        'viewBox' in iconData &&
        'path' in iconData
      );
    };

    if (!iconData) {
      console.error(
        `El icono "${iconName}" no se encuentra en la librería ngx-mpfn-dev-cmp-lib.`
      );
      return null;
    }

    if (esIconoValido(iconData)) {
      return { name: iconName, viewBox: iconData.viewBox, path: iconData.path };
    }

    console.error(`El icono "${iconName}" no tiene el formato esperado.`);
    return null;
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
}
