import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { DigitOnlyModule } from '@directives/digit-only.module';
import {
  ObtenerValorMaxPlazoRequest,
  ObtenerValorMaxPlazoResponse,
  RegistrarPlazoRequest,
} from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import { SelectActoProcesalRequest } from '@interfaces/provincial/bandeja-tramites/SelectedActoTramiteRequest';
import { SelectedActoTramiteProcesalService } from '@services/provincial/bandeja-tramites/SeleccionarTramiteProcesalBehavior';
import { GestionPlazoService } from '@services/provincial/gestion-plazo/gestion-plazo.service';
import { MaestroService } from '@services/shared/maestro.service';
import { obtenerIcono } from '@utils/icon';
import { registrarPlazoErrorValidator } from '@utils/registrar-plazo-error-validators';
import { obtenerCasoHtml } from '@utils/utils';
import { format } from 'date-fns';
import {
  SEDES,
  TIPO_RESULTADO,
  TRAMITES,
  UNIDAD_MEDIDA,
} from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { Message, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';
import { of, take } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-plazo-ampliacion',
  templateUrl: './plazo-ampliacion.component.html',
  styleUrls: ['./plazo-ampliacion.component.scss'],
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
    ProgressBarModule,
    FormsModule,
  ],
  providers: [MessageService],
})
export class PlazoAmpliacionComponent implements OnInit {
  tituloProrrogar: string = 'Prórroga de Plazos';
  titulo: string = 'Ampliar Plazo';
  tituloNumeroPlazo: string = 'Plazo nuevo';
  numeroCaso: string = '00000000-0000-0000-0';
  formRegistro!: FormGroup;
  public obtenerIcono = obtenerIcono;
  public tituloModal: SafeHtml | undefined = undefined;
  unidadesMedidas: SelectItem[] = [];
  sedes: SelectItem[] = [];
  msgs1: Message[] = [];
  msgs2: Message[] = [];
  public mensajeCustom: any;
  public calificarCaso!: CasoFiscal;
  public plazosIniciales: RegistrarPlazoRequest | null = null;
  public selectTramiteEstado!: SelectActoProcesalRequest;
  private idTramiteSeleccionado!: string;
  protected flagSedeInvestigacion: boolean = true;
  public verBarraProgreso: boolean = true;
  private valorMaximoResponse!: ObtenerValorMaxPlazoResponse;
  protected tipoInvestigacion: string = 'preliminar';
  private idCaso: string = '';
  alCerrarModal: () => void = () => {};

  constructor(
    private readonly sanitizador: DomSanitizer,
    private readonly messageService: MessageService,
    private readonly dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly maestroService: MaestroService,
    private readonly tramiteSeleccionadoService: SelectedActoTramiteProcesalService,
    private readonly gestionPlazoService: GestionPlazoService,
    private readonly fb: FormBuilder
  ) {
    console.log(
      'this.config.data?.calificarCaso: ',
      this.config.data?.calificarCaso
    );
  }

