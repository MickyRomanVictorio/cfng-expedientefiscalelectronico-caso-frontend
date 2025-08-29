import { ITipoCatalogoModel, ITipoPuebloModel, SujetoGeneralService } from './../../../../../core/services/generales/sujeto/sujeto-general.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BiometriaSenasRequest } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/BiometriaSenasRequest';
import { CompresionImagenRequest } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/CompresionImagenRequest';
import { ContactoParentescoForm, ContactosParentesco } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/ContactosParentesco';
import { HuellasFotosSenas } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/HuellasFotosSenas';
import { ImagenBiometriaRequest } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/ImagenBiometriaRequest';
import { ImagenBiometriaResponse } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/ImagenBiometriaResponse';
import { InformacionDetalladaSujetoRequest } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/InformacionDetalladaSujetoRequest';
import { InformacionOpcionalSujeto } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/InformacionOpcionalSujeto';
import { OpcionesSujetoProcesalRequest } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/OpcionesSujetoProcesalRequest';
import { PosicionBiometria } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/PosicionBiometria';
import { SeudonimosSujeto } from '@interfaces/provincial/administracion-casos/sujetos/informaciondetalladasujeto/SeudonimosSujeto';

import { SujetoConsultasService } from '@services/generales/sujeto/sujeto-consultas.service';
import { MaestroService } from '@services/shared/maestro.service';

import { ArrastrarSoltarImagenesComponent } from '@components/generales/arrastrar-soltar-imagenes/arrastrar-soltar-imagenes.component';
import { CONTACTO, HUELLA, IDOAID, TIPO_BIOMETRIA } from '@constants/informacion-detallada-sujeto';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { finalize, firstValueFrom, forkJoin, Subscription } from 'rxjs';

import * as Icons from 'ngx-mpfn-dev-icojs-regular';
import { ITipoDocIdentidadModel, ITipoLenguaModel } from '@core/services/generales/sujeto/sujeto-general.service';
import { IconAsset, IconUtil, ValidationModule } from 'dist/ngx-cfng-core-lib';
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { UpperCaseInputModule } from '@core/directives/uppercase-input.module';
import { MensajeGenericoComponent } from '@core/components/mensajes/mensaje-generico/mensaje-generico.component';
import { esStringValido, validOnlyAlphanumeric, validOnlyAlphanumericDrop, validOnlyAlphanumericOnPaste, validOnlyNumberDrop, validOnlyNumberOnPaste, validOnlyNumbers } from '@core/utils/utils';
import { PATTERN_CORREO } from '@core/constants/pattern';
import { getConfiguracionTipoDocumento } from '@core/utils/input-documento';
import { ContactoParentescoComponent } from "./contacto-parentesco/contacto-parentesco.component";

