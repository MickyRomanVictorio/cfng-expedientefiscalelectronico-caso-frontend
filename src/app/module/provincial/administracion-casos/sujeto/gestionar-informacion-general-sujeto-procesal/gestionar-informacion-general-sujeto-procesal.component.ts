import * as CONSTANTE
  from '@interfaces/provincial/administracion-casos/sujetos/informaciongeneralsujeto/tipo-sujeto-procesal.type';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  InformacionGeneralSujetoRequest
} from '@interfaces/provincial/administracion-casos/sujetos/informaciongeneralsujeto/InformacionGeneralSujetoRequest';
import {
  DatosReniec,
  InformacionGeneralSujetoApi,
  InformacionGeneralSujetoResponse,
} from '@interfaces/provincial/administracion-casos/sujetos/informaciongeneralsujeto/InformacionGeneralSujetoResponse';
import { SujetoGeneralService } from '@services/generales/sujeto/sujeto-general.service';
import { ListItemResponse, ListItemResponseForm, } from '@core/types/mesa-turno/response/Response';
import { BusquedaRucComponent } from '@components/modals/busqueda-ruc/busqueda-ruc.component';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { firstValueFrom, forkJoin, lastValueFrom, Subscription } from 'rxjs';

import { DireccionRequest } from '@interfaces/reusables/sujeto-procesal/direccionRequest';
import { MaestroService } from '@services/shared/maestro.service';
import { UTILS } from '@environments/environment';
import {
  ListarDireccionSujetoProcesalComponent
} from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/sujetos-procesales/listar-direccion-sujeto-procesal/listar-direccion-sujeto-procesal.component';
import {
  ListarDelitosSujetoProcesalComponent
} from "@modules/provincial/expediente/expediente-detalle/detalle-tramite/sujetos-procesales/listar-delitos-sujeto-procesal/listar-delitos-sujeto-procesal.component";
import { DelitoRequest } from "@interfaces/reusables/sujeto-procesal/delitoRequest";
import { Expediente } from "@utils/expediente";
import { GestionCasoService } from "@services/shared/gestion-caso.service";
import {
  ActualizarDelitosRequest,
  DelitoPorActualizar
} from "@interfaces/reusables/agregar-delito/actualizar-delito-request.interface";
import { ReusablesTransaccionalService } from "@services/reusables/reusables-transaccional.service";
import { NgxCfngCoreModalDialogService, NgxCfngCoreModalDialogModule } from '@ngx-cfng-core-modal/dialog';
import { TIPOS_PARTES } from '@core/types/mesa-turno/denuncia/tipo-de-partes.type';
import { valid, validString } from '@core/utils/string';
import { DateMaskModule } from '@core/directives/date-mask.module';
import dayjs from 'dayjs';
import { DigitOnlyModule } from '@core/directives/digit-only.module';
import { LetterOnlyModule } from '@core/directives/letter-only.module';
import { limpiarFormcontrol, urlConsultaCasoFiscal } from '@core/utils/utils';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';
import { TrimSpacesModule } from '@core/directives/trim-space.module';
import { ValidationModule } from 'dist/ngx-cfng-core-lib';
import { PaginacionCondicion, PaginacionConfiguracion } from '@core/components/consulta-casos/models/listar-casos.model';
import { PaginacionInterface } from '@core/interfaces/comunes/paginacion.interface';
import { ContadorFooterTextareaComponent } from "@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component";
import { TIPO_DOCUMENTO } from '@core/types/persona/reniec.type';

@Component({
  standalone: true,
  selector: 'app-gestionar-informacion-general-sujeto-procesal',
  templateUrl: './gestionar-informacion-general-sujeto-procesal.component.html',
  styleUrls: ['./gestionar-informacion-general-sujeto-procesal.component.scss'],
  imports: [
    DynamicDialogModule,
    ButtonModule,
    DropdownModule,
    RadioButtonModule,
    InputTextModule,
    CommonModule,
    FormsModule,
    CheckboxModule,
    CalendarModule,
    InputNumberModule,
    TableModule,
    CardModule,
    ReactiveFormsModule,
    DateMaskModule,
    ListarDireccionSujetoProcesalComponent,
    ListarDelitosSujetoProcesalComponent,
    DigitOnlyModule,
    LetterOnlyModule,
    NgxCfngCoreModalDialogModule,
    UpperCaseInputModule,
    ValidationModule,
    TrimSpacesModule,
    ContadorFooterTextareaComponent
  ],
  providers: [MessageService, DialogService, DatePipe],
})
export class GestionarInformacionGeneralSujetoProcesalComponent implements OnInit {
  private caso!: Expediente;
  private readonly subscriptions: Subscription[] = [];
  protected formularioInformacionGeneralSujetoProcesal!: FormGroup;
  protected isVerificadoReniec: boolean = false;
  protected isVerificadoSunat: boolean = false;
  protected inputListaDirecciones: DireccionRequest[] = [];
  protected inputListaDireccionesOriginal: DireccionRequest[] = [];
  protected inputListaDelitos: DelitoRequest[] = [];
  protected inputListaDelitosOriginal: DelitoRequest[] = [];
  protected listTipoParteSujeto: ListItemResponseForm[] = [];
  protected listTipoParteSujetoOriginal: ListItemResponseForm[] = [];

  protected listTipoPartePersona: ListItemResponseForm[] = [];
  protected listPaisSujeto: ListItemResponseForm[] = [];
  protected listSexo: ListItemResponseForm[] = [];
  protected listTipoDocumentoNatural: ListItemResponseForm[] = [];
  protected listTipoDocumentoNaturalOriginal: ListItemResponseForm[] = [];
  protected idSujetoProcesalNew: any;
  protected lstTipoVia: any;
  protected lstCargoFuncionario: any;
  protected lstInstitucionPublica: any;
  protected lstTipoDefensor: any;
  protected lstCargoAsociacion: any;
  protected lstTipoViolencia: any;
  protected lstTipoRiesgo: any;
  protected lstTipoDiscapacidad: any;
  protected lstCondicionParte: any;


  // ******* VER USO
  protected sujeto2: string = '0';
  protected tipoRegistro: string = '1'; // 0 registro manual  ----- 1 registro por RENIEC
  // ******* VER USO

  protected date!: Date;
  protected pais: SelectItem[] = [];
  protected idSujeto: any;
  protected listEstadoCivil: ListItemResponseForm[] = [];
  protected listGradoInstruccion: ListItemResponseForm[] = [];
  protected listProfesionOficio: ListItemResponseForm[] = [];
  protected listTipoDocumentoDeclarante: ListItemResponseForm[] = []
  protected nacionalidad: any = '0';
  protected idCasoFiscal!: string;
  protected longitudMinimaInput: number = 8;
  protected longitudMaximaInput: number = 8;
  protected alfanumericoInput: boolean = false;
  protected longitudMinimaDeclaranteInput: number = 8;
  protected longitudMaximaDeclaranteInput: number = 8;
  protected alfanumericoDeclaranteInput: boolean = false;
  protected sujeto: any;
  protected tipoPersona: any = '1';
  protected fechaMaxima!: Date;
  protected esSoloLectura: boolean = false;

  public consultaReniec: DatosReniec | null = null;
  public consultaDeclaranteReniec: any;

  protected faceReniec: string | null = null;
  protected isPersonaFormulario: boolean = true;
  protected isJuridicaFormulario: boolean = false;
  protected isEstadoFormulario: boolean = false;
  protected isNumericoDocumento: boolean = true;
  protected isDeclaranteManual: boolean = false;
  protected showLimpiar: boolean = false;
  protected showBuscarRuc: string = '';
  protected showBuscarDni: string = '';
  protected showCondicion: boolean = false;
  protected showCondicionDetenido: boolean = false;
  protected showCheckAgraviado: boolean = false;
  protected editarRegistro: boolean = false;
  protected listaDirecciones: any[] = [];
  protected numeroCaso!: string;
  protected nombreSujeto!: string;

  protected verificadoDefinitivoNatural: string = CONSTANTE.REGISTRO_MANUAL_NO_VERIFICADO;
  protected verificadoDefinitivoJuridica: string = CONSTANTE.REGISTRO_MANUAL_NO_VERIFICADO;
  protected isEstadoTipoPersona: boolean = false;

  @Input() idSujetoCaso!: string;
  @Input() idCaso!: string;
  @Input() datosEntrada!: InformacionGeneralSujetoRequest;

  @Output() datosGuardados = new EventEmitter<InformacionGeneralSujetoResponse | null>();
  @Output() emitTipoPartePersona = new EventEmitter<ListItemResponse>();
  @Output() onChangeStep = new EventEmitter<number>();
  @Output() onEnviarDatos = new EventEmitter<any>();

  protected readonly visualizarFormulario = {
    DatosInvestigacion: true,
    DatosComplementarios: true,
  };

  CONSTANTES = {
    SI_NO_CONTROL: [
      { label: 'Sí', value: 1 },
      { label: 'No', value: 0 }
    ]
  };