  ngOnInit(): void {
    this.formRegistro = this.fb.group(
      {
        fechaInicioInvestigacionPreliminar: [
          { value: '', disabled: true },
          [Validators.required],
        ],
        fechaFinInvestigacionPreliminarActual: [
          { value: '', disabled: true },
          [Validators.required],
        ],
        plazo: [
          { value: '', disabled: false },
          [
            Validators.required,
            Validators.minLength(1),
            Validators.min(1),
            Validators.maxLength(3),
            Validators.pattern(/^[0-9]*$/),
          ],
        ],
        unidadMedida: [{ value: '', disabled: false }, [Validators.required]],
        nuevaFechaFinCalculada: [
          { value: 'Se calculará al firmar la disposición', disabled: true },
          [Validators.required],
        ],
        sede: [{ value: '', disabled: false }],
        descripcion: [{ value: '', disabled: false }],
      },
      {
        validators: registrarPlazoErrorValidator,
      }
    );

    this.calificarCaso = this.config.data?.calificarCaso;
    this.plazosIniciales = this.config.data?.plazos;
    this.idTramiteSeleccionado = this.config.data?.idTramite;
    this.idCaso = this.config.data?.idCaso;

    this.formRegistro
      .get('fechaInicioInvestigacionPreliminar')!
      .setValue(this.fechaIniInvPreliminar());
    this.formRegistro
      .get('fechaFinInvestigacionPreliminarActual')!
      .setValue(this.fechaFinInvPreliminar());

    this.tramiteSeleccionadoService.getIdTramite().subscribe({
      next: (respose) => {
        this.selectTramiteEstado = respose!;
      },
    });

    this.obtenerTitulo();

    of(this.listarSedeInvestigacion(), this.listarUnidadMedida()).subscribe({
      next: (data) => {},
      error: (err) => {},
      complete: () => {
        this.verBarraProgreso = false;
      },
    });

    this.formRegistro.get('plazo')!.valueChanges.subscribe({
      next: (data) => {
        let plazo = this.formRegistro.get('plazo')!.value;
        this.validarPlazoConValorMaximo(plazo);
      },
    });
    this.formRegistro.get('unidadMedida')!.valueChanges.subscribe({
      next: (data) => {
        this.obtenerValorMaxPlazo();
      },
    });
    this.formRegistro
      .get('nuevaFechaFinCalculada')!
      .setValue(this.getFechaFinCalculada);
    if (this.plazosIniciales !== undefined && this.plazosIniciales !== null) {
      setTimeout(() => {
        this.ingresarFormulario();
      }, 500);
    }

    if (
      TRAMITES.DISPOSICION_PRORROGA_INVESTIGACION_PREPARATORIA ===
        this.idTramiteSeleccionado ||
      TRAMITES.REQUERIMIENTO_PRORROGA_INVESTIGACION_PREPARATORIA ===
        this.idTramiteSeleccionado ||
      TRAMITES.RESOLUCION_AUTO_QUE_RESUELVE_PRORROGA ===
        this.idTramiteSeleccionado
    ) {
      this.flagSedeInvestigacion = false;
      this.tipoInvestigacion = 'preparatoria';
    }

    if (
      this.config.data.idResultado &&
      this.config.data.idResultado === TIPO_RESULTADO.FUNDADO
    ) {
      this.formRegistro.disable();
    }
  }

  ingresarFormulario() {
    if (this.plazosIniciales) {
      this.formRegistro.patchValue({
        complejidad: this.plazosIniciales.idTipoComplejidad,
        sede: this.plazosIniciales?.idTipoSedeInvestigacion,
        plazo: this.plazosIniciales.nroPlazo,
        unidadMedida: this.plazosIniciales.idTipoUnidad,
        nuevaFechaFinCalculada: this.getFechaFinCalculada, //this.plazosIniciales.fechaCalculada,//'Se calculará al firmar la disposición',
        descripcion: this.plazosIniciales.descripcionPlazo,
      });
    }
  }

  listarSedeInvestigacion(): void {
    this.maestroService
      .listarSedeInvestigacion()
      .pipe(take(1))
      .subscribe({
        next: (resp) => {
          this.sedes = resp.map((item: any) => ({
            value: item.id,
            label: item.nombre,
          }));
          this.formRegistro.get('sede')!.setValue(SEDES.SEDE_FISCALIA);
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
          this.formRegistro
            .get('unidadMedida')!
            .setValue(UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS);
        },
      });
  }