@Component({
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    InputTextModule,
    InputTextareaModule,
    CmpLibModule,
    CalendarModule,
    CommonModule,
    CheckboxModule,
    ArrastrarSoltarImagenesComponent,
    UpperCaseInputModule,
    MensajeGenericoComponent,
    ValidationModule,
    ContactoParentescoComponent
],
  selector: 'app-gestionar-informacion-detallada-sujeto-procesal',
  templateUrl:
    './gestionar-informacion-detallada-sujeto-procesal.component.html',
  styleUrls: [
    './gestionar-informacion-detallada-sujeto-procesal.component.scss',
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DialogService,
    NgxCfngCoreModalDialogService,
  ],
})
export class GestionarInformacionDetalladaSujetoProcesalComponent
  implements OnInit {
  protected readonly formularioDetalleSujetoProcesal: FormGroup;
  protected readonly pathImagen = 'assets/images/manos';
  protected readonly subirArchivoTexto = 'Subir archivo';
  protected readonly textoDetalladoArchivo =
    'o jale los archivos a esta sección';
  protected readonly eliminarArchivoTexto = 'Eliminar foto';
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);

  private readonly subscriptions: Subscription[] = [];
  protected listaTiposDocumentosIdentidad: ITipoDocIdentidadModel[] = [];
  protected listaPuebloIndigena: ITipoPuebloModel[] = [];
  protected puebloIndigenaSeleccionado?: ITipoPuebloModel;
  protected listaLenguaMaterna: ITipoLenguaModel[] = [];
  protected lenguaMaternaSeleccionado?: ITipoLenguaModel;
  protected inputAliasError: boolean = false;
  protected huellasFotosSenas: HuellasFotosSenas[] = [];
  protected listaTipoBiometria: ITipoCatalogoModel[] = [];
  protected imagenBiometria: ImagenBiometriaResponse[] = [];
  protected listaPosicionBiometria: PosicionBiometria[] = [];
  protected dedoSeleccionadoManoDerecha: string[] = [];
  protected dedoSeleccionadoManoIzquierda: string[] = [];
  protected listaParentesco: any[] = [];
  protected contactosDelSujeto: any[] = [];
  protected contactosParentescoDelSujeto: ContactosParentesco[] = [];
  protected longitudMaximaInput: number = 8;
  protected longitudMinimaInput: number = 8;
  protected alfanumericoInput: boolean = false;

  protected textoValidacion: string = '';
  protected verMensaje: boolean = false;

  @Input({ required: true }) idSujetoCaso!: string;
  @Input() nuevoRegistro!: boolean;
  @Input() opcionalSujeto: boolean = false;
  @Input() editarInformacionSujeto!: OpcionesSujetoProcesalRequest;

  @Output() enviarInformacion =
    new EventEmitter<OpcionesSujetoProcesalRequest | null>();
  @Output() onChangeStep: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('numeroDocumentoInput') numeroDocumentoInput!: ElementRef;

  contactosParentescos: ContactoParentescoForm[] = [];
  contactosParentescosCopia: ContactoParentescoForm[] = [];

  constructor(
    protected iconAsset: IconAsset,
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly maestrosService: MaestroService,
    private readonly sujetoConsultasService: SujetoConsultasService,
    private readonly messageService: MessageService,
    private readonly sujetoGeneralService: SujetoGeneralService,
    protected iconUtil: IconUtil
  ) {
    this.spinner.show();

    this.formularioDetalleSujetoProcesal = this.formBuilder.group({
      puebloIndigenaSelect: new FormControl(null),
      lenguaMaternaSelect: new FormControl(null),
      correoPrincipal: new FormControl('', Validators.pattern(PATTERN_CORREO)),
      correoSecundario: new FormControl('', Validators.pattern(PATTERN_CORREO)),
      telefonoPrincipal: new FormControl('', [Validators.maxLength(20)]),
      telefonoSecundario: new FormControl('', [Validators.maxLength(20)]),
      traductor: new FormControl(['noTraductor']),
      poblacionAfroperuana: new FormControl(['noPoblacionAfroperuana']),
      defensorDerechosHumanos: new FormControl(['noDefensorDerechosHumanos']),
      personaConDiscapacidad: new FormControl(['noPersonaConDiscapacidad']),
      personaMigrante: new FormControl(['noPersonaMigrante']),
      PersonaPrivadaDeLibertad: new FormControl(['noPersonaPrivadaDeLibertad']),
      personaVictimaViolencia1980a2000: new FormControl([
        'noPersonaVictimaViolencia1980a2000',
      ]),
      personaConVIHSIDAoTBC: new FormControl(['noPersonaConVIHSIDAoTBC']),
      funcionarioPublico: new FormControl(['noFuncionarioPublico']),
      trabajadorDelHogar: new FormControl(['noTrabajadorDelHogar']),
      personaLgtbiq: new FormControl(['noPersonaLgtbiq']),
      observaciones: new FormControl(null),
      huellasyFotosArray: this.formBuilder.array([]),
      tipoBiometria: new FormControl(null),
      posicionBiometria: new FormControl(null),
      seniasParticularesArray: this.formBuilder.array([]),
      tipoSeniaParticular: new FormControl(null),
      ubicacionSeniaParticular: new FormControl(null),
      descripcionSeniaParticular: new FormControl(null),
     // contactosParentescosArray: this.formBuilder.array([]),
      seudonimoSujetoProcesal: new FormControl(null),
      seudonimosSujetoArray: this.formBuilder.array([]),
    });

    forkJoin([
      this.maestrosService.obtenerTipoPueblo(),
      this.maestrosService.obtenerTipoLengua(),
      this.maestrosService.obtenerTipoParentesco(),
      this.maestrosService.obtenerTipoDocumentoIdentidad(),
      this.maestrosService.obtenerTipoCatalogo('ID_N_TIPO_BIOMETRICO'),
      this.maestrosService.obtenerTipoCatalogo('ID_N_TIPO_HUELLA'),
    ])
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe(
        ([
          tipoPueblo,
          tipoLengua,
          tipoParentesco,
          tipoDocumento,
          tipoBiometria,
          tipoHuella,
        ]) => {
          this.listaPuebloIndigena = tipoPueblo;
          this.listaLenguaMaterna = tipoLengua;
          this.listaParentesco = tipoParentesco;
          this.listaTiposDocumentosIdentidad = tipoDocumento.filter(
            (item) => item.id !== 2
          );

          this.listaTipoBiometria = tipoBiometria.filter((item) => {
            return !item.noDescripcion.toLowerCase().includes('señas');
          });

          this.listaPosicionBiometria = tipoHuella.map((item) => {
            return {
              idPosicionBiometria: item.id,
              nombre: item.noDescripcion,
              imagen: `${this.pathImagen}/${item.noDescripcion
                .toLowerCase()
                .replace(' ', '-')}.svg`,
            };
          });
        }
      );
  }

  ngOnInit(): void {
    //Cuando es invocado desde otro componente
    if (this.opcionalSujeto) {
      this.cargarFormularioEdicionOpcional(this.editarInformacionSujeto);
      return;
    }

    if (this.nuevoRegistro) {
      this.agregarHuellasyFotos();
      this.agregarSeniasParticulares();
      this.agregarContactosParentesco();
    } else {
      this.spinner.show();

      this.subscriptions.push(
        this.sujetoConsultasService
          .obtenerInformacionOpcionalSujeto(this.idSujetoCaso)
          .pipe(
            finalize(() => {
              this.spinner.hide();
            })
          )
          .subscribe({
            next: (resp) => {
              this.huellasFotosSenas = resp.huellasFotosSujeto;
              this.contactosParentescoDelSujeto =
                resp.contactosParentescoSujeto;
              this.cargarFormularioEdicion(
                resp.informacionOpcionalSujeto,
                resp.aliasSujeto,
                resp.huellasFotosSujeto,
                resp.seniasSujeto,
                resp.contactosParentescoSujeto
              );
            },
            error: (error) => {
              console.error(error);
            },
          })
      );
    }
  }

  protected cargarFormularioEdicion(
    infoSujeto: InformacionOpcionalSujeto,
    aliasSujeto: SeudonimosSujeto[],
    huellasFotos: HuellasFotosSenas[],
    Senas: HuellasFotosSenas[],
    contactosParentesco: ContactosParentesco[]
  ): void {
    this.cargarInformacionOpcional(infoSujeto);
    this.cargarSeudonimosSujeto(aliasSujeto);
    this.cargarHuellasyFotos(huellasFotos);
    this.cargarSenas(Senas);
    this.cargarContactosParentesco(contactosParentesco);
  }

  protected eventChangePuebloIndigena(event: any) {
    this.puebloIndigenaSeleccionado = event.originalEvent.srcElement.innerText;
  }

  protected eventChangeLenguaMaterna(event: any) {
    this.lenguaMaternaSeleccionado = event.originalEvent.srcElement.innerText;
  }

  protected eventChangeTipoBiometria(event: any, index: number): void {
    const tipoBiometria = event.value;
    const fila = this.huellasyFotosArray.at(index);

    fila.get('tipoBiometria')?.setValue(tipoBiometria);
    fila.get('posicionBiometria')?.setValue(null);

    this.dedoSeleccionadoManoIzquierda[
      index
    ] = `${this.pathImagen}/mano-izquierda.svg`;
    this.dedoSeleccionadoManoDerecha[
      index
    ] = `${this.pathImagen}/mano-derecha.svg`;
  }

  protected eventChangePosicionBiometria(event: any, index: number): void {
    const posicionId = event.value;
    const posicionBiometria = this.listaPosicionBiometria?.find(
      (p) => p.idPosicionBiometria === posicionId
    );

    if (posicionBiometria) {
      if (posicionBiometria.idPosicionBiometria <= HUELLA.MENIQUE_DERECHO) {
        this.dedoSeleccionadoManoDerecha[index] = posicionBiometria.imagen;
        this.dedoSeleccionadoManoIzquierda[
          index
        ] = `${this.pathImagen}/mano-izquierda.svg`;
      } else if (
        posicionBiometria.idPosicionBiometria > HUELLA.MENIQUE_DERECHO &&
        posicionBiometria.idPosicionBiometria <= HUELLA.MENIQUE_IZQUIERDO
      ) {
        this.dedoSeleccionadoManoDerecha[
          index
        ] = `${this.pathImagen}/mano-derecha.svg`;
        this.dedoSeleccionadoManoIzquierda[index] = posicionBiometria.imagen;
      }
    }
  }

  //Para editar el formulario cuando es llamado desde otro componente
  private cargarFormularioEdicionOpcional(
    infoSujeto: OpcionesSujetoProcesalRequest
  ): void {
    const form = this.formularioDetalleSujetoProcesal;

    if (infoSujeto) {
      form.patchValue({
        lenguaMaternaSelect: infoSujeto.idTipoLengua,
        puebloIndigenaSelect: infoSujeto.idTipoPueblo,

        correoPrincipal: infoSujeto.correoPrincipal,
        correoSecundario: infoSujeto.correoSecundario,
        telefonoPrincipal: infoSujeto.telefonoPrincipal,
        telefonoSecundario: infoSujeto.telefonoSecundario,

        observaciones: infoSujeto.observaciones,
      });

      const condiciones = [
        { campo: 'traductor', valor: infoSujeto.flTraductor },
        {
          campo: 'poblacionAfroperuana',
          valor: infoSujeto.flPoblacionAfroperuana,
        },
        { campo: 'defensorDerechosHumanos', valor: infoSujeto.flDefensorDdHh },
        {
          campo: 'personaConDiscapacidad',
          valor: infoSujeto.flPersonaConDiscapacidad,
        },
        { campo: 'personaMigrante', valor: infoSujeto.flPersonaMigrante },
        {
          campo: 'PersonaPrivadaDeLibertad',
          valor: infoSujeto.flPersonaPrivadaLibertad,
        },
        {
          campo: 'personaVictimaViolencia1980a2000',
          valor: infoSujeto.flPersonaVictima8020,
        },
        { campo: 'personaConVIHSIDAoTBC', valor: infoSujeto.flPersonaVihTbc },
        { campo: 'funcionarioPublico', valor: infoSujeto.flFuncionarioPublico },
        { campo: 'trabajadorDelHogar', valor: infoSujeto.flTrabajadorHogar },
        { campo: 'personaLgtbiq', valor: infoSujeto.flPersonaLgtbiq },
      ];

      condiciones.forEach(({ campo, valor }) => {
        form
          .get(campo)
          ?.patchValue(
            valor === '1'
              ? `si${campo.charAt(0).toUpperCase() + campo.slice(1)}`
              : `no${campo.charAt(0).toUpperCase() + campo.slice(1)}`
          );
      });
    }
  }

  private cargarInformacionOpcional(infoSujeto: InformacionOpcionalSujeto) {
    const form = this.formularioDetalleSujetoProcesal;

    form.patchValue({
      lenguaMaternaSelect:
        infoSujeto.idTipoLengua === 0 ? null : infoSujeto.idTipoLengua,
      puebloIndigenaSelect:
        infoSujeto.idTipoPueblo === 0 ? null : infoSujeto.idTipoPueblo,
      correoPrincipal: infoSujeto.correoPrincipal,
      correoSecundario: infoSujeto.correoSecundario,
      telefonoPrincipal: infoSujeto.telefonoPrincipal,
      telefonoSecundario: infoSujeto.telefonoSecundario,
      observaciones: infoSujeto.observaciones,
    });

    const condiciones = [
      { campo: 'traductor', valor: infoSujeto.flTraductor },
      { campo: 'poblacionAfroperuana', valor: infoSujeto.flAfroperuano },
      { campo: 'defensorDerechosHumanos', valor: infoSujeto.flDefensorDDHH },
      { campo: 'personaConDiscapacidad', valor: infoSujeto.flDiscapacidad },
      { campo: 'personaMigrante', valor: infoSujeto.flMigrante },
      {
        campo: 'PersonaPrivadaDeLibertad',
        valor: infoSujeto.flPrivadoLibertad,
      },
      {
        campo: 'personaVictimaViolencia1980a2000',
        valor: infoSujeto.flVictimaViolecia8020,
      },
      { campo: 'personaConVIHSIDAoTBC', valor: infoSujeto.flVihTbc },
      { campo: 'funcionarioPublico', valor: infoSujeto.flFuncionarioPublico },
      { campo: 'trabajadorDelHogar', valor: infoSujeto.flTrabajadorHogar },
      { campo: 'personaLgtbiq', valor: infoSujeto.flLgtbi },
    ];

    condiciones.forEach(({ campo, valor }) => {
      form
        .get(campo)
        ?.patchValue(
          valor == '1'
            ? `si${campo.charAt(0).toUpperCase() + campo.slice(1)}`
            : `no${campo.charAt(0).toUpperCase() + campo.slice(1)}`
        );
    });
  }

  private obtenerFotografiaBiometria(
    request: ImagenBiometriaRequest
  ): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService.obtenerImagenBiometriaSenas(request).subscribe({
          next: (resp) => {
            if (resp.code === 200 && resp.data && resp.data.length > 0) {
              const archivoBase64 = resp.data[0].archivo || null;
              resolve(archivoBase64);
            }
          },
          error: (error) => {
            reject(null);
          },
        })
      );
    });
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

  //---Seudonimo--------------------------------
  private cargarSeudonimosSujeto(seudonimosSujeto: SeudonimosSujeto[]): void {
    const formularioInicial = this.formBuilder.group({
      seudonimoSujetoProcesal: new FormControl(null),
      seudonimosSujetoArray: this.formBuilder.array([]),
    });

    while (this.seudonimosSujetoArray.length > 0) {
      this.seudonimosSujetoArray.removeAt(
        this.seudonimosSujetoArray.length - 1
      );
    }

    if (Array.isArray(seudonimosSujeto)) {
      seudonimosSujeto.forEach((seudonimo) => {
        const fila = this.formBuilder.group({
          aliasId: [seudonimo.idAliasSujeto], //VERIFICAR EL ID
          aliasAgregado: [seudonimo.noAliasSujeto],
          isDisabled: [true],
        });

        this.seudonimosSujetoArray.push(fila);
      });
    }

    this.formularioDetalleSujetoProcesal.patchValue(formularioInicial.value);
  }

  protected agregarSeudonimo(): void {
    const seudonimoControl = this.formularioDetalleSujetoProcesal.get(
      'seudonimoSujetoProcesal'
    );
    const nuevoAlias = seudonimoControl?.value;

    this.inputAliasError = true;

    if (nuevoAlias && nuevoAlias.trim() !== '') {
      const existe = this.seudonimosSujetoArray.controls.some(
        (group) => group.value.aliasAgregado === nuevoAlias
      );

      if (existe) {
        seudonimoControl?.setValue('');
        this.modalDialogService.warning(
          'Alias duplicado',
          `El alias que desea ingresar, ya se encuentra registrado. Por favor, verifique la información.`,
          'Aceptar'
        );
        return;
      }

      this.inputAliasError = false;

      this.seudonimosSujetoArray.push(
        this.formBuilder.group({
          aliasId: null,
          aliasAgregado: [nuevoAlias],
        })
      );

      seudonimoControl?.setValue('');
    }
  }

  protected removerSeudonimo(i: number): void {
    const dialog = this.modalDialogService.question(
      'Eliminar alias',
      '¿Realmente desea eliminar este registro?',
      'Eliminar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          if (this.seudonimosSujetoArray.length > 0) {
            this.spinner.show();
            const seudonimoFormGroup = this.seudonimosSujetoArray.at(i);
            const seudonimoValue = seudonimoFormGroup.get('aliasId')?.value;
            if (seudonimoValue !== null) {
              this.sujetoConsultasService
                .removerSeudonimo(this.idSujetoCaso, seudonimoValue)
                .pipe(
                  finalize(() => {
                    this.spinner.hide();
                  })
                )
                .subscribe({
                  next: (resp) => {
                    if (resp.code === 200) {
                      this.seudonimosSujetoArray.removeAt(i);
                      this.modalDialogService.info(
                        'Registro eliminado',
                        `Se eliminó correctamente el registro`,
                        'Ok'
                      );
                    }
                  },
                  error: (error) => {
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      detail: error,
                      life: 3000,
                    });
                  },
                });
            } else {
              this.seudonimosSujetoArray.removeAt(i);
              this.spinner.hide();
              this.modalDialogService.info(
                'Registro eliminado',
                `Se eliminó correctamente el registro`,
                'Ok'
              );
            }
          }
        }
      },
    });
  }

  //---Huellas y fotos--------------------------------
  private async cargarHuellasyFotos(
    huellasyFotos: HuellasFotosSenas[]
  ): Promise<void> {
    const indexMapping: { [key: string]: number } = {
      [HUELLA.PULGAR_DERECHO.toString()]: 0,
      [HUELLA.INDICE_DERECHO.toString()]: 1,
      [HUELLA.MEDIO_DERECHO.toString()]: 2,
      [HUELLA.ANULAR_DERECHO.toString()]: 3,
      [HUELLA.MENIQUE_DERECHO.toString()]: 4,
      [HUELLA.PULGAR_IZQUIERDO.toString()]: 5,
      [HUELLA.INDICE_IZQUIERDO.toString()]: 6,
      [HUELLA.MEDIO_IZQUIERDO.toString()]: 7,
      [HUELLA.ANULAR_IZQUIERDO.toString()]: 8,
      [HUELLA.MENIQUE_IZQUIERDO.toString()]: 9,
    };

    if (huellasyFotos && huellasyFotos.length > 0) {
      huellasyFotos
        .filter(
          (huellaFoto: any) =>
            huellaFoto.idTipoBiometrico !== TIPO_BIOMETRIA.SENA
        )
        .forEach(async (huellaFoto: any) => {
          let tipoBiometriaId = 0;

          if (huellaFoto.idTipoBiometrico === TIPO_BIOMETRIA.FOTO) {
            tipoBiometriaId = TIPO_BIOMETRIA.FOTO;
          } else if (
            huellaFoto.idTipoBiometrico >= HUELLA.PULGAR_DERECHO &&
            huellaFoto.idTipoBiometrico <= HUELLA.MENIQUE_IZQUIERDO
          ) {
            tipoBiometriaId = TIPO_BIOMETRIA.HUELLA;
          }

          const request: ImagenBiometriaRequest = {
            idSujetoCaso: this.idSujetoCaso,
            idDatosBiometricosSujetos: huellaFoto.idDatosBiometricosSujeto,
            idOaid: huellaFoto.idOaid,
          };

          const resultado = await this.obtenerFotografiaBiometria(request);

          const nuevoFormularioInicial = this.formBuilder.group({
            tipoBiometria: [{ value: tipoBiometriaId, disabled: true }],
            descripcionFoto: [
              { value: huellaFoto.deDescripcion, disabled: true },
            ],
            posicionBiometria: [
              { value: huellaFoto.idTipoBiometrico, disabled: true },
            ],
            imagenHuellaFoto: [
              { value: 'data:image/jpeg;base64,' + resultado, disabled: true },
            ],
            mostrarEnlaceEliminar: [false],
            isDisabled: [true],
          });

          if (
            huellaFoto.idTipoBiometrico >= HUELLA.PULGAR_DERECHO &&
            huellaFoto.idTipoBiometrico <= HUELLA.MENIQUE_IZQUIERDO
          ) {
            const posicionBiometria = this.listaPosicionBiometria.find(
              (p) => p.idPosicionBiometria === huellaFoto.idTipoBiometrico
            );

            if (
              posicionBiometria!.idPosicionBiometria <= HUELLA.MENIQUE_DERECHO
            ) {
              this.dedoSeleccionadoManoDerecha.push(
                `${posicionBiometria!.imagen}`
              );
              this.dedoSeleccionadoManoIzquierda.push(
                `${this.pathImagen}/mano-izquierda.svg`
              );
            } else if (
              posicionBiometria!.idPosicionBiometria > HUELLA.MENIQUE_DERECHO &&
              posicionBiometria!.idPosicionBiometria <= HUELLA.MENIQUE_IZQUIERDO
            ) {
              this.dedoSeleccionadoManoDerecha.push(
                `${this.pathImagen}/mano-derecha.svg`
              );
              this.dedoSeleccionadoManoIzquierda.push(
                `${posicionBiometria!.imagen}`
              );
            }
          }

          this.huellasyFotosArray.push(nuevoFormularioInicial);
        });
    }
  }

  protected agregarHuellasyFotos(): void {
    const nuevoFormularioInicial = this.formBuilder.group({
      tipoBiometria: [TIPO_BIOMETRIA.FOTO], // Valor inicial vacío
      posicionBiometria: [''],
      descripcionFoto: [''],
      archivoAdjunto: [''],
      imagenHuellaFoto: [''],
      mostrarEnlaceEliminar: [true],
      // mostrarEnlaceEliminar: [this.huellasyFotosArray().length > 1]
    });

    const existeImage = this.dedoSeleccionadoManoDerecha.find((x) =>
      x?.includes('mano-derecha.svg')
    );

    if (!existeImage) {
      this.dedoSeleccionadoManoDerecha.push(
        `${this.pathImagen}/mano-derecha.svg`
      );
      this.dedoSeleccionadoManoIzquierda.push(
        `${this.pathImagen}/mano-izquierda.svg`
      );
    }

    this.huellasyFotosArray.push(nuevoFormularioInicial);
  }

  protected removerHuellasFotos(i: number, tipoBiometria: number): void {
    let biometria = '';

    if (tipoBiometria === TIPO_BIOMETRIA.HUELLA) {
      biometria = 'huella';
    } else if (tipoBiometria === TIPO_BIOMETRIA.FOTO) {
      biometria = 'fotografía';
    }

    const dialog = this.modalDialogService.question(
      `Eliminar ${biometria}`,
      `¿Está seguro de eliminar este registro de ${biometria} para este sujeto procesal?`,
      'Eliminar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          if (this.huellasFotosSenas) {
            this.spinner.show();
            const idRegistrosBiometricos =
              this.huellasFotosSenas[i]?.idRegistrosBiometricos;
            if (idRegistrosBiometricos && idRegistrosBiometricos !== null) {
              this.subscriptions.push(
                this.sujetoConsultasService
                  .removerHuellasFotosSenas(
                    this.idSujetoCaso,
                    idRegistrosBiometricos
                  )
                  .pipe(
                    finalize(() => {
                      this.spinner.hide();
                    })
                  )
                  .subscribe({
                    next: (resp) => {
                      if (resp.code === 200) {
                        this.huellasyFotosArray.removeAt(i);
                        this.modalDialogService.info(
                          'Registro eliminado',
                          `Se eliminó correctamente el registro`,
                          'Ok'
                        );
                      }
                    },
                    error: (error) => {
                      this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error,
                        life: 3000,
                      });
                    },
                  })
              );
            } else {
              this.spinner.hide();
              this.huellasyFotosArray.removeAt(i);
              this.modalDialogService.info(
                'Registro eliminado',
                `Se eliminó correctamente el registro`,
                'Ok'
              );
            }
          }
        }
      },
    });
  }

  protected async manejarArchivoSeleccionado(
    event: any,
    indice: number,
    tipoFormulario: string
  ): Promise<void> {
    const archivo = event?.archivo;
    const contenido = event?.contenido;

    if (!archivo || !contenido) {
      console.error(
        'El archivo o el contenido no están presentes en el evento.'
      );
      return;
    }

    const filaHuellasyFotos = this.huellasyFotosArray.controls[
      indice
    ] as FormGroup;
    const filaSenas = this.seniasParticularesArray.controls[
      indice
    ] as FormGroup;

    // const imagenComprimida = await this.comprimirImagen(contenido.split(',')[1]);
    const imagenComprimida = contenido.split(',')[1];
    const archivoAdjuntoControl = new FormControl({
      archivo: archivo,
      contenido: imagenComprimida,
    });

    if (tipoFormulario === 'biometria') {
      filaHuellasyFotos.setControl('archivoAdjunto', archivoAdjuntoControl);
    } else if (tipoFormulario === 'senias') {
      filaSenas.setControl('archivoAdjunto', archivoAdjuntoControl);
    }
  }

  private async comprimirImagen(contenido: string): Promise<string | null> {
    try {
      const request: CompresionImagenRequest = {
        nombre: '',
        archivo: contenido,
      };
      const resp = await firstValueFrom(
        this.maestrosService.realizarCompresionImagen(request)
      );
      return resp.code === 200 ? resp.data : null;
    } catch (error) {
      return null;
    }
  }

  //--------------------------------Agregar señas--------------------------------
  private async cargarSenas(senas: any): Promise<void> {
    if (senas && senas.length > 0) {
      senas
        .filter((sena: any) => sena.idTipoBiometrico === TIPO_BIOMETRIA.SENA)
        .forEach(async (sena: any) => {
          const request: ImagenBiometriaRequest = {
            idSujetoCaso: this.idSujetoCaso,
            idDatosBiometricosSujetos: sena.idDatosBiometricosSujeto,
            idOaid: sena.idOaid,
          };

          const resultado = await this.obtenerFotografiaBiometria(request);

          const nuevoFormularioInicial = this.formBuilder.group({
            tipoSeniaParticular: [{ value: sena.deTipoSenas, disabled: true }],
            ubicacionSeniaParticular: [
              { value: sena.deUbicacionSenas, disabled: true },
            ],
            descripcionSeniaParticular: [
              { value: sena.deDescripcion, disabled: true },
            ],
            //archivoSeniaSeleccionado: [{value: null, disabled: true}],
            imagenHuellaFoto: [
              { value: 'data:image/jpeg;base64,' + resultado, disabled: true },
            ],
            mostrarEnlaceEliminar: [false],
            isDisabled: [true], //propiedad agregado para deshabilitar el hover del boton
          });

          const formArray = this.seniasParticularesArray;

          if (formArray instanceof FormArray) {
            formArray.push(nuevoFormularioInicial);
          }
        });
    }
  }

  protected agregarSeniasParticulares(): void {
    const nuevaFila = this.formBuilder.group({
      tipoSeniaParticular: [''],
      ubicacionSeniaParticular: [''],
      descripcionSeniaParticular: [''],
      archivoAdjunto: [''],
      tipoBiometria: [TIPO_BIOMETRIA.SENA],
      // fila.get('tipoBiometria')?.setValue(tipoBiometria);

      //archivoSeniaSeleccionado: [null]
      mostrarEnlaceEliminar: [true],
    });

    this.seniasParticularesArray.push(nuevaFila);
  }

  protected removerSeniasParticulares(i: number): void {
    const dialog = this.modalDialogService.question(
      'Eliminar seña',
      '¿Está seguro de eliminar este registro de seña para este sujeto procesal?',
      'Eliminar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          if (this.huellasFotosSenas) {
            this.spinner.show();
            const idRegistrosBiometricos =
              this.huellasFotosSenas[i]?.idRegistrosBiometricos;
            if (idRegistrosBiometricos && idRegistrosBiometricos !== null) {
              this.subscriptions.push(
                this.sujetoConsultasService
                  .removerHuellasFotosSenas(
                    this.idSujetoCaso,
                    idRegistrosBiometricos
                  )
                  .pipe(
                    finalize(() => {
                      this.spinner.hide();
                    })
                  )
                  .subscribe({
                    next: (resp) => {
                      if (resp.code === 200) {
                        this.seniasParticularesArray.removeAt(i);
                        this.modalDialogService.info(
                          'Registro eliminado',
                          `Se eliminó correctamente el registro`,
                          'Ok'
                        );
                      }
                    },
                    error: (error) => {
                      this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error,
                        life: 3000,
                      });
                    },
                  })
              );
            } else {
              this.spinner.hide();
              this.seniasParticularesArray.removeAt(i);
              this.modalDialogService.info(
                'Registro eliminado',
                `Se eliminó correctamente el registro`,
                'Ok'
              );
            }
          }
        }
      },
    });
  }

  //---Agregar parentescos------
  private cargarContactosParentesco(
    contactosParentesco: ContactosParentesco[]
  ): void {
    if (contactosParentesco && contactosParentesco.length > 0) {
      contactosParentesco.forEach((contacto: ContactosParentesco) => {


        const contactosPersonaArray = contacto.contactosPersona ? contacto.contactosPersona.split('||') : [];
        
        let correoPrincipalParentesco:  string = '';
        let idcorreoPrincipalParentesco:  string = '';
        let correoSecundarioParentesco:  string = '';
        let idcorreoSecundarioParentesco:  string = '';
        let telefonoPrincipalParentesco:  string = '';
        let idtelefonoPrincipalParentesco:  string = '';
        let telefonoSecundarioParentesco:  string = '';
        let idtelefonoSecundarioParentesco:  string = '';
        let telefonoSecundarioOpParentesco: string = '';
        let idtelefonoSecundarioOpParentesco: string = '';
        let celularPrincipalParentesco: string = '';
        let idcelularPrincipalParentesco: string = '';
        let celularSecundarioParentesco: string = '';
        let idcelularSecundarioParentesco: string = '';
        let celularSecundarioOpParentesco: string = '';
        let idcelularSecundarioOpParentesco: string = '';
        let casillaElectronicaPrincipalParentesco: string = '';
        let idcasillaElectronicaPrincipalParentesco: string = '';

        contactosPersonaArray.forEach((contactoPersona: string) => {
          const contactoData = JSON.parse(contactoPersona);

          if (contactoData.ID_TIPO_CONTACTO === 1) {
            if (contactoData.FL_CONTACTO_SECUNDARIO === '0') {              
               correoPrincipalParentesco = contactoData.NO_DATOS_CONTACTO;
               idcorreoPrincipalParentesco = contactoData.ID_PERSONA_CONTACTO;
            } else {
              correoSecundarioParentesco = contactoData.NO_DATOS_CONTACTO;
              idcorreoSecundarioParentesco = contactoData.ID_PERSONA_CONTACTO;
            }
          }

          if (contactoData.ID_TIPO_CONTACTO === 2) {
            if (contactoData.FL_CONTACTO_SECUNDARIO === '0') {              
              telefonoPrincipalParentesco = contactoData.NO_DATOS_CONTACTO;
              idtelefonoPrincipalParentesco = contactoData.ID_PERSONA_CONTACTO;
            } else {              
              telefonoSecundarioParentesco = contactoData.NO_DATOS_CONTACTO;
              idtelefonoSecundarioParentesco = contactoData.ID_PERSONA_CONTACTO;
            }
          }

          if (contactoData.ID_TIPO_CONTACTO === 3) {
            if (contactoData.FL_CONTACTO_SECUNDARIO === '0') {             
                celularPrincipalParentesco = contactoData.NO_DATOS_CONTACTO;
                idcelularPrincipalParentesco = contactoData.ID_PERSONA_CONTACTO;
            } else {             
              celularSecundarioParentesco = contactoData.NO_DATOS_CONTACTO;  
              idcelularSecundarioParentesco = contactoData.ID_PERSONA_CONTACTO;               
            }
          }

          if (contactoData.ID_TIPO_CONTACTO === 4) {
            
              casillaElectronicaPrincipalParentesco = contactoData.NO_DATOS_CONTACTO; 
              idcasillaElectronicaPrincipalParentesco = contactoData.ID_PERSONA_CONTACTO;
          }
        });

        this.contactosParentescos.push({
          idPersona: contacto.idPersona,
          registrosManuales: '',
          parentesco: contacto.idTipoVinculo,
          tipoDocumento: contacto.idTipoDocIdentidad,
          numeroDocumento: contacto.nuDocumento,
          nombresParentesco: contacto.noCiudadano,
          apellidoPaterno: contacto.apPaterno,
          apellidoMaterno: contacto.apMaterno,
          rbSexo: contacto.tiSexo === '1' ? 'masculino' : 'femenino',
          celularPrincipalParentesco: celularPrincipalParentesco,
          idCelularPrincipalParentesco: idcelularPrincipalParentesco,
          celularSecundarioParentesco: celularSecundarioParentesco,
          idCelularSecundarioParentesco: idcelularSecundarioParentesco,
          celularSecundarioOpParentesco: celularSecundarioOpParentesco,
          idCelularSecundarioOpParentesco: idcelularSecundarioOpParentesco,
          correoPrincipalParentesco: correoPrincipalParentesco,
          idCorreoPrincipalParentesco: idcorreoPrincipalParentesco,
          correoSecundarioParentesco: correoSecundarioParentesco,
          idCorreoSecundarioParentesco: idcorreoSecundarioParentesco,
          telefonoPrincipalParentesco: telefonoPrincipalParentesco,
          idTelefonoPrincipalParentesco: idtelefonoPrincipalParentesco,
          telefonoSecundarioParentesco: telefonoSecundarioParentesco,
          idTelefonoSecundarioParentesco: idtelefonoSecundarioParentesco,
          telefonoSecundarioOpParentesco: telefonoSecundarioOpParentesco,
          idTelefonoSecundarioOpParentesco: idtelefonoSecundarioOpParentesco,
          casillaElectronicaPrincipalParentesco: casillaElectronicaPrincipalParentesco,
          idCasillaElectronicaPrincipalParentesco: idcasillaElectronicaPrincipalParentesco,
          botonBuscarDni: '',
          valido: true,
        });

        this.contactosParentescosCopia.push({
          idPersona: contacto.idPersona,
          registrosManuales: '',
          parentesco: contacto.idTipoVinculo,
          tipoDocumento: contacto.idTipoDocIdentidad,
          numeroDocumento: contacto.nuDocumento,
          nombresParentesco: contacto.noCiudadano,
          apellidoPaterno: contacto.apPaterno,
          apellidoMaterno: contacto.apMaterno,
          rbSexo: contacto.tiSexo === '1' ? 'masculino' : 'femenino',
          celularPrincipalParentesco: celularPrincipalParentesco,
          idCelularPrincipalParentesco: idcelularPrincipalParentesco,
          celularSecundarioParentesco: celularSecundarioParentesco,
          idCelularSecundarioParentesco: idcelularSecundarioParentesco,
          celularSecundarioOpParentesco: celularSecundarioOpParentesco,
          idCelularSecundarioOpParentesco: idcelularSecundarioOpParentesco,
          correoPrincipalParentesco: correoPrincipalParentesco,
          idCorreoPrincipalParentesco: idcorreoPrincipalParentesco,
          correoSecundarioParentesco: correoSecundarioParentesco,
          idCorreoSecundarioParentesco: idcorreoSecundarioParentesco,
          telefonoPrincipalParentesco: telefonoPrincipalParentesco,
          idTelefonoPrincipalParentesco: idtelefonoPrincipalParentesco,
          telefonoSecundarioParentesco: telefonoSecundarioParentesco,
          idTelefonoSecundarioParentesco: idtelefonoSecundarioParentesco,
          telefonoSecundarioOpParentesco: telefonoSecundarioOpParentesco,
          idTelefonoSecundarioOpParentesco: idtelefonoSecundarioOpParentesco,
          casillaElectronicaPrincipalParentesco: casillaElectronicaPrincipalParentesco,
          idCasillaElectronicaPrincipalParentesco: idcasillaElectronicaPrincipalParentesco,
          botonBuscarDni: '',
          valido: true,
        })
      });
    }
  }

  protected agregarContactosParentesco(): void {
    const nuevoFormulario = this.formBuilder.group({
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

    this.iniciarDeshabilitado(nuevoFormulario);

    this.contactosParentescosArray.push(nuevoFormulario);
  }

  agregarContacto() {
    this.contactosParentescos.push({
      idPersona: '',
      registrosManuales: '',
      parentesco: 0,
      tipoDocumento: 0,
      numeroDocumento: '',
      nombresParentesco: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      rbSexo: '',
      celularPrincipalParentesco: '',
      celularSecundarioParentesco: '',
      celularSecundarioOpParentesco: '',
      correoPrincipalParentesco: '',
      correoSecundarioParentesco: '',
      telefonoPrincipalParentesco: '',
      telefonoSecundarioOpParentesco: '',
      telefonoSecundarioParentesco: '',
      idCelularPrincipalParentesco: '',
      idCelularSecundarioParentesco: '',
      idCelularSecundarioOpParentesco: '',
      idCorreoPrincipalParentesco: '',
      idCorreoSecundarioParentesco: '',
      idTelefonoPrincipalParentesco: '',
      idTelefonoSecundarioOpParentesco: '',
      idTelefonoSecundarioParentesco: '',
      botonBuscarDni: '',
      casillaElectronicaPrincipalParentesco: '',
      idCasillaElectronicaPrincipalParentesco: '',
      valido: false,
    });

    this.contactosParentescosCopia.push({
      idPersona: '',
      registrosManuales: '',
      parentesco: 0,
      tipoDocumento: 0,
      numeroDocumento: '',
      nombresParentesco: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      rbSexo: '',
      celularPrincipalParentesco: '',
      celularSecundarioParentesco: '',
      celularSecundarioOpParentesco: '',
      correoPrincipalParentesco: '',
      correoSecundarioParentesco: '',
      telefonoPrincipalParentesco: '',
      telefonoSecundarioOpParentesco: '',
      telefonoSecundarioParentesco: '',
      idCelularPrincipalParentesco: '',
      idCelularSecundarioParentesco: '',
      idCelularSecundarioOpParentesco: '',
      idCorreoPrincipalParentesco: '',
      idCorreoSecundarioParentesco: '',
      idTelefonoPrincipalParentesco: '',
      idTelefonoSecundarioOpParentesco: '',
      idTelefonoSecundarioParentesco: '',
      botonBuscarDni: '',
      casillaElectronicaPrincipalParentesco: '',
      idCasillaElectronicaPrincipalParentesco: '',
      valido: false,
    });
  }

  actualizarContacto(event: { index: number, data: ContactoParentescoForm }) {    
    this.contactosParentescosCopia[event.index] = event.data;
  }

  eliminarContacto(index: number) { 
    
    const idPersona = this.contactosParentescos[index].idPersona;
    console.log('idPersona ' , idPersona);

    const dialog = this.modalDialogService.question(
          'Eliminar Contacto',
          '¿Está seguro de eliminar este registro de contacto para este sujeto procesal?',
          'Eliminar',
          'Cancelar'
        );
        dialog.subscribe({
          next: (resp: CfeDialogRespuesta) => {
            if (resp === CfeDialogRespuesta.Confirmado) {
              this.spinner.show();

              if (idPersona && idPersona !== null) {
                this.subscriptions.push(
                  this.sujetoConsultasService
                    .removerParentesco(idPersona)
                    .pipe(
                      finalize(() => {
                        this.spinner.hide();
                      })
                    )
                    .subscribe({
                      next: (resp) => {
                        if (resp.code === 200) {
                          this.contactosParentescos.splice(index, 1);
                          this.contactosParentescosCopia.splice(index, 1);
                          this.modalDialogService.info(
                            'Registro eliminado',
                            `Se eliminó correctamente el registro`,
                            'Ok'
                          );                         
                          
                        }
                      },
                      error: (error) => {
                        this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: error,
                          life: 3000,
                        });
                      },
                    })
                );
              } else {
                this.spinner.hide();
                this.contactosParentescos.splice(index, 1);
                this.contactosParentescosCopia.splice(index, 1);
                this.modalDialogService.info(
                  'Registro eliminado',
                  `Se eliminó correctamente el registro`,
                  'Ok'
                );
              }
    
            }
          },
        });
  }

  private iniciarDeshabilitado(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((controlName) => {
      if (
        controlName === 'numeroDocumento' ||
        controlName === 'apellidoPaterno' ||
        controlName === 'apellidoMaterno' ||
        controlName === 'nombresParentesco' ||
        controlName === 'rbSexo'
      ) {
        formGroup.get(controlName)?.disable();
      }
    });
  }

  protected validarNumeroDocumento(event: FocusEvent, indice: number): void {
    const numeroDocumento = (event.target as HTMLInputElement).value;
    const filaControl = this.contactosParentescosArray.at(indice);
    const tipoDocumento = filaControl.get('tipoDocumento')?.value;
    this.validarNumeroDocumentoExistente(numeroDocumento, tipoDocumento, indice);
  }

  // Validación para el número de documento
  validarNumeroDocumentoExistente(numeroDocumento: string, tipoDocumento: string, indice: number): void {
    const existe = this.contactosParentescosArray.controls.some((control, index) => {
      if (index === indice) {
        return false;
      }
      const tipo = control.get('tipoDocumento')?.value;
      const documento = control.get('numeroDocumento')?.value;
      return documento === numeroDocumento && tipo === tipoDocumento;
    });

    if (existe) {

      const control = this.contactosParentescosArray.at(indice);
      control.get('numeroDocumento')?.setValue(null);

      this.modalDialogService.warning(
        'Validación',
        'Documento ya existe',
        'Ok'
      );

    }
  }

  // Validación de los campos apellidoPaterno, apellidoMaterno y nombresParentesco
  validarNombresParentesco(indice: number): void {
    const filaControl = this.contactosParentescosArray.at(indice);
    const tipoDocumento = filaControl.get('tipoDocumento')?.value;

    if (tipoDocumento === 16) {
      const apellidoPaterno = filaControl.get('apellidoPaterno')?.value;
      const apellidoMaterno = filaControl.get('apellidoMaterno')?.value;
      const nombresParentesco = filaControl.get('nombresParentesco')?.value;

      const existe = this.contactosParentescosArray.controls.some((control, index) => {
        if (index === indice) {
          return false;
        }

        const apellidoPaternoExistente = control.get('apellidoPaterno')?.value;
        const apellidoMaternoExistente = control.get('apellidoMaterno')?.value;
        const nombresParentescoExistente = control.get('nombresParentesco')?.value;

        return (
          apellidoPaternoExistente === apellidoPaterno &&
          apellidoMaternoExistente === apellidoMaterno &&
          nombresParentescoExistente === nombresParentesco
        );
      });

      if (existe) {
        const control = this.contactosParentescosArray.at(indice);
        control.get('apellidoPaterno')?.setValue(null);
        control.get('apellidoMaterno')?.setValue(null);
        control.get('nombresParentesco')?.setValue(null);

        this.modalDialogService.warning(
          'Validación',
          'Los nombres completos ya existen',
          'Ok'
        );
      }
    }
  }

  /************************************* */

  protected habilitarDeshabilitar(index: number): void {
    const filaControl = this.contactosParentescosArray.at(index);
    const valueRegistrosManuales =
      filaControl.get('registrosManuales')?.value[0];

    const controlesAEvaluar = [
      'apellidoPaterno',
      'apellidoMaterno',
      'nombresParentesco',
      'rbSexo',
    ];

    controlesAEvaluar.forEach((controlName) => {
      filaControl.get('botonBuscarDni')?.enable();
      filaControl.get(controlName)?.setValue('');
      filaControl.get(controlName)?.disable();

      if (valueRegistrosManuales === 'registroManual') {
        filaControl.get(controlName)?.enable();
        filaControl.get('botonBuscarDni')?.disable();
      }
    });

  }

  protected eventChangeTipoDocumento(event: any, index: number): void {
    const filaControl = this.contactosParentescosArray.at(index);

    const tipoDocumentoValue = filaControl.get('tipoDocumento');
    const numDocumentoControl = filaControl.get('numeroDocumento');

    const botonBuscarControl = filaControl.get('botonBuscarDni');
    const valueRegistrosManuales =
      filaControl.get('registrosManuales')?.value[0];

    if (tipoDocumentoValue?.value === 3 || tipoDocumentoValue?.value === 15) {
      numDocumentoControl?.disable();
      botonBuscarControl?.disable();
    } else if (tipoDocumentoValue?.value === 16) {
      filaControl.get('numeroDocumento')?.disable();
      filaControl.get('registrosManuales')?.setValue(['registroManual']);
      filaControl.get('apellidoPaterno')?.enable();
      filaControl.get('apellidoMaterno')?.enable();
      filaControl.get('nombresParentesco')?.enable();
      filaControl.get('rbSexo')?.enable();
    } else {

      numDocumentoControl?.enable();

      if (
        (tipoDocumentoValue?.value === 1 || tipoDocumentoValue?.value === 2) &&
        valueRegistrosManuales !== 'registroManual'
      ) {
        botonBuscarControl?.enable();
      } else {
        botonBuscarControl?.disable();

        filaControl.patchValue({
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

  protected validarSoloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorActual = input.value;
    input.value = valorActual.replace(/[^0-9]/g, '');
  }

  protected removerContactoParentesco(i: number): void {
    const dialog = this.modalDialogService.question(
      'Eliminar Contacto',
      '¿Está seguro de eliminar este registro de contacto para este sujeto procesal?',
      'Eliminar',
      'Cancelar'
    );
    dialog.subscribe({
      next: (resp: CfeDialogRespuesta) => {
        if (resp === CfeDialogRespuesta.Confirmado) {
          if (this.contactosParentescoDelSujeto) {
            this.spinner.show();
            const numeroDocumento = this.contactosParentescosArray
              ?.getRawValue()
              ?.at(i)?.numeroDocumento;
            const idPersona = this.contactosParentescoDelSujeto
              .filter(
                (parentesco) => parentesco.nuDocumento === numeroDocumento
              )
              .map((parentesco) => parentesco.idPersona)[0];

            if (idPersona && idPersona !== null) {
              this.subscriptions.push(
                this.sujetoConsultasService
                  .removerParentesco(idPersona)
                  .pipe(
                    finalize(() => {
                      this.spinner.hide();
                    })
                  )
                  .subscribe({
                    next: (resp) => {
                      if (resp.code === 200) {
                        this.contactosParentescosArray?.removeAt(i);
                        this.modalDialogService.info(
                          'Registro eliminado',
                          `Se eliminó correctamente el registro`,
                          'Ok'
                        );
                      }
                    },
                    error: (error) => {
                      this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error,
                        life: 3000,
                      });
                    },
                  })
              );
            } else {
              this.spinner.hide();
              this.contactosParentescosArray?.removeAt(i);
              this.modalDialogService.info(
                'Registro eliminado',
                `Se eliminó correctamente el registro`,
                'Ok'
              );
            }
          }
        }
      },
    });
  }

  protected consultaServicioReniec(index: number): void {
    const fila = this.contactosParentescosArray.at(index);
    const numeroDocumentoControl = fila.get('numeroDocumento');
    const tipoDocumento = fila.get('tipoDocumento');
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
              fila.get('nombresParentesco')?.setValue(resp.nombres);
              fila.get('apellidoPaterno')?.setValue(resp.apellidoPaterno);
              fila.get('apellidoMaterno')?.setValue(resp.apellidoMaterno);
              if (resp.codigoGenero === '1') {
                fila.get('rbSexo')?.patchValue('masculino');
              } else if (resp.codigoGenero === '2') {
                fila.get('rbSexo')?.patchValue('femenino');
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
            fila.get('registrosManuales')?.setValue(["registroManual"]);
            this.habilitarDeshabilitar(index);
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

  protected cancelarOpcionalSujeto(): void {
    this.enviarInformacion.emit(null);
  }

  protected guardarInformacionDetalladaDelSujeto(): void { 
    console.log(this.opcionalSujeto, ' guardarInformacionDetalladaDelSujeto');
       
    if (this.opcionalSujeto) {
      this.enviarInformacionOpcionalDelSujeto();
    } else {
      this.actualizarInformacionDetalladaDelSujeto();
    }
  }

  protected enviarInformacionOpcionalDelSujeto(): void {
    const valoresFormulario = this.formularioDetalleSujetoProcesal.value;

    if (
      this.validarCorreos(
        valoresFormulario.correoPrincipal,
        valoresFormulario.correoSecundario
      )
    ) {
      const opciones: OpcionesSujetoProcesalRequest =
        this.obtenerOpcionesSujeto(valoresFormulario);
      this.enviarInformacion.emit(opciones);
    }
  }

  private validarCorreos(
    correoPrincipal: string,
    correoSecundario: string
  ): boolean {
    return (
      (!correoPrincipal || PATTERN_CORREO.test(correoPrincipal)) &&
      (!correoSecundario || PATTERN_CORREO.test(correoSecundario))
    );
  }

  private validarFormatoCorreo(correo: string): boolean {
    return !correo || PATTERN_CORREO.test(correo);
  }

  validarFotosYHuellasDuplicados() {
    const controls = this.huellasyFotosArray.controls;
    const seenCombinations = new Set();

    for (const control of controls) {
      const tipoBiometria = control.get('tipoBiometria')?.value;
      const descripcionFoto = control.get('descripcionFoto')?.value;

      if (tipoBiometria && descripcionFoto) {
        const key = `${tipoBiometria}-${descripcionFoto}`;
        if (seenCombinations.has(key)) {
          return true;
        }
        seenCombinations.add(key);
      }
    }
    return false;
  }

  validarSeñasDuplicados() {
    const controls = this.seniasParticularesArray.controls;
    const seenCombinations = new Set();

    for (const control of controls) {
      const tipoSeniaParticular = control.get('tipoSeniaParticular')?.value;
      const ubicacionSeniaParticular = control.get(
        'ubicacionSeniaParticular'
      )?.value;
      const descripcionSeniaParticular = control.get(
        'descripcionSeniaParticular'
      )?.value;

      if (
        tipoSeniaParticular &&
        ubicacionSeniaParticular &&
        descripcionSeniaParticular
      ) {
        const key = `${tipoSeniaParticular}-${ubicacionSeniaParticular}-${descripcionSeniaParticular}`;
        if (seenCombinations.has(key)) {
          return true;
        }
        seenCombinations.add(key);
      }
    }
    return false;
  }

  private actualizarInformacionDetalladaDelSujeto(): void {
    this.verMensaje = false;
    this.textoValidacion = '';
    const valoresFormulario = this.formularioDetalleSujetoProcesal.value;

    if (valoresFormulario.correoPrincipal && !this.validarFormatoCorreo(valoresFormulario.correoPrincipal)) {
      this.verMensaje = true;
      this.textoValidacion = 'El correo principal ingresado no es válido';
      return;
    }

    if (valoresFormulario.correoSecundario && !this.validarFormatoCorreo(valoresFormulario.correoSecundario)) {
      this.verMensaje = true;
      this.textoValidacion = 'El correo secundario ingresado no es válido';
      return;
    }

    if (this.validarFotosYHuellasDuplicados()) {
      this.modalDialogService.warning(
        'Foto o huella duplicada',
        `La foto o huella que desea ingresar, ya se encuentra registrada. Por favor, verifique la información.`,
        'Aceptar'
      );
      return;
    }

    if (this.validarSeñasDuplicados()) {
      this.modalDialogService.warning(
        'Seña duplicada',
        `La seña que desea ingresar, ya se encuentra registrada. Por favor, verifique la información.`,
        'Aceptar'
      );
      return;
    }

    if (this.contactosParentescosCopia.every(contacto => contacto.valido)) {
      this.verMensaje = true;
      this.textoValidacion = 'La información del contacto ingresado no es válido';
      return;
    }
   
    const opciones: OpcionesSujetoProcesalRequest = this.obtenerOpcionesSujeto(valoresFormulario);

    const seudonimosSujetoArray =      valoresFormulario.seudonimosSujetoArray.filter(
        (elemento: any) => !elemento.isDisabled
      );
    const huellasYFotosArray = valoresFormulario.huellasyFotosArray.filter(
      (elemento: any) => !elemento.isDisabled
    );
    const seniasParticularesArray =
      valoresFormulario.seniasParticularesArray.filter(
        (elemento: any) => !elemento.isDisabled
      );

    this.spinner.show();

    const requestSeudonimo: SeudonimosSujeto[] = seudonimosSujetoArray.map(
      (item: any) => {
        return {
          idAliasSujeto: '',
          idSujetoCaso: '',
          noAliasSujeto: item.aliasAgregado,
        };
      }
    );
    const request: InformacionDetalladaSujetoRequest = {
      idSujetoCaso: this.idSujetoCaso,
      opcionesSujetoProcesal: opciones,
      listaSeudonimos: requestSeudonimo,
      contactosParentesco: this.datosContactosParentesco()
    };

    this.subscriptions.push(
      this.sujetoConsultasService
        .actualizarInformacionDetalladaSujeto(request)
        .pipe(
          finalize(() => {
            this.spinner.hide();
          })
        )
        .subscribe({
          next: (resp) => {
            if (resp.code === 200) {
              this.procesarArchivos(huellasYFotosArray, IDOAID.FOTO, true);
              this.procesarArchivos(
                seniasParticularesArray,
                IDOAID.SENA,
                false
              );
              this.contactosParentescos = this.contactosParentescosCopia;
              this.modalDialogService.success(
                'Detalles actualizados',
                `Se actualizó correctamente la información`,
                'Ok'
              );
            }
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              `No se pudo realizar el registro, revise el formulario`,
              'Ok'
            );
          },
        })
    );
  }

  private datosContactosParentesco(): ContactosParentesco[] {
  
    const requestContactosParentescos: ContactosParentesco[] =
     this.contactosParentescosCopia.map((item: ContactoParentescoForm) => ({
      idSujetoCaso: '',
      idVinculoSujeto: '',
      idSujeto: '',
      idPersonaVinculo: '',
      idTipoVinculo: item.parentesco,
      noTipoVinculo: '',
      noCiudadano: item.nombresParentesco,
      apPaterno:item.apellidoPaterno,
      apMaterno:item.apellidoMaterno,
      tiSexo:item.rbSexo === 'masculino' ? '1' : '0',
      idTipoDocIdentidad: item.tipoDocumento,
      noTipoDocIdentidad:'',
      nuDocumento:item.numeroDocumento,
      idPersona: item.idPersona,
      contactosPersona: '',
      contactos: this.obtenerContactos(item)
    }));
    
    return requestContactosParentescos;
  }


  private obtenerContactos(contacto: ContactoParentescoForm): any[] {
    const definiciones = [
      { campo: 'celularPrincipalParentesco', tipo: CONTACTO.CELULAR, secundario: '0', id: 'idCelularPrincipalParentesco'},
      { campo: 'celularSecundarioParentesco', tipo: CONTACTO.CELULAR, secundario: '1', id: 'idCelularSecundarioParentesco' },
      { campo: 'celularSecundarioOpParentesco', tipo: CONTACTO.CELULAR, secundario: '1', id: 'idCelularSecundarioOpParentesco' },
      { campo: 'correoPrincipalParentesco', tipo: CONTACTO.CORREO, secundario: '0', id: 'idCorreoPrincipalParentesco' },
      { campo: 'correoSecundarioParentesco', tipo: CONTACTO.CORREO, secundario: '1', id: 'idCorreoSecundarioParentesco' },
      { campo: 'telefonoPrincipalParentesco', tipo: CONTACTO.TELEFONO, secundario: '0', id: 'idTelefonoPrincipalParentesco' },
      { campo: 'telefonoSecundarioParentesco', tipo: CONTACTO.TELEFONO, secundario: '1', id: 'idTelefonoSecundarioParentesco' },
      { campo: 'telefonoSecundarioOpParentesco', tipo: CONTACTO.TELEFONO, secundario: '1', id: 'idTelefonoSecundarioOpParentesco' },
      { campo: 'casillaElectronicaPrincipalParentesco', tipo: CONTACTO.CASILLA, secundario: '0', id: 'idCasillaElectronicaPrincipalParentesco' },
    ];
  
    return definiciones
    .filter(({ campo }) => {
      const valor = contacto[campo as keyof ContactoParentescoForm];
      return typeof valor === 'string' && esStringValido(valor);
    })
    .map(({ campo, tipo, secundario , id}) => ({
      idPersonaContacto: contacto[id as keyof ContactoParentescoForm],
      idTipoContacto: tipo,
      noDatosContacto: contacto[campo as keyof ContactoParentescoForm],
      flContactoSecundario: secundario,
    }));
  }

  private obtenerOpcionesSujeto(
    valoresFormulario: any
  ): OpcionesSujetoProcesalRequest {
    return {
      idTipoPueblo: valoresFormulario.puebloIndigenaSelect,
      idTipoLengua: valoresFormulario.lenguaMaternaSelect,
      // contactosSujeto: this.verificarCambioContactos(valoresFormulario),
      correoPrincipal: valoresFormulario.correoPrincipal,
      correoSecundario: valoresFormulario.correoSecundario,
      telefonoPrincipal: valoresFormulario.telefonoPrincipal,
      telefonoSecundario: valoresFormulario.telefonoSecundario,

      flTraductor: this.asignarValor(valoresFormulario.traductor),
      flPoblacionAfroperuana: this.asignarValor(
        valoresFormulario.poblacionAfroperuana
      ),
      flDefensorDdHh: this.asignarValor(
        valoresFormulario.defensorDerechosHumanos
      ),
      flPersonaConDiscapacidad: this.asignarValor(
        valoresFormulario.personaConDiscapacidad
      ),
      flPersonaMigrante: this.asignarValor(valoresFormulario.personaMigrante),
      flPersonaPrivadaLibertad: this.asignarValor(
        valoresFormulario.PersonaPrivadaDeLibertad
      ),
      flPersonaVictima8020: this.asignarValor(
        valoresFormulario.personaVictimaViolencia1980a2000
      ),
      flPersonaVihTbc: this.asignarValor(
        valoresFormulario.personaConVIHSIDAoTBC
      ),
      flFuncionarioPublico: this.asignarValor(
        valoresFormulario.funcionarioPublico
      ),
      flTrabajadorHogar: this.asignarValor(
        valoresFormulario.trabajadorDelHogar
      ),
      flPersonaLgtbiq: this.asignarValor(valoresFormulario.personaLgtbiq),

      observaciones: valoresFormulario.observaciones,
    };
  }

  private procesarArchivos(
    archivosArray: any[],
    tipoOaid: number,
    flag: boolean
  ): void {
    archivosArray.forEach((elemento) => {
      if (elemento.archivoAdjunto) {
        const archivoSeleccionado = elemento.archivoAdjunto.archivo;
        const contenidoArchivoSeleccionado = elemento.archivoAdjunto.contenido;
        const tipoBiometria = elemento.tipoBiometria;

        if (
          archivoSeleccionado instanceof File &&
          contenidoArchivoSeleccionado
        ) {
          const requestBiometriaSenas: BiometriaSenasRequest = {
            archivo: contenidoArchivoSeleccionado,
            nuPeso: Math.round(archivoSeleccionado.size / 1024),
            noDocumentoOrigen: archivoSeleccionado.name,
            dePathDocumento: '',
            idMovimiento: '',
            noDocumentoFichero: '',
            idOaid:
              tipoBiometria === TIPO_BIOMETRIA.FOTO
                ? tipoOaid
                : tipoBiometria === TIPO_BIOMETRIA.HUELLA
                  ? IDOAID.HUELLA
                  : tipoOaid,
            idSujetoProcesal: this.idSujetoCaso,
            tipoBiometrico:
              tipoBiometria === TIPO_BIOMETRIA.FOTO
                ? TIPO_BIOMETRIA.FOTO
                : tipoBiometria === TIPO_BIOMETRIA.HUELLA
                  ? elemento.posicionBiometria !== undefined
                    ? elemento.posicionBiometria
                    : TIPO_BIOMETRIA.SENA
                  : elemento.tipoBiometria !== undefined
                    ? elemento.tipoBiometria
                    : TIPO_BIOMETRIA.SENA,

            tipoSenia: elemento.tipoSeniaParticular
              ? elemento.tipoSeniaParticular
              : '',
            ubicacionSenia: elemento.ubicacionSeniaParticular
              ? elemento.ubicacionSeniaParticular
              : '',
            descripcionSenia:
              tipoBiometria === TIPO_BIOMETRIA.FOTO
                ? elemento.descripcionFoto
                  ? elemento.descripcionFoto
                  : ''
                : elemento.descripcionSeniaParticular
                  ? elemento.descripcionSeniaParticular
                  : '',
          };

          this.subscriptions.push(
            this.maestrosService
              .enviarRegistroBiometrico(requestBiometriaSenas)
              .pipe(
                finalize(() => {
                  this.spinner.hide();
                })
              )
              .subscribe({
                next: (resp) => { },
                error: (error) => { },
              })
          );
        }
      }
    });
  }

  private asignarValor(opcion: string): string {
    return opcion?.startsWith('no')
      ? '0'
      : opcion?.startsWith('si')
        ? '1'
        : opcion;
  }


  protected marcarArrayComoInvalido(array: FormArray) {
    array.markAllAsTouched();
    array.updateValueAndValidity();
    array.controls.forEach((grupo: AbstractControl) => {
      const formGroup = grupo as FormGroup;
      formGroup.markAsTouched();
      formGroup.markAsDirty();
      formGroup.updateValueAndValidity();
      Object.keys(formGroup.controls).forEach((key) => {
        const control = formGroup.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
        control?.updateValueAndValidity();
      });
    });
  }
  get puebloIndigenaSelect(): FormControl {
    return this.formularioDetalleSujetoProcesal.get(
      'puebloIndigenaSelect'
    ) as FormControl;
  }

  get lenguaMaternaSelect(): FormControl {
    return this.formularioDetalleSujetoProcesal.get(
      'lenguaMaternaSelect'
    ) as FormControl;
  }

  get seudonimosSujetoArray(): FormArray {
    return this.formularioDetalleSujetoProcesal.get(
      'seudonimosSujetoArray'
    ) as FormArray;
  }

  get seniasParticularesArray(): FormArray {
    return this.formularioDetalleSujetoProcesal.get(
      'seniasParticularesArray'
    ) as FormArray;
  }

  get huellasyFotosArray(): FormArray {
    return this.formularioDetalleSujetoProcesal.get(
      'huellasyFotosArray'
    ) as FormArray;
  }

  get contactosParentescosArray(): FormArray {
    return this.formularioDetalleSujetoProcesal.get(
      'contactosParentescosArray'
    ) as FormArray;
  }

  protected establecerLongitudNumeroDocumento(id: number) {
    const config = getConfiguracionTipoDocumento(id);
    this.longitudMinimaInput = config.min;
    this.longitudMaximaInput = config.max;
    this.alfanumericoInput = config.alfanumerico;
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
