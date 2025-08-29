import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {CalificarCaso} from '@interfaces/provincial/administracion-casos/calificacion/CalificarCaso';
import {
  ObtenerValorMaxPlazoRequest,
  ObtenerValorMaxPlazoResponse,
  RegistrarPlazoRequest,
} from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import {MaestroService} from '@services/shared/maestro.service';
import {GestionPlazoService} from '@services/provincial/gestion-plazo/gestion-plazo.service';
import {COMPLEJIDAD, COMPLEJIDAD_VALOR_MAX, UNIDAD_MEDIDA,} from 'ngx-cfng-core-lib';
import {DigitOnlyModule} from '@directives/digit-only.module';
import {obtenerIcono} from '@utils/icon';
import {obtenerCasoHtml} from '@utils/utils';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {Message, MessageService, SelectItem} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MessagesModule} from 'primeng/messages';
import {take} from 'rxjs';

@Component({
  selector: 'app-plazo-declarar-complejo',
  standalone: true,
  templateUrl: './plazo-declarar-complejo.component.html',
  styleUrls: ['./plazo-declarar-complejo.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    CmpLibModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    DigitOnlyModule,
    FormsModule,
  ],
  providers: [MessageService],
})
export class PlazoDeclararComplejoComponent implements OnInit {
  formRegistro!: FormGroup;
  titulo: string = 'DECLARAR COMPLEJO';
  numeroCaso: string = '00000000-0000-0000-0';
  public obtenerIcono = obtenerIcono;
  public tituloModal: SafeHtml | undefined = undefined;

  unidadesMedidas: SelectItem[] = [];
  sedes: SelectItem[] = [];
  msgs1: Message[] = [];
  msgs2: Message[] = [];
  public mensajeCustom: any;
  complejidadSeleccionada: any;
  complejidades: SelectItem[] = [];
  public validacionCorrecta: boolean = false;
  calificarCaso!: CalificarCaso;
  valorMaximoResponse!: ObtenerValorMaxPlazoResponse;
  private idCaso: string = '';

  constructor(
    private sanitizador: DomSanitizer,
    private messageService: MessageService,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private maestroService: MaestroService,
    private gestionPlazoService: GestionPlazoService,
    private fb: FormBuilder
  ) {
    this.msgs1 = [
      {
        severity: 'warn',
        summary: '',
        detail:
          'Está declarando complejo el caso, recuerde que esta acción no podrá revertirse. Verifique los datos ingresados.',
        icon: 'pi-info-circle icon-color',
      },
    ];
    this.crearFormulario();
    this.obtenerTitulo();
  }
  private crearFormulario(): void {
    this.formRegistro = this.fb.group({
      fechaInicioInvestigacionPreliminar: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      fechaFinInvestigacionPreliminarActual: [
        { value: '', disabled: true },
        [Validators.required],
      ],
      plazoNuevo: [
        { value: '', disabled: false },
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(3),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],
      unidadMedida: [{ value: '', disabled: false }, [Validators.required]],
      nuevaFechaFinCalculada: [{ value: '', disabled: true }],
      descripcion: [{ value: '', disabled: false }, [Validators.required]],
    });
    this.formRegistro.get('plazoNuevo')!.valueChanges.subscribe({
      next: (data) => {
        this.validarPlazo(data);
        //this.formRegistro.get('plazo').setValue(0);
      },
    });
  }
  private obtenerTitulo(): void {
    let tituloHtml = `${this.titulo}`;
    tituloHtml +=
      this.numeroCaso !== '00000000-0000-0000-0'
        ? ` - Caso: ${obtenerCasoHtml(this.numeroCaso)}`
        : '';
    this.tituloModal = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
    //this.tituloModal = 'HOLA MUNDO';
  }

  ngOnInit(): void {
    this.calificarCaso = this.config.data?.calificarCaso;
    this.formRegistro
      .get('fechaInicioInvestigacionPreliminar')!
      .setValue(this.calificarCaso.fechaInicio);
    this.formRegistro
      .get('fechaFinInvestigacionPreliminarActual')!
      .setValue(this.calificarCaso.fechaFin);
    this.obtenerValorMaxPlazo();
    this.listarUnidadMedida();
  }

  public cerrarModal(): void {
    //this.alCerrarModal()
    this.dialogRef.close();
  }
  public declararComplejo(): void {
    this.messageService.clear();

    if (!this.formRegistro.valid) {
      this.formRegistro.markAllAsTouched();
      return;
    }
    let data: RegistrarPlazoRequest = {} as RegistrarPlazoRequest;
    data.idTipoComplejidad = COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO;
    //data.idTipoSedeInvestigacion = this.formRegistro.get('sede').value;
    data.idTipoSedeInvestigacion = null;
    data.descripcionPlazo = this.formRegistro.get('descripcion')!.value;
    data.idCaso = this.config.data?.idCaso;
    data.idTramite = this.config.data?.idTramite;
    data.idActoProcesal = this.config.data?.idActoProcesal;
    data.idTipoUnidad = this.formRegistro.get('unidadMedida')!.value;
    data.nroPlazo = this.formRegistro.get('plazoNuevo')!.value;

    this.dialogRef.close(data);
  }