  protected readonly today = new Date();
  protected minDate: Date = new Date(this.today.getFullYear() - 125, this.today.getMonth(), this.today.getDate());
  protected maxDate: Date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 1);

  protected longitudMaximaObservaciones: number = 4000;

  protected paginacionReiniciarDirecciones: boolean = false;
  protected paginacionCondicionDirecciones: PaginacionCondicion = {
    limit: 5,
    page: 1,
    where: {},
  };
  public paginacionConfiguracionDirecciones: PaginacionConfiguracion = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  protected paginacionReiniciarDelitos: boolean = false;
  protected paginacionCondicionDelitos: PaginacionCondicion = {
    limit: 5,
    page: 1,
    where: {},
  };
  public paginacionConfiguracionDelitos: PaginacionConfiguracion = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    private readonly sujetoGeneralService: SujetoGeneralService,
    private readonly maestrosService: MaestroService,
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly gestionCasoService: GestionCasoService,
    private readonly reusableTransaccionService: ReusablesTransaccionalService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
  ) { }

  async ngOnInit() {
    this.caso = this.gestionCasoService.casoActual;
    this.esSoloLectura = (this.caso && (this.caso.flgLectura.toString() === '1' || this.caso.flgConcluido === '1'));
    this.idSujetoCaso = this.activatedRoute.snapshot.params['idSujeto'];
    this.idCasoFiscal = this.router.url.match(/\/caso\/(.*)\/sujeto/)![1];
    this.formBuild();

    this.subscriptions.push(
      this.sujetoGeneralService.stepp$.subscribe((idSujCaso: any) => {
        this.actualizarStep(idSujCaso);
      })
    );

    await this.cargarDatosIniciales();

    if (this.idSujetoCaso != null && this.idSujetoCaso !== '') {
      this.editarRegistro = true;
      this.cargarDatosAEditar();
    }


    this.fechaMaxima = new Date();
    this.fechaMaxima.setDate(this.fechaMaxima.getDate() - 1);
    this.faceReniec = UTILS.DEFAULT_PHOTO;
  }

  //#region "INICIALES"
  private formBuild(): void {
    this.formularioInformacionGeneralSujetoProcesal = this.formBuilder.group({
      tipoParteSujeto: [{ value: null, disabled: false }, [Validators.required]],
      tipoPartePersona: [{ value: null, disabled: false }, [Validators.required]],
      agraviadoEsDenunciante: [{ value: false, disabled: false }],
      paisSujeto: [{ value: null, disabled: false }],
      rdOrigen: [{ value: '0', disabled: false }, [Validators.required]],
      tipoDocumentoNatural: [{ value: null, disabled: false }],
      esMenorEdad: [{ value: false, disabled: false }],
      registroManual: [{ value: false, disabled: true }],
      registroJuridicaManual: [{ value: false, disabled: true }],
      registroJuridicaDeclaranteManual: [{ value: false, disabled: true }],
      nuDocumento: [null],
      nuDocumentoJuridica: [{ value: null, disabled: true }],
      nombresSujeto: [{ value: null, disabled: false }],
      paternoSujeto: [{ value: null, disabled: false }],
      maternoSujeto: [{ value: null, disabled: false }],
      noAliasSujeto: [{ value: null, disabled: false }],
      edadSujeto: [{ value: null, disabled: false }],
      fechaNacimiento: [{ value: null, disabled: false }],
      estadoCivil: [{ value: null, disabled: false }],
      gradoInstruccion: [{ value: null, disabled: false }],
      profesionOficio: [{ value: null, disabled: false }],
      sexoSujeto: [{ value: null, disabled: false }],
      otroProfesionOficio: [{ value: null, disabled: true }],
      tipoDocumentoDeclarante: new FormControl<ListItemResponseForm | null>(
        null
      ),
      razonSocial: [{ value: '', disabled: false }],
      nuDocumentoDeclarante: [''],
      nombresDeclaranteSujeto: [{ value: '', disabled: false }],
      paternoDeclaranteSujeto: [{ value: '', disabled: false }],
      maternoDeclaranteSujeto: [{ value: '', disabled: false }],
      correoDeclaranteSujeto: ['', [Validators.email]],
      telefonoDeclaranteSujeto: [''],
      tipoVerificado: 0,
      condicion: [0],
      funcionarioPublico: [0],
      cargoFuncionario: [{ value: null, disabled: true }],
      institucionPublica: [{ value: null, disabled: true }],
      defensor: [0],
      tipoDefensor: [{ value: null, disabled: true }],
      asociacionDefensor: [0],
      cargoAsociacion: [{ value: null, disabled: true }],
      fechaDetencion: [null],
      fechaValorizacion: [null],
      condicionParte: [{ value: null, disabled: false }],
      tipoViolencia: [{ value: null, disabled: false }],
      tipoRiesgo: [{ value: null, disabled: false }],
      tipoDiscapacidad: [{ value: null, disabled: false }],
      observacion: [null],
    });
  }

  private async cargarDatosIniciales(): Promise<void> {
    const [tipoSujeto, tipoPersona, tipoVia, cargoFuncionario, institucionPublica, tipoDefensor, cargoAsociacion, tipoViolencia, tipoRiesgo, tipoDiscapacidad] = await lastValueFrom(
      forkJoin([
        this.sujetoGeneralService.getTipoSujetoProcesal(this.datosEntrada.isMesa),
        this.sujetoGeneralService.getPersonaOrigen(this.datosEntrada.isMesa, '1'),
        this.maestrosService.obtenertipoviaNuevo(),
        this.maestrosService.listarCargoFuncionario(),
        this.maestrosService.listarInstucionPublica(),
        this.maestrosService.listarTipoDefensor(),
        this.maestrosService.listarCargoAsociacion(),
        this.maestrosService.listarTipoViolencia(),
        this.maestrosService.listarFactorRiesgo(),
        this.maestrosService.listarTipoDiscapacidad(),
      ])
    );
    this.listTipoParteSujetoOriginal = [...tipoSujeto];
    this.listTipoParteSujeto = tipoSujeto;

    this.listTipoParteSujetoOriginal.sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.listTipoParteSujeto.sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.listTipoPartePersona = tipoPersona;
    this.lstTipoVia = tipoVia;
    this.lstCargoFuncionario = cargoFuncionario;
    this.lstInstitucionPublica = institucionPublica;
    this.lstTipoDefensor = tipoDefensor;
    this.lstCargoAsociacion = cargoAsociacion;
    this.lstTipoViolencia = tipoViolencia;
    this.lstTipoRiesgo = tipoRiesgo;
    this.lstTipoDiscapacidad = tipoDiscapacidad;
  }

  protected onToggleControlRdb(controlName: string, respuestaKey: number) {
    const control = this.formularioInformacionGeneralSujetoProcesal.get(controlName) as FormControl;
    if (!control) return;
    control.reset();
    respuestaKey === 0 ? control.disable() : control.enable();
  }

  async cargarDatosAEditar(): Promise<void> {
    if (this.idSujetoCaso !== 'nuevo') {
      try {
        //Consulta de datos
        const data = await this.obtenerSujetoProcesal(this.idSujetoCaso);

        if (data && data.tipoPartePersona) {
          const [tipoSujeto, tipoPersona] = await lastValueFrom(
            forkJoin([
              this.buscarTipoSujeto(data.idTipoParteSujeto),
              this.buscarTipoPersona(data.tipoPartePersona)
            ])
          );
          this.isEstadoTipoPersona = data.tipoPartePersona !== 6;
          
          switch (data.tipoPartePersona) {
            case 1: //Persona Natural
              await this.cargarCombosPersonaNatural(data.flgExtranjero);
              this.showCondicion = true;
              this.showBuscarDni = "";
              const [nacionalidad, sexo, estadoCivil, gradoInstruccion, profesion] = await lastValueFrom(
                forkJoin([
                  this.buscarNacionalidad(data.idPais),
                  this.buscarSexo(data.idSexo),
                  this.buscarEstadoCivil(data.idEstadoCivil),
                  this.buscarGradoDeInstruccion(data.gradoInstruccion),
                  this.buscarProfesion(data.profesion)
                ])
              );
              this.verificadoDefinitivoNatural = data.flgVerficiado;

              if (data.tipoVerificado == '1' && data.idTipoDocumento == CONSTANTE.TIPO_DOCUMENTO_DNI) {
                this.isVerificadoReniec = true;
                this.showBuscarDni = "Actualizar";
                this.limpiarFormularioPersonaNatural(false);
                this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.setValue(false);
                this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.disable();
                this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')?.disable();
                this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')?.disable();
                this.formularioInformacionGeneralSujetoProcesal.get('rdOrigen')?.disable();

              }
              else if ((data.tipoVerificado == '0' && data.flgVerficiado == '0' && data.idTipoDocumento == CONSTANTE.TIPO_DOCUMENTO_DNI)
                || (data.tipoVerificado == '4' && data.idTipoDocumento == CONSTANTE.TIPO_DOCUMENTO_DNI)) {
                this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.setValue(true);
                this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.enable();
                this.showBuscarDni = "Actualizar";
              }
              else {
                this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.setValue(true);
                this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.disable();
              }

              this.formularioInformacionGeneralSujetoProcesal.patchValue({
                tipoParteSujeto: tipoSujeto,
                tipoPartePersona: tipoPersona,
                rdOrigen: data.flgExtranjero !== null ? Number(data.flgExtranjero) : 0,
                agraviadoEsDenunciante: false,
                paisSujeto: nacionalidad,
                tipoDocumentoNatural: await this.buscarTipoDocumento(data.idTipoDocumento),
                nuDocumento: data.nuDocumento,
                nombresSujeto: data.nombresSujeto,
                paternoSujeto: data.paternoSujeto,
                maternoSujeto: data.maternoSujeto,
                noAliasSujeto: data.noAliasSujeto,
                //esMenorEdad: data.esMenorEdad === '1' ? true : false,
                //edadSujeto: data.fechaNacimiento != null? data.edadSujeto :null,
                edadSujeto: data.edadSujeto,
                fechaNacimiento: data.fechaNacimiento != null ? this.stringToDate(data.fechaNacimiento) : null,
                estadoCivil: estadoCivil,
                gradoInstruccion: gradoInstruccion,
                profesionOficio: profesion,
                sexoSujeto: sexo,
                otroProfesionOficio: data.otraProfesion,
                razonSocial: data.noRazonSocial,
                condicion: data.condicion,
                tipoVerificado: data.tipoVerificado,
                funcionarioPublico: data.funcionarioPublico,
                cargoFuncionario: this.buscarCargoFuncionario(data.cargoFuncionario),
                institucionPublica: this.buscarInstitucionPublica(data.institucionPublica),
                defensor: data.defensor,
                tipoDefensor: this.buscarTipoDefensor(data.tipoDefensor),
                asociacionDefensor: data.asociacionDefensor,
                cargoAsociacion: this.buscarCargoAsociacion(data.cargoAsociacion),
                fechaDetencion: data.fechaDetencion != null ? this.stringToDate(data.fechaDetencion) : null,
                fechaValorizacion: data.fechaValorizacion != null ? this.stringToDate(data.fechaValorizacion) : null,
                condicionParte: data.condicionParte,
                //condicionParte: this.buscarCondicionParte(data.condicionParte),
                tipoViolencia: this.buscarTipoViolencia(data.tipoViolencia),
                tipoRiesgo: this.buscarTipoRiesgo(data.tipoRiesgo),
                tipoDiscapacidad: this.buscarTipoDiscapacidad(data.tipoDiscapacidad),
                observacion: data.observacion,
              });

              this.formularioInformacionGeneralSujetoProcesal.get('cargoFuncionario')?.[data.funcionarioPublico == 0 ? 'disable' : 'enable']();
              this.formularioInformacionGeneralSujetoProcesal.get('institucionPublica')?.[data.funcionarioPublico == 0 ? 'disable' : 'enable']();
              this.formularioInformacionGeneralSujetoProcesal.get('tipoDefensor')?.[data.defensor == 0 ? 'disable' : 'enable']();
              this.formularioInformacionGeneralSujetoProcesal.get('cargoAsociacion')?.[data.asociacionDefensor == 0 ? 'disable' : 'enable']();
              /**if (data.edadSujeto < 18) {
                this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.setValue(true);
              }**/
              //this.formularioInformacionGeneralSujetoProcesal.get('asociacionDefensor')!.value?.id === 0 


              this.formularioInformacionGeneralSujetoProcesal.get('profesionOficio')?.enable();
              this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')?.[data.idTipoDocumento == 3 ? 'disable' : 'enable']();

              if (data.flgExtranjero != '1') {
                this.formularioInformacionGeneralSujetoProcesal.get('paisSujeto')?.disable();
              }

              if (data.profesion === CONSTANTE.OTRAS_PROFESIONES) {
                this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio')?.enable();
                limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio'), [Validators.required]);
              } else {
                this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio')?.disable();
                limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio'), []);
              }
              this.habilitarRadioCondicion();
              this.establecerLongitudCampo(data.idTipoDocumento);

              if(data.esMenorEdad === '1'){
                this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.setValue(true);
              }

              this.actualizarValidacionForm([
                { name: 'tipoDocumentoNatural', validators: [Validators.required] },
                { name: 'nuDocumento', validators: [Validators.required] },
                { name: 'nombresSujeto', validators: [Validators.required] },
                { name: 'paternoSujeto', validators: [Validators.required] },
                { name: 'sexoSujeto', validators: [Validators.required] },
              ]);
              break;
            case 2: // Persona Juridica
              await this.cargarCombosPersonaJuridica();
              this.listTipoParteSujeto = this.listTipoParteSujetoOriginal.filter(item =>
                [TIPOS_PARTES.DENUNCIANTE, TIPOS_PARTES.AGRAVIADO, TIPOS_PARTES.DENUNCIADO].includes(item.id)
              );
              this.isVerificadoSunat = true;
              this.verificadoDefinitivoJuridica = data.flgVerficiado;
              this.showBuscarRuc = 'Actualizar';
              this.isPersonaFormulario = false;
              this.isJuridicaFormulario = true;
              this.isEstadoFormulario = false;
              this.limpiarFormularioPersonaJuridica(false);
              this.tipoPersona = CONSTANTE.PERSONA_JURIDICA;
              this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoDeclarante')?.enable();
              this.formularioInformacionGeneralSujetoProcesal.get('nuDocumentoDeclarante')?.[data.idTipoDocumentoRepre == 3 ? 'disable' : 'enable']();

              this.formularioInformacionGeneralSujetoProcesal.patchValue({
                tipoParteSujeto: tipoSujeto,
                tipoPartePersona: tipoPersona,
                tipoDocumentoNatural: 2,
                agraviadoEsDenunciante: false,
                tipoDocumentoDeclarante: await this.buscarTipoDocumentoDeclarante(data.idTipoDocumentoRepre),
                registroManual: data.flgVerficiado !== '1',
                registroJuridicaManual: data.flgVerficiadoJuri !== '1',
                registroJuridicaDeclaranteManual: data.flgVerficiadoRepre !== '1',
                nuDocumentoJuridica: data.nuDocumento,
                razonSocial: data.noRazonSocial,
                nuDocumentoDeclarante: data.nuDocumentoRepre,
                nombresDeclaranteSujeto: data.nombresSujetoRepre,
                paternoDeclaranteSujeto: data.paternoSujetoRepre,
                maternoDeclaranteSujeto: data.maternoSujetoRepre,
                correoDeclaranteSujeto: data.correo,
                telefonoDeclaranteSujeto: data.celular,
                tipoVerificado: data.tipoVerificado
              });

              break;
            case 4: // EL ESTADO
            case 6: // LQQR
            case 7: // LA SOCIEDAD              
              this.isPersonaFormulario = false;
              this.isJuridicaFormulario = false;
              this.formularioInformacionGeneralSujetoProcesal.patchValue({
                tipoParteSujeto: tipoSujeto,
                tipoPartePersona: tipoPersona
              });
              break;
          }

          const esMenorEdad = this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.value;
          if(esMenorEdad){
            this.formularioInformacionGeneralSujetoProcesal.get('estadoCivil')?.disable();
            this.inicializarMenorEdad(true)
          }

          this.inputListaDireccionesOriginal = this.setDirecciones(data.listDireccion);
          this.inputListaDirecciones = this.setDirecciones(data.listDireccion);
          this.paginacionConfiguracionDirecciones.data.data = this.inputListaDireccionesOriginal;
          this.paginacionConfiguracionDirecciones.data.total = this.inputListaDireccionesOriginal.length;
          this.actualizarListaCasosPaginacionDirecciones(this.inputListaDireccionesOriginal, true);

          this.inputListaDelitosOriginal = data.listDelitos;
          this.inputListaDelitos = data.listDelitos;
          this.paginacionConfiguracionDelitos.data.data = this.inputListaDelitosOriginal;
          this.paginacionConfiguracionDelitos.data.total = this.inputListaDelitosOriginal.length;
          this.actualizarListaCasosPaginacionDelitos(this.inputListaDelitosOriginal, true);

          this.numeroCaso = data.coCaso;
          this.nombreSujeto = data.nombresSujeto + ' ' + data.paternoSujeto + ' ' + data.maternoSujeto;
        }
      } catch (error) {
        console.error('Error al cargar los datos', error);
      }
    }
    else {
      //SETEA POR DEFECTO PERSONA NATURAL
      this.formularioInformacionGeneralSujetoProcesal.get('tipoPartePersona')?.setValue
        ({ id: Number(CONSTANTE.PERSONA_NATURAL), nombre: CONSTANTE.PERSONA_NATURAL_DESCRIPCION });
      this.cambiarTipoPartePersona();
    }
  }

  protected eventoBuscarPorTextoDirecciones(buscarValor: string) {
    const filtrados = this.inputListaDirecciones.filter((data: any) =>
      Object.values(data).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' ||
            typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(buscarValor.toLowerCase())
      ));

    this.inputListaDireccionesOriginal = filtrados;

    this.paginacionConfiguracionDirecciones.data.data = this.inputListaDireccionesOriginal;
    this.paginacionConfiguracionDirecciones.data.total = this.inputListaDireccionesOriginal.length;
    //if(this.inputListaDireccionesOriginal.length > 5){
    this.actualizarListaCasosPaginacionDirecciones(this.inputListaDireccionesOriginal, true);
    //}
  }

  protected eventoBuscarPorTextoDelitos(buscarValor: string) {
    const filtrados = this.inputListaDelitos.filter((data: any) =>
      Object.values(data).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' ||
            typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(buscarValor.toLowerCase())
      ));

    this.inputListaDelitosOriginal = filtrados;

    this.paginacionConfiguracionDelitos.data.data = this.inputListaDelitosOriginal;
    this.paginacionConfiguracionDelitos.data.total = this.inputListaDelitosOriginal.length;
    //if(this.inputListaDelitosOriginal.length > 5){
    this.actualizarListaCasosPaginacionDelitos(this.inputListaDelitosOriginal, true);
    //}
  }

  private setDirecciones(direcciones: any[]): any[] {
    let lista: any[] = [];
    direcciones &&
      direcciones.forEach((d) => {
        lista.push({
          tipoDireccion: d.codTipoDireccion,
          dpto: d.codDepartamento,
          provincia: d.codProvincia,
          distrito: d.codDistrito,
          centroPoblado: d.centroPoblado,
          cpoblado: d.codCentroPoblado,
          tipoVia: d.tipoVia,
          nombre: d.direccionNombre,
          nroDireccion: d.numero,
          prefijoUrb: d.prefijo,
          nombreUrb: d.urbanizacion,
          block: d.block,
          interior: d.interior,
          etapa: d.etapa,
          mz: d.mz,
          lote: d.lt,
          sujeto: '0',
          referencia: d.referencia,
          lat: d.lat,
          lon: d.lon,
          dptoNombre: d.departamento,
          provinciaNombre: d.provincia,
          distritoNombre: d.distrito,
          tipoDireccionNombre: d.tipoDireccion,
          registradoPor: d.registradoPor,
          fechaRegistro: d.fechaRegistro,
          item: '',
          origen: d.origen,
          idDireccion: d.idDireccion,
          pais: d.pais,
          fechaActualizacion: d.fechaActualizacion,
          actualizadoPor: d.actualizadoPor,
          habilitado: d.habilitado,
          paisNombre: d.paisNombre
        });
      });

    return lista;
  }

  async cargarCombosPersonaNatural(flgExtranjero: string): Promise<void> {
    try {
      flgExtranjero === '1' ? flgExtranjero = CONSTANTE.EXTRANJERO : flgExtranjero = CONSTANTE.NACIONAL;
      const [gradoInstruccion, tipoDocumento, nacionalidad, estadoCivil, profesion, sexo] = await lastValueFrom(
        forkJoin([
          this.sujetoGeneralService.getInstruccion(),
          this.sujetoGeneralService.getTipoDocumentoPersonaNacionalidad(CONSTANTE.PERSONA_NATURAL, flgExtranjero),
          this.sujetoGeneralService.getPaises(),
          this.sujetoGeneralService.getEstadoCivil(),
          this.sujetoGeneralService.getProfesionOficio(),
          this.sujetoGeneralService.getSexos()
        ])
      );
      this.listGradoInstruccion = gradoInstruccion.data;
      this.listTipoDocumentoNatural = tipoDocumento.data;
      this.listTipoDocumentoNaturalOriginal = tipoDocumento.data;
      this.listPaisSujeto = nacionalidad.data;
      this.listEstadoCivil = estadoCivil.data;
      this.listProfesionOficio = profesion.data;
      this.listSexo = sexo.data;
    } catch (error) {
      console.error('Error al cargar los combos', error);
    }
  }

  async cargarCombosPersonaJuridica(): Promise<void> {
    try {
      const tipoDocumento = await firstValueFrom(
        this.sujetoGeneralService.getTipoDocumentoPersona(CONSTANTE.PERSONA_NATURAL)
      );
      this.listTipoDocumentoDeclarante = tipoDocumento.data;
      const registroRuc: ListItemResponseForm = {
        id: 2,
        nombre: "RUC",
      };
      this.listTipoDocumentoDeclarante.push(registroRuc);
    } catch (error) {
      console.error('Error al cargar los combos', error);
    }
  }

  private buscarTipoSujeto(id: number): Promise<any> {
    return new Promise((resolve) => {
      const tipoSujeto = this.listTipoParteSujeto.find((e) => e.id === id);
      resolve(tipoSujeto);
    });
  }

  private buscarTipoPersona(id: number): Promise<any> {
    return new Promise((resolve) => {
      const tipoPersona = this.listTipoPartePersona.find((e) => e.id === id);
      resolve(tipoPersona);
    });
  }

  private buscarNacionalidad(id: number): Promise<any> {
    return new Promise((resolve) => {
      const nacionalidad = this.listPaisSujeto.find((e) => e.id === id);
      resolve(nacionalidad);
    });
  }

  private buscarTipoDocumento(id: number): Promise<any> {
    console.log(id)
    return new Promise((resolve) => {
      const tipoDocumento = this.listTipoDocumentoNatural.find(
        (e) => e.id === id
      );
      resolve(tipoDocumento);
    });
  }

  private buscarTipoDocumentoDeclarante(id: number): Promise<any> {
    return new Promise((resolve) => {
      const tipoDocumentoDeclarante = this.listTipoDocumentoDeclarante.find(
        (e) => e.id === id
      );
      resolve(tipoDocumentoDeclarante);
    });
  }

  private buscarSexo(id: number): Promise<any> {
    return new Promise((resolve) => {
      const sexo = this.listSexo.find((e) => Number(e.idEquivalente) === id);
      resolve(sexo);
    });
  }

  private buscarEstadoCivil(id: number): Promise<any> {
    return new Promise((resolve) => {
      const estadoCivil = this.listEstadoCivil.find((e) => e.id === id);
      resolve(estadoCivil);
    });
  }

  private buscarGradoDeInstruccion(id: number): Promise<any> {
    return new Promise((resolve) => {
      const gradoInstruccion = this.listGradoInstruccion.find(
        (e) => e.id === id
      );
      resolve(gradoInstruccion);
    });
  }

  private buscarProfesion(id: number): Promise<any> {
    return new Promise((resolve) => {
      const profesion = this.listProfesionOficio.find((e) => e.id === id);
      resolve(profesion);
    });
  }

  private buscarCargoFuncionario(id: number): number {
    return this.lstCargoFuncionario.find(
      (e: any) => e.id === id
    )?.id;
  }

  private buscarInstitucionPublica(id: number): number {
    return this.lstInstitucionPublica.find(
      (e: any) => e.id === id
    )?.id;
  }

  private buscarTipoDefensor(id: number): number {
    return this.lstTipoDefensor.find(
      (e: any) => e.id === id
    )?.id;
  }

  private buscarCargoAsociacion(id: number): number {
    return this.lstCargoAsociacion.find(
      (e: any) => e.id === id
    )?.id;
  }

  private buscarCondicionParte(id: number): number {
    return this.lstCondicionParte.find(
      (e: any) => e.id === id
    )?.id;
  }

  private buscarTipoViolencia(id: number): number {
    return this.lstTipoViolencia.find(
      (e: any) => e.id === id
    )?.id;
  }

  private buscarTipoRiesgo(id: number): number {
    return this.lstTipoRiesgo.find(
      (e: any) => e.id === id
    )?.id;
  }

  private buscarTipoDiscapacidad(id: number): number {
    return this.lstTipoDiscapacidad.find(
      (e: any) => e.id === id
    )?.id;
  }

  //#endregion

  protected cambiarTipoPartePersona() {
    if (!this.editarRegistro) this.limpiarDirecciones();
    this.emitTipoPartePersona.emit(
      this.formularioInformacionGeneralSujetoProcesal.value
        .tipoPartePersona as ListItemResponse
    );

    this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')?.setValue(null);
    this.limpiarFormularioDatosInvestigacion(true);

    if (this.formularioInformacionGeneralSujetoProcesal.value.tipoPartePersona?.id == CONSTANTE.PERSONA_NATURAL) {
      this.showBuscarRuc = '';
      this.iniciarFormularioPersonaNatural();
      this.isPersonaFormulario = true;
      this.isJuridicaFormulario = false;
      this.isEstadoFormulario = false;
      this.limpiarFormularioPersonaNatural(false);
      this.tipoPersona = CONSTANTE.PERSONA_NATURAL;
      this.showCondicion = true;
      this.listTipoParteSujeto = [...this.listTipoParteSujetoOriginal];

    } else if (
      this.formularioInformacionGeneralSujetoProcesal.value.tipoPartePersona
        ?.id == CONSTANTE.PERSONA_JURIDICA
    ) {
      this.showBuscarRuc = 'Buscar';
      this.iniciarFormularioPersonaJuridica();
      this.isPersonaFormulario = false;
      this.isJuridicaFormulario = true;
      this.isEstadoFormulario = false;
      this.limpiarFormularioPersonaJuridica(false);
      this.tipoPersona = CONSTANTE.PERSONA_JURIDICA;
      this.showCondicion = false;
      this.listTipoParteSujeto = [];
      this.listTipoParteSujeto = this.listTipoParteSujetoOriginal.filter(item =>
        [TIPOS_PARTES.DENUNCIANTE, TIPOS_PARTES.AGRAVIADO, TIPOS_PARTES.DENUNCIADO].includes(item.id)
      );

    } else {
      this.listTipoParteSujeto = [...this.listTipoParteSujetoOriginal];
      this.showBuscarRuc = '';
      this.actualizarValidacionForm([]);
      this.isPersonaFormulario = false;
      this.isJuridicaFormulario = false;
      this.isEstadoFormulario = true;
      this.showCondicion = false;
    }
  }

  private limpiarFormularioDatosInvestigacion(desactivar: boolean): void {
    this.consultaReniec = null; //consulta reniec null

    const controlesHabilitar = [
      'funcionarioPublico',
      'cargoFuncionario',
      'institucionPublica',
      'defensor',
      'tipoDefensor',
      'asociacionDefensor',
      'cargoAsociacion',
      'fechaValorizacion',
      'fechaDetencion',
      'condicionParte',
      'tipoViolencia',
      'tipoRiesgo',
      'tipoDiscapacidad',
      'observacion',
    ];

    controlesHabilitar.forEach((controlName) => {
      const control = this.formularioInformacionGeneralSujetoProcesal.get(controlName);

      if (control) {
        desactivar ? control.enable() : control.disable();
        control.setValue('');
      }
    });
  }

  private getTipoDocumentoPersonaNacionalidad(idNacionalidad: string): void {
    this.sujetoGeneralService.getTipoDocumentoPersonaNacionalidad(CONSTANTE.PERSONA_NATURAL, idNacionalidad).subscribe((data: any) => {
      /**this.listTipoDocumentoNatural = data.data;**/
      this.listTipoDocumentoNaturalOriginal = data.data; // guarda la lista completa
      this.listTipoDocumentoNatural = [...data.data];     // copia inici
    });
  }

  private iniciarFormularioPersonaNatural(): void {
    /**this.sujetoGeneralService.getTipoDocumentoPersonaNacionalidad(CONSTANTE.PERSONA_NATURAL, CONSTANTE.NACIONAL).subscribe((data: any) => {
      this.listTipoDocumentoNatural = data.data;
    });**/

    this.getTipoDocumentoPersonaNacionalidad(CONSTANTE.NACIONAL);

    this.sujetoGeneralService.getPaises().subscribe((data: any) => {
      this.listPaisSujeto = data.data;
      const paisSujeto = this.listPaisSujeto.find((i) => i.id == CONSTANTE.PAIS_PERU);
      this.formularioInformacionGeneralSujetoProcesal.patchValue({ paisSujeto, });
    });

    this.sujetoGeneralService.getInstruccion().pipe().subscribe((data: any) => {
      this.listGradoInstruccion = data.data;
    });

    this.sujetoGeneralService.getEstadoCivil().subscribe((data: any) => {
      this.listEstadoCivil = data.data;
    });

    this.sujetoGeneralService.getProfesionOficio().subscribe((data: any) => {
      this.listProfesionOficio = data.data;
    });

    this.sujetoGeneralService.getSexos().subscribe((data: any) => {
      this.listSexo = data.data;
    });

    this.formularioInformacionGeneralSujetoProcesal.get('rdOrigen')?.setValue(0);
    this.formularioInformacionGeneralSujetoProcesal.get('paisSujeto')!.disable();

    this.actualizarValidacionForm([
      { name: 'tipoDocumentoNatural', validators: [Validators.required] },
      { name: 'nuDocumento', validators: [Validators.required] },
      { name: 'nombresSujeto', validators: [Validators.required] },
      { name: 'paternoSujeto', validators: [Validators.required] },
      { name: 'sexoSujeto', validators: [Validators.required] },
      { name: 'condicion', validators: [Validators.required] },
    ]);
  }

  private iniciarFormularioPersonaJuridica(): void {
    this.sujetoGeneralService.getTipoDocumentoPersona(CONSTANTE.PERSONA_NATURAL).subscribe((data: any) => {
      this.listTipoDocumentoDeclarante = data.data;

      const excluirIds = [3, 10];
      // Filtrar quitando los que tengan esos ids
      this.listTipoDocumentoDeclarante = this.listTipoDocumentoDeclarante.filter(
        (item) => !excluirIds.includes(item.id)
      );

      const registroRuc: ListItemResponseForm = {
        id: 2,
        nombre: "RUC",
      };
      this.listTipoDocumentoDeclarante.push(registroRuc);
    });

    this.limpiarFormularioPersonaJuricaProcurador(false);

    this.actualizarValidacionForm([
      { name: 'nombresDeclaranteSujeto', validators: [Validators.required] },
      { name: 'paternoDeclaranteSujeto', validators: [Validators.required] },
    ]);
  }

  private actualizarStep(idSujeto: string) {
    this.idSujetoCaso = idSujeto;
    this.onChangeStep.emit(1);
    this.onEnviarDatos.emit({ idSujetoCaso: this.idSujetoCaso });
  }

  validarBuscarNaturalDocumento(input: string): boolean {
    const nroDocumentoBuscar: string = this.formularioInformacionGeneralSujetoProcesal.get(input)?.value;
    return !valid(nroDocumentoBuscar) || nroDocumentoBuscar.length !== 8;
  }


  protected buscarNaturalDocumento(): void {
    const nroDocumentoBuscar: string = this.formularioInformacionGeneralSujetoProcesal.getRawValue().nuDocumento;
    if (this.showBuscarDni === 'Buscar') {
      this.limpiarFormularioPersonaNatural(false);
    }

    this.limpiarDirecciones();
    this.minDate = new Date(this.today.getFullYear() - 125, this.today.getMonth(), this.today.getDate());

    /**this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.enable();**/
    this.formularioInformacionGeneralSujetoProcesal.get('noAliasSujeto')?.enable();
    this.formularioInformacionGeneralSujetoProcesal.get('noAliasSujeto')!.setValue('');

    this.subscriptions.push(
      this.sujetoGeneralService.getConsultaReniec(nroDocumentoBuscar).subscribe({
        next: (resp) => {
          if (resp.nombres) {
            this.consultaReniec = resp;
            this.isVerificadoReniec = true;
            /**this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.setValue(false);**/

            this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.disable();
            this.formularioInformacionGeneralSujetoProcesal.patchValue({
              nuDocumento: this.consultaReniec!.numeroDocumento,
              nombresSujeto: validString(this.consultaReniec!.nombres),
              maternoSujeto: validString(this.consultaReniec!.apellidoMaterno),
              paternoSujeto: validString(this.consultaReniec!.apellidoPaterno),
              edadSujeto: this.consultaReniec!.edad,
              fechaNacimiento: this.stringToDate(this.consultaReniec!.fechaNacimiento),
              sexoSujeto: this.listSexo
                .find((s) => this.consultaReniec!.codigoGenero == s.idEquivalente!.toString()),
              estadoCivil: this.listEstadoCivil
                .find((e) => this.consultaReniec!.tipoEstadoCivil == e.idEquivalente!.toString()),
              gradoInstruccion: this.listGradoInstruccion
                .find((g) => g.idEquivalente!.toString().includes(this.consultaReniec!.codigoGradoInstruccion)),
            });

            let direccionReniec: DireccionRequest =
              this.setDireccionReniec();
            this.inputListaDirecciones.push(direccionReniec);
            this.formularioInformacionGeneralSujetoProcesal.get('profesionOficio')?.enable();
            this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')!.setValue(nroDocumentoBuscar);
            //this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')!.disable();

            this.formularioInformacionGeneralSujetoProcesal.get('fechaNacimiento')?.disable();
            this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')?.disable();

            this.showLimpiar = true;
            this.formularioInformacionGeneralSujetoProcesal.get('tipoVerificado')!.setValue(1);
          }
        },
        error: (error) => {
          this.modalDialogService.warning("Advertencia", 'El servicio de RENIEC no se encuentra disponible en este momento. Por favor, ingrese los datos manualmente.', 'Aceptar');

          this.isVerificadoReniec = false;

          this.formularioInformacionGeneralSujetoProcesal.get('fechaNacimiento')?.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')?.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('fechaNacimiento')?.reset();
          this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')!.setValue(null);

          this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.setValue(true);
          this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')?.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')?.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('rdOrigen')?.enable();
          this.activarRegistroManualPersonaNatural({ checked: true });
          this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')!.setValue(nroDocumentoBuscar);
          this.formularioInformacionGeneralSujetoProcesal.get('tipoVerificado')!.setValue(0);
        },
      })
    );
  }

  private limpiarDirecciones() {
    this.inputListaDirecciones = [];
  }

  public buscarJuridicaDocumento(): void {
    const formData = this.formularioInformacionGeneralSujetoProcesal.getRawValue();
    const ruc = formData.nuDocumentoJuridica;
    const editar = this.idSujetoCaso !== 'nuevo';
    const dialog = this.dialogService.open(BusquedaRucComponent, {
      data: { ruc, editar },
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '15px' },
    });

    dialog.onClose.subscribe({
      next: (data) => {
        if (data) {
          this.isVerificadoSunat = true;
          this.formularioInformacionGeneralSujetoProcesal.patchValue({
            razonSocial: data.razonSocial,
            nuDocumentoJuridica: data.numeroRuc,
            tipoVerificado: 2
          });

        } else {
          if (!this.isVerificadoSunat) {
            this.formularioInformacionGeneralSujetoProcesal.patchValue({
              razonSocial: '',
              nuDocumentoJuridica: '',
              tipoVerificado: 0
            });
          }
        }
      },
    });
  }


  private stringToDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  onListaDirecciones(event: any) {
    this.inputListaDireccionesOriginal = event;
    this.inputListaDirecciones = event;
    this.paginacionConfiguracionDirecciones.data.data = this.inputListaDireccionesOriginal;
    this.paginacionConfiguracionDirecciones.data.total = this.inputListaDireccionesOriginal.length;
    this.actualizarListaCasosPaginacionDirecciones(this.inputListaDireccionesOriginal, true);
  }

  onListaDelitos(event: any) {
    this.inputListaDelitosOriginal = event;
    this.inputListaDelitos = event;
    this.paginacionConfiguracionDelitos.data.data = this.inputListaDelitosOriginal;
    this.paginacionConfiguracionDelitos.data.total = this.inputListaDelitosOriginal.length;
    this.actualizarListaCasosPaginacionDelitos(this.inputListaDelitosOriginal, true);
  }

  public habilitarRadioCondicion(): void {
    const { tipoParteSujeto } = this.formularioInformacionGeneralSujetoProcesal.value;
    const condicion = this.formularioInformacionGeneralSujetoProcesal.get('condicion');
    if (tipoParteSujeto?.id) {
      if (tipoParteSujeto.id === TIPOS_PARTES.IMPUTADO) {
        this.showCondicionDetenido = true;
      } else if (condicion?.value == TIPOS_PARTES.DENUNCIANTE) {
        this.formularioInformacionGeneralSujetoProcesal.get('condicion')?.setValue(null);
        this.showCondicionDetenido = false;
      } else {
        this.showCondicionDetenido = false;
        //
        if (tipoParteSujeto.id === TIPOS_PARTES.DENUNCIANTE || tipoParteSujeto.id === TIPOS_PARTES.DENUNCIADO
          || tipoParteSujeto.id === TIPOS_PARTES.AGRAVIADO
        ) {
          this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.setValue(false);
        }
      }
      this.obtenerCondicionParte(tipoParteSujeto.id);
    }
  }

  public obtenerCondicionParte(tipoParteSujeto: number) {
    this.maestrosService.obtenerCondicionSujeto('MPT', tipoParteSujeto)
      .subscribe({
        next: (data) => {
          this.lstCondicionParte = data;
        },
        error: (err) => {
          console.error('Error obteniendo condiciones de sujeto:', err);
        }
      });
  }

  public actualizarPais() {
    limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio'), []);
    if (this.formularioInformacionGeneralSujetoProcesal.value.paisSujeto.id === CONSTANTE.PAIS_PERU) {
      /**this.sujetoGeneralService.getTipoDocumentoPersonaNacionalidad(CONSTANTE.PERSONA_NATURAL, CONSTANTE.NACIONAL
      ).subscribe((data: any) => {
        this.listTipoDocumentoNatural = data.data;
      });**/
      this.getTipoDocumentoPersonaNacionalidad(CONSTANTE.NACIONAL);
      this.nacionalidad = CONSTANTE.NACIONAL;
      this.formularioInformacionGeneralSujetoProcesal.get('rdOrigen')!.setValue(CONSTANTE.FLG_PERUANO);
      this.formularioInformacionGeneralSujetoProcesal.get('paisSujeto')!.disable();
      this.activarRegistroManualPersonaNatural({ checked: false });
    } else {
      /**this.sujetoGeneralService.getTipoDocumentoPersonaNacionalidad(CONSTANTE.PERSONA_NATURAL, CONSTANTE.EXTRANJERO).subscribe((data: any) => {
        this.listTipoDocumentoNatural = data.data;
      });**/
      this.getTipoDocumentoPersonaNacionalidad(CONSTANTE.EXTRANJERO);
      this.formularioInformacionGeneralSujetoProcesal.get('paisSujeto')!.enable();
      this.formularioInformacionGeneralSujetoProcesal.get('rdOrigen')!.setValue(CONSTANTE.FLG_EXTRANJERO);
      this.nacionalidad = CONSTANTE.EXTRANJERO;
      this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.disable();
      this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.setValue(true);
    }
  }

  public actualizaTipoOrigen() {
    this.showLimpiar = true;
    this.showBuscarDni = '';
    this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')?.enable();
    this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')?.enable();
    this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')!.setValue(null);
    limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio'), []);

    if (this.formularioInformacionGeneralSujetoProcesal.value.rdOrigen === CONSTANTE.FLG_PERUANO) {
      limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('paisSujeto'), []);

      this.tipoPersona = CONSTANTE.FLG_PERUANO;
      if (!this.consultaReniec) {
        this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.disable();
        this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.setValue(false);
        this.activarRegistroManualPersonaNatural({ checked: false });
      }
      this.nacionalidad = CONSTANTE.NACIONAL;
      /**this.sujetoGeneralService.getTipoDocumentoPersonaNacionalidad(CONSTANTE.PERSONA_NATURAL, CONSTANTE.NACIONAL).subscribe((data: any) => {
        this.listTipoDocumentoNatural = data.data;
      });**/
      this.getTipoDocumentoPersonaNacionalidad(CONSTANTE.NACIONAL);
      const paisSujeto = this.listPaisSujeto.find((i) => i.id == CONSTANTE.PAIS_PERU);
      this.formularioInformacionGeneralSujetoProcesal.patchValue({ paisSujeto, });
      this.longitudMaximaInput = 8;
    } else {
      //this.tipoPersona = CONSTANTE.PERSONA_JURIDICA;
      limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('paisSujeto'), [Validators.required]);

      this.nacionalidad = CONSTANTE.EXTRANJERO;
      this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.disable();
      this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.setValue(true);
      this.activarRegistroManualPersonaNatural({ checked: true });
      /**this.sujetoGeneralService.getTipoDocumentoPersonaNacionalidad(CONSTANTE.PERSONA_NATURAL, CONSTANTE.EXTRANJERO).subscribe((data: any) => {
        this.listTipoDocumentoNatural = data.data;
      });**/
      this.getTipoDocumentoPersonaNacionalidad(CONSTANTE.EXTRANJERO);

      const paisSujeto = this.listPaisSujeto.find((i) => i.id == 1);
      this.formularioInformacionGeneralSujetoProcesal.patchValue({
        paisSujeto,
      });

      this.longitudMaximaInput = 9;
    }

    if (this.formularioInformacionGeneralSujetoProcesal.get('rdOrigen')!.value === '0') {
      this.formularioInformacionGeneralSujetoProcesal.get('paisSujeto')!.disable();
    } else {
      this.formularioInformacionGeneralSujetoProcesal.get('paisSujeto')!.enable();
    }

    this.limpiarDirecciones();
  }

  //#region  "EVENTOS"
  protected cambiarTipoDocumentoNatural(event: any) {
    const isTipo1 = event?.value.id === 1;//dni
    const isTipo3 = event?.value.id === 3;//sin documento
    this.formularioInformacionGeneralSujetoProcesal.get('tipoVerificado')?.setValue(0);

    const setControlsState = (enable: boolean, registroManualValue: boolean, clearFields: boolean = false) => {
      const action = enable ? 'enable' : 'disable';
      const controls = ['nombresSujeto', 'paternoSujeto', 'maternoSujeto', 'noAliasSujeto', 'fechaNacimiento', 'edadSujeto', 'sexoSujeto', 'estadoCivil', 'gradoInstruccion', 'profesionOficio'];

      controls.forEach(control => {
        this.formularioInformacionGeneralSujetoProcesal.get(control)?.[action]();
        if (clearFields) {
          this.formularioInformacionGeneralSujetoProcesal.get(control)?.setValue('');
        }
      });

      this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.setValue(registroManualValue);
    };

    this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')?.[isTipo3 ? 'disable' : 'enable']();
    this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')!.setValue('');
    this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.disable();

    const esMenorEdad = this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.value;

    if (isTipo1) {
      if (esMenorEdad) {
        setControlsState(true, false);
      } else {
        setControlsState(false, false, true);
        this.isVerificadoReniec = false;
      }
      this.showBuscarDni = 'Buscar';
    } else {
      setControlsState(true, true);
      this.showBuscarDni = isTipo3 ? '' : '';
    }

    if (esMenorEdad) {
      this.formularioInformacionGeneralSujetoProcesal.get('estadoCivil')?.disable();
    }else{
      this.formularioInformacionGeneralSujetoProcesal.get('estadoCivil')?.enable();
    }

    if (!this.editarRegistro) {
      this.limpiarFormularioPersonaNatural(true);
    }
    this.establecerLongitudCampo(event?.value.id);
    this.limpiarDirecciones();
  }

  protected changeTipoDocumentoJuridica(event: any): void {
    const id = event?.value?.id;
    const form = this.formularioInformacionGeneralSujetoProcesal;
    form.get('registroJuridicaDeclaranteManual')?.disable();
    form.get('nombresDeclaranteSujeto')?.setValue('');
    form.get('paternoDeclaranteSujeto')?.setValue('');
    form.get('maternoDeclaranteSujeto')?.setValue('');
    switch (id) {
      case 1:
        form.get('nuDocumentoDeclarante')?.enable();
        form.get('registroJuridicaDeclaranteManual')?.setValue(false);
        form.get('nuDocumentoDeclarante')?.setValue('');

        form.get('nombresDeclaranteSujeto')?.disable();
        form.get('paternoDeclaranteSujeto')?.disable();
        form.get('maternoDeclaranteSujeto')?.disable();
        break;
      default:
        form.get('nuDocumentoDeclarante')?.enable();
        form.get('registroJuridicaDeclaranteManual')?.setValue(true);
        form.get('nuDocumentoDeclarante')?.setValue('');
        form.get('nombresDeclaranteSujeto')?.enable();
        form.get('paternoDeclaranteSujeto')?.enable();
        form.get('maternoDeclaranteSujeto')?.enable();
        break;
    }
    this.establecerLongitudCampoDeclarante(id);
  }

  protected changeProfesionOficio(event: any) {
    if (event?.value.id === CONSTANTE.OTRAS_PROFESIONES) {
      this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio')?.enable();
      limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio'), [Validators.required]);

    } else {
      this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio')?.disable();
      limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio'), []);
    }
    this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio')?.setValue('');
  }
  limpiarProfesionOficio() {
    this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio')?.disable();
    limpiarFormcontrol(this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio'), []);
    this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio')?.setValue('');
  }

  protected changeNuDocumentoJuridica(event: any) {
    this.formularioInformacionGeneralSujetoProcesal.patchValue({
      razonSocial: '',
      tipoVerificado: 0
    });
  }

  protected permitirSoloNumeros(event: any) {
    if (this.isNumericoDocumento) {
      const charCode = event.charCode;

      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }
  }

  protected permitirLetrasNumeros(event: any) {
    const regex = new RegExp('^[a-zA-Z0-9]+$');
    const key = String.fromCharCode(
      !event.charCode ? event.which : event.charCode
    );

    if (!regex.test(key)) {
      event.preventDefault();
    }
  }

  //#endregion



  private enviarFormulario() {
    let responseSave = this.cargarDataToPost();

    if (this.idSujetoCaso && this.idSujetoCaso !== 'nuevo') {
      this.sujetoGeneralService
        .editarInformacionGeneral(this.createApiRequest(responseSave))
        .subscribe((data) => {
          if (data.code === 200) {
            this.modalDialogService.success("Exito", 'Se editó el sujeto procesal correctamente.', 'Aceptar');
            this.redireccionTablaPrincipal();
          }
          else if (data.code === 201) {
            this.modalDialogService.info("Informacion", data.message, 'Aceptar');
          }
          else {
            this.modalDialogService.error("Error", 'Se ha producido un error al intentar editar el sujeto procesal', 'Aceptar');
          }
        });
    } else {
      this.sujetoGeneralService
        .agregarInformacionGeneral(this.createApiRequest(responseSave))
        .subscribe((data) => {
          if (data.code === 200) {
            this.idSujetoProcesalNew = data.data.idSujetoProcesal;
            this.idSujetoCaso = data.data.idSujetoProcesal;

            if (this.inputListaDelitos && this.inputListaDelitos.length > 0) {
              const delitosPorActualizar: DelitoPorActualizar[] = [];
              this.inputListaDelitos.forEach((delito) => {
                delitosPorActualizar.push({
                  articulo: delito.articulo,
                  idDelitoGenerico: parseInt(delito.idDelitoGenerico),
                  delitoGenerico: delito.delitoGenerico,
                  idDelitoSubgenerico: parseInt(delito.idDelitoSubgenerico),
                  delitoSubgenerico: delito.delitoSubgenerico,
                  idDelitoEspecifico: parseInt(delito.idDelitoEspecifico),
                  delitoEspecifico: delito.delitoEspecifico,
                  esDelitoSujeto: '1',
                });
              });
              let request: ActualizarDelitosRequest = {
                numeroCaso: this.caso.numeroCaso,
                numeroSujetoCaso: this.idSujetoCaso,
                delitos: delitosPorActualizar,
              };

              this.subscriptions.push(
                this.reusableTransaccionService.agregarDelitos(request).subscribe({
                  next: (resp) => {
                    if (resp.code === 200) {
                      this.modalDialogService.success("Exito", 'Se registró el sujeto procesal correctamente.', 'Aceptar');
                      this.redireccionTablaPrincipal();
                    }
                  },
                  error: (error) => {
                    this.modalDialogService.error("Error", 'Se ha producido un error al intentar registrar el sujeto procesal', 'Aceptar');
                  },
                })
              );
            } else {
              this.modalDialogService.success("Exito", 'Se registró el sujeto procesal correctamente.', 'Aceptar');
              this.redireccionTablaPrincipal();
            }
          } else if (data.code === 201) {
            this.modalDialogService.warningRed('Sujeto ya existe', data.message, 'Aceptar');

          } else {
            this.modalDialogService.success("Exito", 'Se registró el sujeto procesal correctamente.', 'Aceptar');
          }

        });
    }
  }
  redireccionTablaPrincipal() {
    const ruta = urlConsultaCasoFiscal({
      idEtapa: this.caso.idEtapa!,
      idCaso: this.caso.idCaso!,
      flgConcluido: this.caso.flgConcluido?.toString()
    });
    this.router.navigate([`${ruta}/sujeto`]);
  }

  public createApiRequest(response: InformacionGeneralSujetoResponse): InformacionGeneralSujetoApi {
    const { index, consultaReniec, listaDirecciones, ...restoResponse } = response;

    const verificarRegistro = (flag: boolean | undefined) =>
      flag ? CONSTANTE.REGISTRO_MANUAL_NO_VERIFICADO : CONSTANTE.REGISTRO_AUTOMATICO_VERIFICADO;

    const verificarRegistroMenorEdad = (flag: boolean | undefined) =>
      flag ? CONSTANTE.REGISTRO_AUTOMATICO_VERIFICADO : CONSTANTE.REGISTRO_MANUAL_NO_VERIFICADO;

    return {
      ...restoResponse,
      idSujetoCaso: response.idSujetoCaso || '',
      idCasoFiscal: this.idCasoFiscal,
      tipoParteSujeto: response.tipoParteSujeto?.id || 0,
      tipoPartePersona: response.tipoPartePersona?.id || 0,
      condicionSujeto: response.condicionSujeto?.id || 0,
      tipoDocumentoNatural: response.tipoDocumentoNatural?.id || 0,
      registroManual: verificarRegistro(response.registroManual),
      registroJuridicaManual: verificarRegistro(response.registroJuridicaManual),
      registroJuridicaDeclaranteManual: verificarRegistro(response.registroJuridicaDeclaranteManual),
      tipoDocumentoDeclarante: response.tipoDocumentoDeclarante?.id || 0,
      gradoInstruccion: response.gradoInstruccion?.id || 0,
      profesionOficio: response.profesionOficio?.id || 0,
      otroProfesionOficio: response.otroProfesionOficio,
      estadoCivil: response.estadoCivil?.id || 0,
      sexoSujeto: response.sexoSujeto?.idEquivalente || 0,
      razonSocial: response.razonSocial || '',
      paisSujeto: response.paisSujeto?.id || 0,

      cargoFuncionario: response.cargoFuncionario === 0 ? undefined : response.cargoFuncionario,
      institucionPublica: response.institucionPublica === 0 ? undefined : response.institucionPublica,
      tipoDefensor: response.tipoDefensor === 0 ? undefined : response.tipoDefensor,
      cargoAsociacion: response.cargoAsociacion === 0 ? undefined : response.cargoAsociacion,
      condicionParte: response.condicionParte === 0 ? undefined : response.condicionParte,
      tipoViolencia: response.tipoViolencia === 0 ? undefined : response.tipoViolencia,
      tipoRiesgo: response.tipoRiesgo === 0 ? undefined : response.tipoRiesgo,
      tipoDiscapacidad: response.tipoDiscapacidad === 0 ? undefined : response.tipoDiscapacidad,
      flgEsMenorEdad: verificarRegistroMenorEdad(response.flgEsMenorEdad),

      listaDirecciones

    };
  }

  private cargarDataToPost() {
    let dataPost = {} as InformacionGeneralSujetoResponse;
    let listaDirecionesUp = null;
    if (this.listaDirecciones.length) {
      listaDirecionesUp = this.listaDirecciones;
    } else {
      listaDirecionesUp = this.inputListaDirecciones;
    }

    if (this.formularioInformacionGeneralSujetoProcesal.value.tipoPartePersona?.id == CONSTANTE.PERSONA_NATURAL) {
      dataPost = {
        ...this.formularioInformacionGeneralSujetoProcesal.getRawValue(),
        idSujetoCaso: this.idSujetoCaso,
        idCasoFiscal: this.idCasoFiscal,
        nombresSujeto:
          this.formularioInformacionGeneralSujetoProcesal.value.nombresSujeto,
        ...this.formularioInformacionGeneralSujetoProcesal.getRawValue(),
        flgExtranjero:
          this.formularioInformacionGeneralSujetoProcesal.value.rdOrigen,
        flgVerficiadoReniec: this.isVerificadoReniec,
        flgVerficiadoSunat: false,
        listaDirecciones: listaDirecionesUp,
        listaDelitos: this.inputListaDelitos,
        consultaReniec: this.consultaReniec,
        flgEsMenorEdad: this.formularioInformacionGeneralSujetoProcesal.value.esMenorEdad,
      };
    } else if (
      this.formularioInformacionGeneralSujetoProcesal.value.tipoPartePersona?.id == CONSTANTE.PERSONA_JURIDICA
    ) {
      dataPost = {
        ...this.formularioInformacionGeneralSujetoProcesal.getRawValue(),
        idSujetoCaso: this.idSujetoCaso,
        idCasoFiscal: this.idCasoFiscal,
        ...this.formularioInformacionGeneralSujetoProcesal.getRawValue(),
        listaDirecciones: listaDirecionesUp,
        listaDelitos: this.inputListaDelitos,
      };
    } else {
      dataPost = {
        idSujetoCaso: this.idSujetoCaso,
        idCasoFiscal: this.idCasoFiscal,
        ...this.formularioInformacionGeneralSujetoProcesal.getRawValue(),
        listaDirecciones: listaDirecionesUp,
        listaDelitos: this.inputListaDelitos,
        consultaReniec: this.consultaReniec,
      };
    }
    return dataPost;
  }

  activarMenorEdad(): void {
    this.formularioInformacionGeneralSujetoProcesal.get('fechaNacimiento')?.reset();

    const esMenorEdad = this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.value;

    this.inicializarMenorEdad(esMenorEdad);

    const aniosRestar = esMenorEdad ? 18 : 125;
    const ajusteDia = esMenorEdad ? 1 : 0;

    this.minDate = new Date(this.today.getFullYear() - aniosRestar, this.today.getMonth(), this.today.getDate() + ajusteDia);
    this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')?.setValue(null);

    const edadCtrl = this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')!;

    if (esMenorEdad) {
 
      this.limpiarFormularioPersonaNaturalMenorEdad(true, false);
      this.formularioInformacionGeneralSujetoProcesal.get('estadoCivil')?.disable();

      // Si es menor de edad → máximo 17
      edadCtrl.setValidators([
        Validators.required,
        Validators.max(17)
      ]);

    } else {
      // Sin restricción
      edadCtrl.clearValidators();
      this.formularioInformacionGeneralSujetoProcesal.get('estadoCivil')?.enable();
    }

    const tipoDoc = this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')!.value?.id;
    if (tipoDoc != null) {
      const valueSeteado = { "value": { "id": tipoDoc, "nombre": "DNI" } };
      this.cambiarTipoDocumentoNatural(valueSeteado); 
    }

    //this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')?.enable();
    //this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')!.setValue('');

    edadCtrl.updateValueAndValidity();
  }

  inicializarMenorEdad(esMenorEdad: boolean): void {
    if (esMenorEdad) {
      const idsPermitidos = [TIPO_DOCUMENTO.DNI, TIPO_DOCUMENTO.PARTIDA_DE_NACIMIENTO];
      this.listTipoDocumentoNatural = this.listTipoDocumentoNaturalOriginal.filter(
        doc => idsPermitidos.includes(doc.id)
      );
    } else {
      this.listTipoDocumentoNatural = [...this.listTipoDocumentoNaturalOriginal];
    }

    const valorSeleccionado = this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')?.value;
    const aunExiste = this.listTipoDocumentoNatural.some(doc => doc.id === valorSeleccionado?.id);
    if (!aunExiste) {
      this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')?.setValue(null);
    }
  }

  private limpiarFormularioPersonaNaturalMenorEdad(enable: boolean, registroManualValue: boolean, clearFields: boolean = false): void {
    this.consultaReniec = null;

    const action = enable ? 'enable' : 'disable';
    const controls = ['nombresSujeto', 'paternoSujeto', 'maternoSujeto', 'noAliasSujeto', 'fechaNacimiento', 'edadSujeto', 'sexoSujeto', 'estadoCivil', 'gradoInstruccion', 'profesionOficio'];

    controls.forEach(control => {
      this.formularioInformacionGeneralSujetoProcesal.get(control)?.[action]();
      if (clearFields) {
        this.formularioInformacionGeneralSujetoProcesal.get(control)?.setValue('');
      }
    });

    this.formularioInformacionGeneralSujetoProcesal.get('registroManual')?.setValue(registroManualValue);
  }

  activarRegistroManualPersonaNatural(event: any): void {
    if (event?.checked) {
      this.showBuscarDni = '';
      this.showLimpiar = false;
      this.limpiarFormularioPersonaNatural(true);
    } else {
      const tipoDocumento = this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')?.value;
      if (tipoDocumento?.id === 1) {
        this.showBuscarDni = 'Buscar';
      } else {
        this.showBuscarDni = '';
      }
      this.showLimpiar = false;
      this.limpiarFormularioPersonaNatural(false);
    }
  }

  activarRegistroManualPersonaJuridica(event: any): void {
    this.limpiarFormularioPersonaJuridica(event?.checked);
  }

  activarRegistroManualDeclarantePersonaJuridica(event: any): void {
    this.limpiarFormularioPersonaJuricaProcurador(event?.checked);
  }

  private limpiarFormularioPersonaNatural(desactivar: boolean): void {
    this.consultaReniec = null; //consulta reniec null

    const controlesHabilitar = [
      'nombresSujeto',
      'paternoSujeto',
      'maternoSujeto',
      'noAliasSujeto',
      'fechaNacimiento',
      'sexoSujeto',
      'estadoCivil',
      'gradoInstruccion',
      'profesionOficio',
      'otroProfesionOficio',
      'edadSujeto',
    ];

    controlesHabilitar.forEach((controlName) => {
      const control = this.formularioInformacionGeneralSujetoProcesal.get(controlName);

      if (control) {
        desactivar ? control.enable() : control.disable();
        control.setValue('');
      }
    });

    this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')?.setValue('');
    this.formularioInformacionGeneralSujetoProcesal.get('otroProfesionOficio')?.setValue('');
    this.formularioInformacionGeneralSujetoProcesal.get('nuDocumento')?.setValue('');
  }

  private limpiarFormularioPersonaJuridica(desactivar: boolean): void {
    if (desactivar) {
      this.formularioInformacionGeneralSujetoProcesal.get('razonSocial')?.enable();
    } else {
      this.isDeclaranteManual = false;
      this.formularioInformacionGeneralSujetoProcesal.get('razonSocial')?.disable();
    }
    this.formularioInformacionGeneralSujetoProcesal.get('razonSocial')?.setValue('');
    this.formularioInformacionGeneralSujetoProcesal.get('nuDocumentoJuridica')?.setValue('');
  }

  private limpiarFormularioPersonaJuricaProcurador(desactivar: boolean): void {
    if (desactivar) {
      this.formularioInformacionGeneralSujetoProcesal.get('nombresDeclaranteSujeto')?.enable();
      this.formularioInformacionGeneralSujetoProcesal.get('paternoDeclaranteSujeto')?.enable();
      this.formularioInformacionGeneralSujetoProcesal.get('maternoDeclaranteSujeto')?.enable();
    } else {
      this.formularioInformacionGeneralSujetoProcesal.get('nombresDeclaranteSujeto')?.disable();
      this.formularioInformacionGeneralSujetoProcesal.get('paternoDeclaranteSujeto')?.disable();
      this.formularioInformacionGeneralSujetoProcesal.get('maternoDeclaranteSujeto')?.disable();

      this.formularioInformacionGeneralSujetoProcesal.get('nuDocumentoDeclarante')?.setValue('');
      this.formularioInformacionGeneralSujetoProcesal.get('nombresDeclaranteSujeto')?.setValue('');
      this.formularioInformacionGeneralSujetoProcesal.get('paternoDeclaranteSujeto')?.setValue('');
      this.formularioInformacionGeneralSujetoProcesal.get('maternoDeclaranteSujeto')?.setValue('');
      this.formularioInformacionGeneralSujetoProcesal.get('correoDeclaranteSujeto')?.setValue('');
      this.formularioInformacionGeneralSujetoProcesal.get('telefonoDeclaranteSujeto')?.setValue('');
    }
  }

  calcularEdad(): void {
    let fechaNacimiento = this.formularioInformacionGeneralSujetoProcesal.value.fechaNacimiento;

    if (typeof fechaNacimiento === 'string') {
      fechaNacimiento = new Date(fechaNacimiento);
    }

    // Verificar si la fecha es válida
    if (fechaNacimiento instanceof Date && !isNaN(fechaNacimiento.getTime())) {
      console.log('Fecha de nacimiento es válida');

      // Fecha actual
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);

      // Calcula la diferencia de años
      let edadSuj = hoy.getFullYear() - nacimiento.getFullYear();

      const mesActual = hoy.getMonth(); // Mes actual (0-11)
      const mesNacimiento = nacimiento.getMonth(); // Mes de nacimiento (0-11)

      // Si el mes actual es menor al mes de nacimiento, restamos 1 al cálculo de la edad
      if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
        edadSuj--;
      }

      this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')?.setValue(edadSuj.toString());

    } else {
      this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')?.setValue('');
    }
  }

  /**calcularEdadOthers(): void {
    let fechaNacimiento = this.formularioInformacionGeneralSujetoProcesal.value.fechaNacimiento;
    const validaFecha = dayjs(fechaNacimiento, 'DD/MM/YYYY', true).isValid();
    if (validaFecha) {
      const hoy = dayjs();
      const nacimiento = dayjs(fechaNacimiento);
      const edadSuj = hoy.diff(nacimiento, 'year');
      this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')?.setValue(edadSuj.toString());
    }
    else {
      this.formularioInformacionGeneralSujetoProcesal.get('edadSujeto')?.setValue('');
    }
  }**/

  get f() {
    return this.formularioInformacionGeneralSujetoProcesal.controls;
  }

  get esManualReniec() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get('registroManual')!.value === true ||
      this.formularioInformacionGeneralSujetoProcesal.get('rdOrigen')!.value == '1' ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoNatural')!.value?.id !== 1
    );
  }

  get esManualReniecDeclarante() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get('registroJuridicaDeclaranteManual')!.value === true ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoDocumentoDeclarante')!.value?.id !== 1
    );
  }

  get esManualJuridica() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get(
        'registroJuridicaManual'
      )!.value === true
    );
  }

  get esAgreviadoDenunciado() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id === TIPOS_PARTES.AGRAVIADO ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.DENUNCIADO
    );
  }

  get esDenuncianteAgraviado() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id === TIPOS_PARTES.DENUNCIANTE ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.AGRAVIADO
    );
  }

  get esDenunciadoImputado() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id === TIPOS_PARTES.DENUNCIADO ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.IMPUTADO
    );
  }

  get esAgraviadoDenunciadoImputado() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id === TIPOS_PARTES.AGRAVIADO ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.DENUNCIADO ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.IMPUTADO
    );
  }

  get esDenunciadoInvestigadoImputadoAcusado() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id === TIPOS_PARTES.DENUNCIADO ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.INVESTIGADO ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.IMPUTADO ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.ACUSADO
    );
  }

  get esDenuncianteDenunciadoAgraviado() {
    return (
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id === TIPOS_PARTES.DENUNCIANTE ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.DENUNCIADO ||
      this.formularioInformacionGeneralSujetoProcesal.get('tipoParteSujeto')!.value?.id == TIPOS_PARTES.AGRAVIADO
    );
  }

  setDireccionReniec() {
    let tipoViaEfe = this.lstTipoVia.find(
      (v: any) => v.codReniec === this.consultaReniec!.codigoPrefijoDireccion
    );

    let direcciones: DireccionRequest = {
      idDireccion: null,
      tipoDireccion: CONSTANTE.TIPO_DIRECCION_RENIEC.toString(),
      tipoDireccionNombre: CONSTANTE.DIRECCION_RENIEC,
      dpto: this.consultaReniec!.codigoDepartamentoDomicilio,
      dptoNombre: this.consultaReniec!.descripcionDepartamentoDomicilio,
      provincia: this.consultaReniec!.codigoProvinciaDomicilio,
      provinciaNombre: this.consultaReniec!.descripcionProvinciaDomicilio,
      distrito: this.consultaReniec!.codigoDistritoDomicilio,
      distritoNombre: this.consultaReniec!.descripcionDistritoDomicilio,
      cpoblado: '',
      tipoVia: tipoViaEfe ? tipoViaEfe.id : null,
      nombre: this.consultaReniec!.direccionCompleta,
      nroDireccion: this.consultaReniec!.loteDomicilio,
      prefijoUrb: this.consultaReniec!.tipoUrbanizacion,
      nombreUrb: this.consultaReniec!.urbanizacion,
      block: this.consultaReniec!.block,
      interior: this.consultaReniec!.interiorDomicilio,
      etapa: this.consultaReniec!.etapaDomicilio,
      mz: this.consultaReniec!.manzanaDomicilio,
      lote: this.consultaReniec!.loteDomicilio,
      referencia: null,
      sujeto: null,
      lat: null,
      lon: null,
      registradoPor: '',
      fechaRegistro: '',
      actualizadoPor: '',
      fechaActualizacion: '',
      pais: CONSTANTE.PAIS_PERU.toString(),
      habilitado: true
    };
    return direcciones;
  }

  establecerLongitudCampo(id: number) {
    console.log("Se configura aqui " + id)

    const configuraciones: { [key: number]: { min: number, max: number, alfanumerico: boolean } } = {
      1: { min: 8, max: 8, alfanumerico: false },
      3: { min: 0, max: 0, alfanumerico: true },
      4: { min: 4, max: 12, alfanumerico: true },
      5: { min: 4, max: 12, alfanumerico: true },
      6: { min: 9, max: 9, alfanumerico: false },
      7: { min: 7, max: 7, alfanumerico: false },
      8: { min: 4, max: 15, alfanumerico: true },
      9: { min: 9, max: 9, alfanumerico: false },
      11: { min: 5, max: 12, alfanumerico: true },
      13: { min: 9, max: 9, alfanumerico: false },
      14: { min: 9, max: 9, alfanumerico: false }
    };

    const config = configuraciones[id] || { min: 0, max: 50, alfanumerico: true };

    this.longitudMinimaInput = config.min;
    this.longitudMaximaInput = config.max;
    this.alfanumericoInput = config.alfanumerico;
  }

  establecerLongitudCampoDeclarante(id: number) {
    const configuracionesDeclarante: { [key: number]: { min: number, max: number, alfanumerico: boolean } } = {
      1: { min: 8, max: 8, alfanumerico: false },
      2: { min: 11, max: 11, alfanumerico: false },
      3: { min: 0, max: 0, alfanumerico: true },
      4: { min: 6, max: 12, alfanumerico: true },
      5: { min: 9, max: 9, alfanumerico: true },
      6: { min: 9, max: 9, alfanumerico: false },
      7: { min: 7, max: 7, alfanumerico: false },
      8: { min: 4, max: 8, alfanumerico: false },
      9: { min: 9, max: 9, alfanumerico: false },
      11: { min: 5, max: 12, alfanumerico: true },
      13: { min: 9, max: 9, alfanumerico: false },
      14: { min: 9, max: 9, alfanumerico: false }
    };

    const config = configuracionesDeclarante[id] || { min: 0, max: 50, alfanumerico: true };

    this.longitudMinimaDeclaranteInput = config.min;
    this.longitudMaximaDeclaranteInput = config.max;
    this.alfanumericoDeclaranteInput = config.alfanumerico;
  }

  async obtenerSujetoProcesal(idSujetoProcesal: any) {
    const data = await lastValueFrom(
      this.sujetoGeneralService.obtenerInformacionGeneral(idSujetoProcesal)
    );

    return data.data;
  }

  public buscarDeclaranteDocumento(): void {
    const nuDniDeclarante: string =
      this.formularioInformacionGeneralSujetoProcesal.value
        .nuDocumentoDeclarante;
    this.subscriptions.push(
      this.sujetoGeneralService.getConsultaReniec(nuDniDeclarante).subscribe({
        next: (resp) => {
          if (resp.nombres) {
            this.consultaDeclaranteReniec = resp;
            this.formularioInformacionGeneralSujetoProcesal.patchValue({
              nombresDeclaranteSujeto: this.consultaDeclaranteReniec.nombres,
              maternoDeclaranteSujeto: this.consultaDeclaranteReniec.apellidoMaterno,
              paternoDeclaranteSujeto: this.consultaDeclaranteReniec.apellidoPaterno,
            });
          }
        },
        error: (error) => {
          let mensajeNoDisponible = 'El servicio de RENIEC no se encuentra disponible en este momento. Por favor, ingrese los datos manualmente.';
          let mensajeDniNovalido = 'Por favor, ingrese un número de DNI válido.';
          if (error.error?.code && error.error.code === '42202015') {
            this.modalDialogService.warning("Advertencia", mensajeNoDisponible, 'Aceptar');
          } else {
            this.modalDialogService.error(mensajeDniNovalido, 'DNI no válido', 'Aceptar');
          }
          this.formularioInformacionGeneralSujetoProcesal.get('nombresDeclaranteSujeto')?.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('paternoDeclaranteSujeto')?.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('maternoDeclaranteSujeto')?.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('registroJuridicaDeclaranteManual')?.enable();
          this.formularioInformacionGeneralSujetoProcesal.get('registroJuridicaDeclaranteManual')?.setValue(true);
          this.isDeclaranteManual = true;
        }
      })
    );
  }



  protected agregar(): void {
    const formulario = this.formularioInformacionGeneralSujetoProcesal.getRawValue();
    const esPersonaNatural = formulario.tipoPartePersona?.id === parseInt(CONSTANTE.PERSONA_NATURAL);
    const esPersonaJuridica = formulario.tipoPartePersona?.id === parseInt(CONSTANTE.PERSONA_JURIDICA);
    let textValidation: string = '';

    const esMenorEdad = this.formularioInformacionGeneralSujetoProcesal.get('esMenorEdad')?.value;

    if (this.formularioInformacionGeneralSujetoProcesal.invalid) {
      this.formularioInformacionGeneralSujetoProcesal.markAllAsTouched();
      return;
    }
    if (!esMenorEdad && (esPersonaNatural && !this.isVerificadoReniec && formulario.registroManual == false)) {
      textValidation = 'Debe validar el DNI con RENIEC para continuar con el registro';
    }
    else if (esPersonaJuridica && !this.isVerificadoSunat) {
      textValidation = 'Debe validar el RUC con SUNAT para continuar con el registro';
    }
    else if (esPersonaJuridica && !this.isVerificadoSunat) {
      textValidation = 'Debe validar el RUC con SUNAT para continuar con el registro';
    }

    if (textValidation !== '') {
      this.modalDialogService.info('Informacion', textValidation, 'Aceptar');
      return;
    }

    if (esPersonaNatural) {
      if (!this.validarLongitudDocumento(formulario.nuDocumento)) {
        this.mostrarErrorLongitudDocumento();
        return;
      };
    }

    if (esPersonaJuridica && formulario.tipoDocumentoDeclarante?.id !== null && valid(formulario.nuDocumentoDeclarante)) {
      if (!this.validarLongitudDocumento(formulario.nuDocumentoDeclarante, true)) {
        this.mostrarErrorLongitudDocumento(true);
        return;
      }
    }

    this.enviarFormulario();
  }
  
  actualizarValidacionForm(controlesConValidaciones: any[]): void {
    const excepciones = ['tipoDocumentoNatural',
      'nuDocumento',
      'nombresSujeto',
      'paternoSujeto',
      'sexoSujeto',
      'nombresDeclaranteSujeto',
      'paternoDeclaranteSujeto'];
    excepciones.forEach((controlName) => {
      const control = this.formularioInformacionGeneralSujetoProcesal.get(controlName);

      if (control) {
        const controlValidacion: any = controlesConValidaciones.find(c => c.name === controlName);

        if (controlValidacion) {
          control.setValidators(controlValidacion.validators);
        } else {
          control.setValidators(null);
        }
        control.updateValueAndValidity();
      }
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



  private validarLongitudDocumento(numeroDocumento: string | null, declarante: boolean = false): boolean {
    return numeroDocumento != null && this.validarLongitudCampo(numeroDocumento.length, declarante);
  }

  private mostrarErrorLongitudDocumento(declarante: boolean = false): void {
    const minimo = declarante ? this.longitudMinimaDeclaranteInput : this.longitudMinimaInput;
    const maximo = declarante ? this.longitudMaximaDeclaranteInput : this.longitudMaximaInput;
    const textDeclarante = declarante ? ' del representante legal o procurador' : '';
    const mensajeLongitudRango: string = minimo !== maximo ? `Debe tener entre ${minimo} y ${maximo} dígitos` : `Debe tener exactamente ${minimo} dígitos`;
    const mensaje = `La longitud del campo número de documento ${textDeclarante} no es correcta. ${mensajeLongitudRango}. Inténtelo nuevamente.`;
    this.modalDialogService.warning('Advertencia', mensaje, 'Aceptar');

  }

  private validarLongitudCampo(length: number, declarante: boolean): boolean {
    const minimo = declarante ? this.longitudMinimaDeclaranteInput : this.longitudMinimaInput;
    const maximo = declarante ? this.longitudMaximaDeclaranteInput : this.longitudMaximaInput;
    return (length >= minimo && length <= maximo);
  }

  obtenerLabelBotonDniBuscar(): string {
    if (this.showBuscarDni === 'Buscar') {
      return '';
    }
    return this.showBuscarDni || '';
  }

  obtenerLabelBotonRucBuscar(): string {
    if (this.showBuscarRuc === 'Buscar') {
      return '';
    }
    return this.showBuscarRuc;
  }

  //PAGINACION
  protected eventoCambiarPaginaDirecciones(datos: PaginacionInterface) {
    this.paginacionCondicionDirecciones.page = datos.page;
    this.paginacionCondicionDirecciones.limit = datos.limit;
    this.actualizarListaCasosPaginacionDirecciones(datos.data, datos.resetPage);
  }

  private actualizarListaCasosPaginacionDirecciones(datos: any, reiniciar: boolean) {
    this.paginacionReiniciarDirecciones = reiniciar;
    const start = (this.paginacionCondicionDirecciones.page - 1) * this.paginacionCondicionDirecciones.limit;
    const end = start + this.paginacionCondicionDirecciones.limit;
    this.inputListaDireccionesOriginal = datos.slice(start, end);
  }

  //PAGINACION
  protected eventoCambiarPaginaDelitos(datos: PaginacionInterface) {
    this.paginacionCondicionDelitos.page = datos.page;
    this.paginacionCondicionDelitos.limit = datos.limit;
    this.actualizarListaCasosPaginacionDelitos(datos.data, datos.resetPage);
  }

  private actualizarListaCasosPaginacionDelitos(datos: any, reiniciar: boolean) {
    this.paginacionReiniciarDelitos = reiniciar;
    const start = (this.paginacionCondicionDelitos.page - 1) * this.paginacionCondicionDelitos.limit;
    const end = start + this.paginacionCondicionDelitos.limit;
    this.inputListaDelitosOriginal = datos.slice(start, end);
  }


}