  public ampliar(): void {
    if (this.msgs2.length > 0) {
      return;
    }
    this.messageService.clear();
    if (!this.formRegistro.valid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    let data: RegistrarPlazoRequest = {} as RegistrarPlazoRequest;
    data.idTipoComplejidad = this.idComplejidad;
    // data.idTipoSedeInvestigacion = this.idSede; //this.formRegistro.get('sede').value;
    data.descripcionPlazo = this.formRegistro.get('descripcion')!.value;
    data.idCaso = this.config.data?.idCaso;
    data.idTramite = this.config.data?.idTramite;
    data.idActoProcesal = this.config.data?.idActoProcesal;
    data.idTipoUnidad = this.formRegistro.get('unidadMedida')!.value;
    data.nroPlazo = this.formRegistro.get('plazo')!.value;
    this.dialogRef.close(data);
  }

  fechaIniInvPreliminar() {
    const fecha = this.calificarCaso.plazos!.at(0)?.fechaEmision;
    return fecha ? format(new Date(fecha), 'dd/MM/yyyy') : null;
  }

  fechaFinInvPreliminar() {
    const fecha = this.calificarCaso.plazos!.at(0)?.fechaFinCalculada;
    return fecha ? format(new Date(fecha), 'dd/MM/yyyy') : null;
  }

  get getFechaFinCalculada() {
    let textoFechaFinCalculada = 'Se calculará al firmar la disposición';
    if (
      TRAMITES.REQUERIMIENTO_PRORROGA_INVESTIGACION_PREPARATORIA ===
      this.idTramiteSeleccionado
    ) {
      textoFechaFinCalculada = 'Se calculará cuando el JIP lo conceda';
    }
    return textoFechaFinCalculada;
  }

  get idComplejidad() {
    const idComplejidadCaso = this.calificarCaso.idTipoComplejidad;
    return idComplejidadCaso;
  }

  get idSede() {
    if (
      TRAMITES.DISPOSICION_AMPLIACION_DILIGENCIAS_PREPARATORIA ===
      this.idTramiteSeleccionado
    ) {
      return this.formRegistro.get('sede')!.value;
    }
    return null;
  }

  private obtenerValorMaxPlazo(): void {
    let idTipoUnidad = this.formRegistro.get('unidadMedida')!.value;
    let idTramite = this.config.data?.idTramite;
    let idActoTramiteEstado = this.calificarCaso.idActoTramiteEstado;
    // let idActoTramiteEstado = this.selectTramiteEstado.idActoTramiteEstado;

    let request: ObtenerValorMaxPlazoRequest =
      {} as ObtenerValorMaxPlazoRequest;
    request.idTipoComplejidad = this.idComplejidad;
    request.idActoTramiteEstado = idActoTramiteEstado;
    request.idTipoUnidad = idTipoUnidad;
    request.idCaso = this.idCaso;
    this.gestionPlazoService
      .obtenerValoMaxPlazo(request)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.valorMaximoResponse = result;
          let plazo = this.formRegistro.get('plazo')!.value;
          this.validarPlazoConValorMaximo(plazo);
        },
      });
  }

  validarPlazoConValorMaximo(plazo: any): void {
    this.msgs2 = [];
    if (!this.valorMaximoResponse) {
      return;
    }
    let unidadMedida = this.formRegistro.get('unidadMedida')!.value;

    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS) {
      this.calcularPlazoTipoDia(plazo);
    }
    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES) {
      this.calcularPlazoTipoMes(plazo);
    }
    if (unidadMedida == UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS) {
      this.calcularPlazoTipoAnio(plazo);
    }
  }

  private calcularPlazoTipoDia(plazo: any): void {
    let valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima;
    if (
      this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS
    ) {
      valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima;
    }
    if (
      this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_MESES
    ) {
      valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima! * 30;
    }
    if (
      this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_ANIOS
    ) {
      valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima! * 30 * 12;
    }
    let plazoTotal = parseInt(plazo) + this.valorMaximoResponse.cantidadTotal!;
    if (plazoTotal > valorMaximoTmp!) {
      this.obtenerMensaje(valorMaximoTmp, true, false, false);
    }
  }

  private calcularPlazoTipoMes(plazo: any): void {
    let valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima;
    let valorMaximoDias = valorMaximoTmp! * 30;
    /*if (this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS) {
      valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima / 30;
    }*/
    let plazoTotal =
      parseInt(plazo) * 30 + this.valorMaximoResponse.cantidadTotal!;
    if (plazoTotal > valorMaximoDias) {
      this.obtenerMensaje(valorMaximoTmp, false, true, false);
    }
  }

  private calcularPlazoTipoAnio(plazo: any): void {
    let valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima;
    let valorMaximoDias = valorMaximoTmp! * 30 * 12;
    let plazoTotal =
      parseInt(plazo) * 30 * 12 + this.valorMaximoResponse.cantidadTotal!;
    if (plazoTotal > valorMaximoDias) {
      this.obtenerMensaje(valorMaximoTmp, false, false, true);
    }
  }

  private obtenerMensaje(dias: any, esDia: any, esMes: any, esAnio: any): void {
    let etiqueta = esDia ? 'días' : esMes ? 'meses' : esAnio ? 'años' : '';
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

  private obtenerTitulo(): void {
    if (
      TRAMITES.DISPOSICION_PRORROGA_INVESTIGACION_PREPARATORIA ===
        this.idTramiteSeleccionado ||
      TRAMITES.REQUERIMIENTO_PRORROGA_INVESTIGACION_PREPARATORIA ===
        this.idTramiteSeleccionado ||
      TRAMITES.RESOLUCION_AUTO_QUE_RESUELVE_PRORROGA ===
        this.idTramiteSeleccionado
    ) {
      this.titulo = this.tituloProrrogar;
      this.tituloNumeroPlazo = 'Plazo prorrogado';
    }
    let tituloHtml = `${this.titulo}`;
    tituloHtml +=
      this.calificarCaso.numeroCaso !== '00000000-0000-0000-0'
        ? ` - Caso: N°${obtenerCasoHtml(this.calificarCaso.numeroCaso!)}`
        : '';
    this.tituloModal = this.sanitizador.bypassSecurityTrustHtml(tituloHtml);
  }

  public cerrarModal(): void {
    this.dialogRef.close(this.plazosIniciales);
  }
}
