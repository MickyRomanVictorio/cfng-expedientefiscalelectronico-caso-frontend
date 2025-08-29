import {CommonModule} from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {obtenerIcono} from '@utils/icon';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {Message, MessageService, SelectItem} from 'primeng/api';
import {DropdownModule} from 'primeng/dropdown';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MessagesModule} from 'primeng/messages';

import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CasoFiscal} from '@core/interfaces/comunes/casosFiscales';
import {TramiteProcesal} from '@core/interfaces/comunes/tramiteProcesal';
import {
  ObtenerValorMaxPlazoRequest,
  ObtenerValorMaxPlazoResponse,
  RegistrarPlazoRequest,
  ValidarPlazoComplejo,
  ValidarPlazoResponse,
} from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import {SelectActoProcesalRequest} from '@interfaces/provincial/bandeja-tramites/SelectedActoTramiteRequest';
import {MaestroService} from '@services/shared/maestro.service';
import {
  SelectedActoTramiteProcesalService
} from '@services/provincial/bandeja-tramites/SeleccionarTramiteProcesalBehavior';
import {GestionPlazoService} from '@services/provincial/gestion-plazo/gestion-plazo.service';
import {COMPLEJIDAD, UNIDAD_MEDIDA} from 'ngx-cfng-core-lib';
import {DigitOnlyModule} from '@directives/digit-only.module';
import {registrarPlazoErrorValidator} from '@utils/registrar-plazo-error-validators';
import {obtenerCasoHtml} from '@utils/utils';
import {format} from 'date-fns';
import {ButtonModule} from 'primeng/button';
import {InputNumberModule} from 'primeng/inputnumber';
import {ProgressBarModule} from 'primeng/progressbar';
import {ToastModule} from 'primeng/toast';
import {of, take} from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-declarar-complejo-caso',
  templateUrl: './declarar-complejo-caso.component.html',
  styleUrls: ['./declarar-complejo-caso.component.scss'],
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
    ProgressBarModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class DeclararComplejoCasoComponent implements OnInit {
  protected formRegistro!: FormGroup;
  protected unidadesMedidas: SelectItem[] = [];
  protected msgs1: Message[] = [];
  protected msgs2: Message[] = [];
  protected msgsValidarPlazo: Message[] = [];
  private titulo: string = 'Declarar complejo';
  tituloNumeroPlazo: string = 'Plazo nuevo';
  private numeroCaso: string = '00000000-0000-0000-0';
  protected obtenerIcono = obtenerIcono;
  protected tituloModal: SafeHtml | undefined = undefined;
  protected calificarCaso!: CasoFiscal;
  protected mensajeCustom: any;
  protected verBarraProgreso: boolean = true;
  private valorMaximoResponse!: ObtenerValorMaxPlazoResponse;
  private validarPlazoResponse!: ValidarPlazoResponse;
  private plazosIniciales: RegistrarPlazoRequest | null = null;
  private idTramiteSeleccionado!: string;
  private idActoTramiteEstado!: string;
  private selectTramiteEstado!: SelectActoProcesalRequest;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  private idCaso: string = '';

  constructor(
    private sanitizador: DomSanitizer,
    private messageService: MessageService,
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private maestroService: MaestroService,
    private gestionPlazoService: GestionPlazoService,
    private tramiteSeleccionadoService: SelectedActoTramiteProcesalService
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
    this.idActoTramiteEstado= this.config.data?.idActoTramiteEstado;

    this.formRegistro
      .get('fechaInicioInvestigacionPreliminar')!
      .setValue(this.fechaIniInvPreliminar());
    this.formRegistro
      .get('fechaFinInvestigacionPreliminarActual')!
      .setValue(this.fechaFinInvPreliminar());

    this.obtenerTitulo();
    this.listarUnidadMedida();
    of(this.listarUnidadMedida()).subscribe({
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
      .setValue(this.getNuevaFechaFinCalculada);

      // .setValue(this.getFechaFinCalculada);
      
    if (this.plazosIniciales !== undefined && this.plazosIniciales !== null) {
      setTimeout(() => {
        this.ingresarFormulario();
      }, 500);
    }

    // this.tramiteSeleccionadoService.getIdTramite().subscribe({
    //   next: (respose) => {
    //     this.selectTramiteEstado = respose!;
    //     console.log("*************************** RESPOSE", respose);
        
    //   },
    // });
  }

  ingresarFormulario() {
    this.formRegistro.patchValue({
      complejidad: this.plazosIniciales!.idTipoComplejidad,
      sede: this.plazosIniciales!.idTipoSedeInvestigacion,
      plazo: this.plazosIniciales!.nroPlazo,
      unidadMedida: this.plazosIniciales!.idTipoUnidad,
      nuevaFechaFinCalculada: this.getNuevaFechaFinCalculada,
      fechaFinCalculada: this.plazosIniciales!.fechaCalculada, //'Se calculará al firmar la disposición',
      descripcion: this.plazosIniciales!.descripcionPlazo,
    });
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
    // if (
    //   this.valorMaximoResponse.idTipoUnidad == UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS
    // ) {
    //   valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima! / 30;
    // }
    // if (plazo > valorMaximoTmp!) {
    //   this.obtenerMensaje(valorMaximoTmp, false, true, false);
    // }
    let plazoTotal =
      parseInt(plazo) * 30 + this.valorMaximoResponse.cantidadTotal!;
    if (plazoTotal > valorMaximoDias) {
      this.obtenerMensaje(valorMaximoTmp, false, true, false);
    }
  }

  private calcularPlazoTipoAnio(plazo: any): void {
    // let valorMaximoTmp: any = this.valorMaximoResponse.cantidadMaxima;
    // if (plazo > valorMaximoTmp) {
    //   this.obtenerMensaje(valorMaximoTmp, false, false, true);
    // }
    let valorMaximoTmp = this.valorMaximoResponse.cantidadMaxima;
    let valorMaximoDias = valorMaximoTmp! * 30 * 12;
    let plazoTotal =
      parseInt(plazo) * 30 * 12 + this.valorMaximoResponse.cantidadTotal!;
    if (plazoTotal > valorMaximoDias) {
      this.obtenerMensaje(valorMaximoTmp, false, false, true);
    }
  }

  private obtenerTitulo(): void {
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

  public declararComplejo(): void {
    if(this.msgs2.length > 0){
      return;
    }
    if (!this.formRegistro.valid) {
      this.formRegistro.markAllAsTouched();
      return;
    }
    this.validarPlazoIngresado();

    this.messageService.clear();
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

          const pruebaDias = UNIDAD_MEDIDA.UNIDAD_MEDIDA_DIAS
          this.formRegistro
            .get('unidadMedida')!
            .setValue(pruebaDias);
        },
      });
  }

  private obtenerValorMaxPlazo(): void {
    let idComplejidad = this.idComplejidad;
    let idTipoUnidad = this.formRegistro.get('unidadMedida')!.value;
    let idTramite = this.config.data?.idTramite;
    console.log("xxxxxx", this.selectTramiteEstado)
    // let idActoTramiteEstado = this.selectTramiteEstado.idActoTramiteEstado;
    let idActoTramiteEstado = this.idActoTramiteEstado;
    let request: ObtenerValorMaxPlazoRequest =
      {} as ObtenerValorMaxPlazoRequest;
    request.idTipoComplejidad = idComplejidad;
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

  private validarPlazoIngresado(): void {
    let idComplejidad = this.idComplejidad;
    let idTipoUnidad = this.formRegistro.get('unidadMedida')!.value;
    let plazoNuevo = this.formRegistro.get('plazo')!.value;
    let idTramite = this.config.data?.idTramite;
    let idActoTramiteEstado = this.idActoTramiteEstado;
    let request: ValidarPlazoComplejo = {} as ValidarPlazoComplejo;
    request.idTipoComplejidad = idComplejidad;
    request.idTipoUnidad = idTipoUnidad;
    request.idCaso = this.calificarCaso.plazos!.at(0)?.idCaso;
    request.idActoTramiteEstado = idActoTramiteEstado;
    request.nuevoPlazoComplejo = plazoNuevo;
    request.idTramite = idTramite;
    request.idActoTramiteCaso = this.calificarCaso.idActoTramiteCasoUltimo;
    this.gestionPlazoService
      .validarPlazoComplejidad(request)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.validarPlazoResponse = result;
          if (this.validarPlazoResponse.respuestaValidacion === 'NO') {
            this.mensajeValidarPlazo(this.validarPlazoResponse.numeroDias!);
            return;
          } else {
            let data: RegistrarPlazoRequest = {} as RegistrarPlazoRequest;
            data.idTipoComplejidad = this.idComplejidad; //this.formRegistro.get('complejidad').value;
            data.idTipoSedeInvestigacion = this.idSede!; //this.formRegistro.get('sede').value;
            data.descripcionPlazo = this.formRegistro.get('descripcion')!.value;
            data.idCaso = this.config.data?.idCaso;
            data.idTramite = this.config.data?.idTramite;
            data.idActoProcesal = this.config.data?.idActoProcesal;
            data.idTipoUnidad = this.formRegistro.get('unidadMedida')!.value;
            data.nroPlazo = this.formRegistro.get('plazo')!.value;
            this.dialogRef.close(data);
          }
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

  fechaIniInvPreliminar() {
    const fecha = this.calificarCaso.plazos!.at(0)?.fechaEmision;
    return fecha ? format(new Date(fecha), 'dd/MM/yyyy') : null;
  }

  fechaFinInvPreliminar() {
    const fecha = this.calificarCaso.plazos!.at(0)?.fechaFinCalculada;
    return fecha ? format(new Date(fecha), 'dd/MM/yyyy') : null;
  }

  get getFechaFinCalculada() {
    let fechaFinCalculadaCaso =
      this.calificarCaso.plazos!.at(0)?.fechaFinCalculada;
    let fechaFinCalculada = format(
      new Date(fechaFinCalculadaCaso!),
      'dd/MM/yyyy'
    );
    return fechaFinCalculada;
  }

  get getNuevaFechaFinCalculada(){
    return 'Se calculará al firmar la disposición';
  }

  get idComplejidad() {
    //let idComplejidadCaso = this.calificarCaso.plazos.at(0)?.complejidad;
    let idComplejidadCaso = this.calificarCaso.idTipoComplejidad;
    if (idComplejidadCaso == COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_SIMPLE) {
      idComplejidadCaso = COMPLEJIDAD.COMPLEJIDAD_PRELIMINAR_COMPLEJO; // si el caso es simple=2, se debe volver complejo=1
    }
    return idComplejidadCaso;
  }

  get idSede() {
    return null;
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

  private mensajeValidarPlazo(numeroPlazo: number): void {
    let mensajeCustomHtml = '';
    mensajeCustomHtml =
      "El plazo a ingresar debe ser mayor a: <span ngStyle='color:#f19700;font-weight: bold;'> " +
      numeroPlazo +
      ' </span>';
    this.mensajeCustom = mensajeCustomHtml;
    this.msgsValidarPlazo = [
      {
        severity: 'warn',
        summary: '',
        detail: this.mensajeCustom,
        icon: 'pi-info-circle',
      },
    ];
  }

  public eliminarCerosIniciales(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let valor = inputElement.value;
  
    // Eliminar ceros iniciales, pero permitir un solo '0' si es el único valor
    valor = valor.replace(/^0+(?!$)/, '');
  
    // Actualiza el valor del input
    inputElement.value = valor;
  
    const formControl = this.formRegistro.get('plazo');
    if (formControl) {
      formControl.setValue(valor, { emitEvent: false });
    }
  }
  
}