  // listarComplejidad(): void {
  //   this.maestroService.listarComplejidad()
  //     .pipe(take(1))
  //     .subscribe({
  //       next: resp => {
  //         this.complejidades = resp.map(item => ({ value: item.id, label: item.nombre }));
  //         this.formRegistro.get('complejidad').setValue(COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE);
  //         this.formRegistro.get('complejidad').valueChanges.subscribe({
  //           next: data => {
  //             if (data) {
  //               this.complejidadSeleccionada = this.complejidades.find(complejidad => complejidad.value == data);
  //               this.msgs1 = [];
  //               if (this.complejidadSeleccionada.value == COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO) {
  //                 this.obtenerMensajeComplejidad();
  //                 this.validarPlazo(this.formRegistro.get('plazo').value);
  //               }
  //             }
  //           }
  //         });
  //       },
  //       error: resp => {

  //       }
  //     });
  // }

  private obtenerMensajeComplejidad(): void {
    this.msgs1 = [
      {
        severity: 'warn',
        summary: '',
        detail:
          'Está declarando complejo el caso, recuerde que esta acción no podrá revertirse. Verifique los datos ingresados.',
        icon: 'pi-info-circle icon-color',
      },
    ];
  }

  private validarPlazo(plazo: any): void {
    
    this.msgs2 = [];
    if (!this.formRegistro.get('unidadMedida')!.value) {
      this.formRegistro.get('unidadMedida')!.markAllAsTouched;
      return;
    }

    let unidadMedida = this.formRegistro.get('unidadMedida')!.value;

    this.complejidadSeleccionada = this.complejidades.find(
      (complejidad) =>
        complejidad.value == COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
    );

    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS) {
      this.calcularDias(plazo);
    } else if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES) {
      this.calcularMeses(plazo);
    } else if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS) {
      this.calcularAnios(plazo);
    }
  }

  private calcularDias(plazo: any): void {
    if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE
    ) {
      if (plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_DIA) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_DIA,
          true,
          false,
          false
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
    ) {
      if (
        plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_DIA
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_DIA,
          true,
          false,
          false
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA
    ) {
      if (
        plazo >
        COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_DIA
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_DIA,
          true,
          false,
          false
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    }
  }

  private calcularMeses(plazo: any): void {
    if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE
    ) {
      if (plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_MES) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_MES,
          false,
          true,
          false
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
    ) {
      if (
        plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_MES
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_MES,
          false,
          true,
          false
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA
    ) {
      if (
        plazo >
        COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_MES
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_MES,
          false,
          true,
          false
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    }
  }

  private calcularAnios(plazo: any): void {
    if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE
    ) {
      if (
        plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_ANIO
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_SIMPLE_ANIO,
          false,
          false,
          true
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO
    ) {
      if (
        plazo > COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_ANIO
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_COMPLEJO_ANIO,
          false,
          false,
          true
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    } else if (
      this.complejidadSeleccionada.value ==
      COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_CRIMINALIDAD_ORGANIZADA
    ) {
      if (
        plazo >
        COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_ANIO
      ) {
        this.obtenerMensaje(
          COMPLEJIDAD_VALOR_MAX.COMPLEJIDAD_MAX_PRELIMINAR_CRIMINALIDAD_ORGANIZADA_ANIO,
          false,
          false,
          true
        );
        this.validacionCorrecta = false;
      } else {
        this.validacionCorrecta = true;
      }
    }
  }

  private obtenerMensaje(dias: any, esDia: any, esMes: any, esAnio: any): void {
    let etiqueta = esDia ? 'días' : esMes ? 'mes' : esAnio ? 'año' : '';
    let mensajeCustomHtml = '';
    if (dias == 0 && esAnio) {
      dias = 1;
      mensajeCustomHtml =
        "El plazo registrado <span ngStyle='color:#f19700;font-weight: bold;'>debe ser menor </span> a " +
        dias +
        ' ' +
        etiqueta +
        '. Verifique los datos ingresados.';
    } else {
      mensajeCustomHtml =
        "El plazo registrado está <span ngStyle='color:#f19700;font-weight: bold;'>superando el tope</span> de " +
        dias +
        ' ' +
        etiqueta +
        '. Verifique los datos ingresados.';
    }

    this.mensajeCustom = mensajeCustomHtml;
    this.msgs2 = [
      {
        severity: 'warn',
        summary: '',
        detail: this.mensajeCustom,
        icon: 'pi-info-circle',
      },
    ];
  }

  private obtenerValorMaxPlazo(): void {
    let idComplejidad = COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO;
    let idTramite = this.config.data?.idTramite;

    let request: ObtenerValorMaxPlazoRequest =
      {} as ObtenerValorMaxPlazoRequest;
    request.idTipoComplejidad = idComplejidad;
    request.idActoTramiteEstado = idTramite;
    request.idCaso = this.idCaso;
    this.gestionPlazoService
      .obtenerValoMaxPlazo(request)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.valorMaximoResponse = result;
        },
      });
  }

  listarUnidadMedida(): void {
    this.maestroService
      .listarUnidadMedida()
      .pipe(take(1))
      .subscribe({
        next: (resp) => {
          this.unidadesMedidas = resp.map((item: any) => ({
            value: item.id,
            label: item.nombre,
          }));
        },
      });
  }
}
