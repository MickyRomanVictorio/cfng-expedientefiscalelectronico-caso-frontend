import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {Subscription} from "rxjs";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {obtenerIcono} from "@utils/icon";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {DateMaskModule} from "@directives/date-mask.module";
import {InputTextareaModule} from "primeng/inputtextarea";
import {AdjuntoData} from "@components/generales/visor-pdf-frame/adjunto-data.interface";
import {
  VisorPdfCargoComponent
} from "@components/registrar-presentacion-disposiciones/visor-pdf-cargo/visor-pdf-cargo.component";
import {VisorPdfFrameComponent} from "@components/generales/visor-pdf-frame/visor-pdf-frame.component";
import {archivoFileToB64, base64ToFile, descargarArchivoB64, formatoPesoArchivo} from "@utils/file";
import {RadioButtonModule} from "primeng/radiobutton";
import {TableModule} from "primeng/table";
import {MaestroService} from "@services/shared/maestro.service";
import {NgxSpinnerService} from "ngx-spinner";
import {DomSanitizer} from "@angular/platform-browser";
import {Catalogo} from "@interfaces/comunes/catalogo";
import {
  ContiendaCompetenciaService
} from "@services/provincial/tramites/comun/calificacion/contienda-competencia/contienda-competencia.service";
import {
  ResuelveContienda
} from "@interfaces/provincial/tramites/comun/calificacion/contienda-competencia/resuelve-contienda.interface";
import {DatosFirma} from "@interfaces/reusables/firma-digital/datos-firma.interface";
import {FirmaIndividualService} from "@services/firma-digital/firma-individual.service";
import {BACKEND} from "@environments/environment";
import {IconAsset, TIPO_COPIA} from 'ngx-cfng-core-lib';
import {TramiteProcesal} from "@core/interfaces/comunes/tramiteProcesal";
import {TabDocumentosComponent} from '@components/tab-documentos/tab-documentos.component';
import {AlertaModalComponent} from "@components/modals/alerta-modal/alerta-modal.component";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaData} from "@interfaces/comunes/alert";
import {
  ActualizarInformacionContiendaComponent
} from "@components/modals/actualizar-informacion-contienda/actualizar-informacion-contienda.component";
import {CasoStorageService} from "@services/shared/caso-storage.service";
import {Router} from "@angular/router";
import {VisorEfeService} from "@services/visor/visor.service";
import {FirmaDigitalClienteComponent, FirmaDigitalClienteService, FirmaInterface} from 'ngx-cfng-core-firma-digital';
import {RepositorioDocumentoService} from '@core/services/generales/repositorio-documento.service';
import {SLUG_SIGN,} from '@constants/mesa-unica-despacho';
import {TokenService} from "@services/shared/token.service";
import {GestionCasoService} from "@services/shared/gestion-caso.service";
import {
  ModalObservarRespuestaContiendaComponent
} from "@modules/provincial/tramites/comun/preparatoria/disposicion-emitir-pronunciamiento-contienda-competencia/modal-observar-respuesta-contienda/modal-observar-respuesta-contienda.component";
import { CfeDialogRespuesta, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { EliminarTramiteRequest } from '@core/interfaces/reusables/eliminar-tramite/eliminar-tramite-request';
import { EliminarTramiteService } from '@core/services/reusables/efe/eliminar-tramite/eliminar-tramite.service';


@Component({
  selector: 'app-disposicion-resuelve-contienda-competencia',
  standalone: true,
  imports: [CommonModule,
    CmpLibModule,
    InputTextModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    DateMaskModule,
    InputTextareaModule,
    VisorPdfCargoComponent,
    VisorPdfFrameComponent,
    RadioButtonModule,
    TableModule,
    TabDocumentosComponent,
    FirmaDigitalClienteComponent],
  templateUrl: './disposicion-resuelve-contienda-competencia.component.html',
  styleUrls: ['./disposicion-resuelve-contienda-competencia.component.scss'],
  providers: [DatePipe, FirmaDigitalClienteService],
})
export class DisposicionResuelveContiendaCompetenciaComponent implements OnInit, OnDestroy {
  @Input() etapa: string = '';
  @Input() idCaso: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idDocumento: string = '';
  @Input() files: any[] = [];

  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
    }
  }
  @Output() ocultarBotonTramite = new EventEmitter<boolean>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Output() datosFormulario = new EventEmitter<Object>();

  private _idActoTramiteCaso: string = '';
  protected form!: FormGroup;
  private suscripciones: Subscription[] = [];
  protected resultados: Catalogo[] = [];
  protected motivos: Catalogo[] = [];
  protected tipoCopias: Catalogo[] = [];
  protected datos: ResuelveContienda | null = null;
  protected documentoCargado: boolean = false;
  protected documentoAdjunto!: AdjuntoData;
  protected tipoCopiaSeleccionada: Catalogo | null = null;
  private datosFirma!: DatosFirma;
  private nombreDocumentoCargado!: string;
  protected esFirmadoGuardado: boolean = false;
  protected referenciaModal!: DynamicDialogRef
  protected maximoCaracteresDescripcion = 200;
  protected contadorCaracteresDescripcion = 0;
  protected maximoCaracteresObservacion = 200;
  protected contadorCaracteresObservacion = 0;
  usuario: any;
  deshabilitado: Boolean = false;
  flagTieneEfe: Boolean = false;
  filesPeso: any;

  protected readonly obtenerIcono = obtenerIcono;
  protected readonly formatoPesoArchivo = formatoPesoArchivo;

  public refModal!: DynamicDialogRef;
  protected readonly iconAsset = inject(IconAsset);

  constructor(
    private fb: FormBuilder,
    private maestroService: MaestroService,
    private contiendaCompetenciaService: ContiendaCompetenciaService,
    private firmaIndividualService: FirmaIndividualService,
    private firmaDigitalClienteService: FirmaDigitalClienteService,
    private visorEfeService: VisorEfeService,
    private dialogService: DialogService,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private router: Router,
    private repositorioDocumentoService: RepositorioDocumentoService,
    private tokenService: TokenService,
    private readonly gestionCasoService: GestionCasoService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly eliminarTramiteService: EliminarTramiteService,
  ) {
    this.usuario = this.getUserSession().usuario;
  }

  getUserSession() {
    return this.tokenService.getDecoded();
  }

  ngOnInit(): void {
    this.documentoAdjunto = this.nuevoDocumento();
    this.obtenerTipoCopia();

    this.formBuild();

    /*if (this.tieneActoTramiteCasoURL) {
      this.obtenerDatosFormularioURL();
    } else {
      this.obtenerDatosFormulario();
      this.documentoAdjunto = this.nuevoDocumento();
    }*/

    this.obtenerTipoResultado();
    this.obtenerMotivoCompetencia();
    this.obtenerDatosFormulario();

    this.suscripciones.push(
      this.firmaDigitalClienteService.processSignClient.subscribe(
        (data: any) => {
          this.procesoFirmar(data);
        }
      )
    );

    setTimeout(() => {
      this.spinner.show();
    }, 0);
    this.peticionParaEjecutar.emit((datos: any) =>
      this.contiendaCompetenciaService.guardarSolicitudContienda(datos)
    );

  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe());
  }

  private formBuild(): void {
    this.form = this.fb.group({
      resultado: [null, [Validators.required]],
      fechaDisposicion: [null, [Validators.required]],
      motivo: [null, [Validators.required]],
      descripcion: [null, [Validators.maxLength(this.maximoCaracteresDescripcion)]],
      observaciones: [null, [Validators.maxLength(this.maximoCaracteresObservacion)]],
      idTipoCopia: [null, [Validators.required]],
    });
  }

  get formularioValido(): boolean {
    return this.form.valid && this.files.length > 0;
  }

  private async bloquearFormulario() {
    this.esFirmadoGuardado = true;
    this.form.get('resultado')!.disable();
    this.form.get('fechaDisposicion')!.disable();
    this.form.get('motivo')!.disable();
    this.form.get('descripcion')!.disable();
    this.form.get('observaciones')!.disable();
    this.form.get('idTipoCopia')!.disable();
    this.spinner.hide();
  }

  get fiscalAsignado(): boolean {
    return !!this.datos?.idFiscalAsignado;
  }

  get tieneRegistroEnBandeja(): boolean {
    return !!this.datos?.idBandejaElevacion;
  }

  get tieneDocumentoAdjunto(): boolean {
    return this.documentoAdjunto !== undefined;
  }

  get idAccionEstadoProvincial(): boolean {
    return !!this.datos?.idAccionEstadoProvincial;
  }

  get fechaDisposicion(): boolean {
    return !!this.datos?.fechaDisposicion;
  }

  protected cancelar() {
    const confirmar = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: 'Cancelar acciones',
        description: '¿Realmente desea cancelar la acción de carga, todos los datos ingresados se perderán?',
        confirmButtonText: 'Cancelar Acciones',
        cancelButtonText: 'Cerrar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    confirmar.onClose.subscribe((respuesta: string) => {
      if (respuesta === 'confirm') {
        /**this.ejecutaEliminarDocumento(documentoAdjunto);**/
        this.eliminarTramiteFirmado();
        this.redireccionarActoProcesal();
      }
    });
  }

  protected eliminarDocumento(documentoAdjunto:any): void {
    const indexToDelete = this.files.findIndex(i => i.id === documentoAdjunto.id)
    this.files.splice(indexToDelete, 1);
    this.form.get('idTipoCopia')!.setValue(null);
    this.tipoCopiaSeleccionada = null;
    this.documentoCargado = false;
    this.documentoAdjunto = this.nuevoDocumento();
  }


  /**private ejecutaEliminarDocumento(documentoAdjunto: any): void {
    const indexToDelete = this.files.findIndex(i => i.id === documentoAdjunto.id)
    this.files.splice(indexToDelete, 1);
    this.form.get('idTipoCopia')!.setValue(null);
    this.tipoCopiaSeleccionada = null;
    this.documentoCargado = false;
    this.documentoAdjunto = this.nuevoDocumento();
  }**/

  private eliminarTramiteFirmado(): void {
    const idActoTramiteCaso = this._idActoTramiteCaso;
    const motivo = 'Se cancelo la solicitud de derivación de carpeta por contienda';

    const datos: EliminarTramiteRequest = { idActoTramiteCaso, motivo }
    this.suscripciones.push(
      this.eliminarTramiteService.eliminarTramite(datos).subscribe({
        next: () => {
          this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
        },
        error: () => {
          this.modalDialogService.error(
            'ERROR AL INTENTAR ELIMINAR DOCUMENTO FIRMADO',
            'Ha ocurrido un error inesperado al intentar eliminar el documento firmado',
            'Aceptar',
          )
        }
      })
    )
  }

  private redireccionarActoProcesal() {
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${this.etapa}/caso/${this.idCaso}/acto-procesal`;
    this.router.navigateByUrl('/app', { skipLocationChange: true }).then(() => {
      this.router.navigate([`${ruta}`]);
    });
  }

  protected processSignDocument(file: any) {
    console.log('oooooooooooooooooooooooooooooo - processSignDocument');
    this.documentoCargado = true;
    this.verDocumentoVisor(file)
  }

  protected firmarGuardar() {
    console.log('oooooooooooooooooooooooooooooo - firmarGuardar');
    const confirmar = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: 'Registrar disposición',
        description: 'Está a punto de firmar digitalmente y registrar la disposición cargada.  ¿Desea continuar con el registro?',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>);

    confirmar.onClose.subscribe((respuesta: string) => {
      if (respuesta === 'confirm') {
        this.firmarTramite();
      }
    });
  }

  private async procesoFirmar(realizado: string): Promise<void> {
    console.log('oooooooooooooooooooooooooooooo - procesoFirmar');
    await this.spinner.show()
    if (realizado === '0') {
      await this.obtenerDocumentoFirmado();
    }
    if (realizado === '1') {
      await this.spinner.hide();
      alert(SLUG_SIGN.CANCEL);
    }
  }

  private async firmarTramite() {
    console.log('oooooooooooooooooooooooooooooo - firmarTramite');
    await this.obtenerDatosFirma();
    await this.cargarDocumentoRepositorio();
    this.spinner.show()
    let cargo = this.tipoCopiaSeleccionada!.id?.toString() == TIPO_COPIA.COPIA_AUTENTICADA ? 'Fedatario institucional' : this.datosFirma.cargoFirmador;
    let body: FirmaInterface = {
      id: this.nombreDocumentoCargado,
      firma_url: `${BACKEND.FIRMA_CLIENTE}`,
      repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
      rol: cargo,
      motivo: this.tipoCopiaSeleccionada!.noDescripcion!,
      param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
      extension: 'pdf',
      posicionX: null,
      posicionY: null
    };
    this.firmaDigitalClienteService.sendDataSign.emit(body)
  }

  private obtenerDatosFormulario(): void {
    console.log('oooooooooooooooooooooooooooooo - obtenerDatosFormulario');
    this.spinner.show();
    this.suscripciones.push(
      this.contiendaCompetenciaService.obtenerResuelveContienda(this.etapa, this._idActoTramiteCaso).subscribe({
        next: datos => {
          this.datos = datos;
          this.flagTieneEfe = datos.flagTieneEfe == '1';
          this.filesPeso = datos.pesoArchivo;
          this.llenarFormulario();
          this.contadorCaracteresDescripcion = this.datos!.descripcion?.length ?? 0;
          this.contadorCaracteresObservacion = this.datos!.observaciones?.length ?? 0;
          this.spinner.hide();
        },
        error: error => {
          this.spinner.hide();
          console.log(error)
        }
      })
    );
  }

  private obtenerDatosFormularioURL(): void {
    console.log('oooooooooooooooooooooooooooooo - obtenerDatosFormularioURL');
    this.spinner.show();
    this.suscripciones.push(
      this.contiendaCompetenciaService.obtenerResuelveContiendaIdActoTramite(this._idActoTramiteCaso).subscribe({
        next: datos => {
          this.datos = datos;
          this.llenarFormulario();
        },
        error: error => {
          this.spinner.hide();
          console.log(error)
        }
      })
    );
  }

  private async registrarDatosFormulario(): Promise<void> {
    console.log('oooooooooooooooooooooooooooooo - registrarDatosFormulario');
    const formulario = this.form.getRawValue();
    this.datos = {
      ...this.datos,
      idActoTramiteCaso: this._idActoTramiteCaso,
      etapa: this.etapa,
      //idBandejaElevacion: this.datos!.idBandejaElevacion,
      idTipoResultado: formulario.resultado,
      fechaDisposicion: formulario.fechaDisposicion ? this.datePipe.transform(formulario.fechaDisposicion, 'dd/MM/yyyy') : null,
      idMotivoCompetencia: formulario.motivo,
      descripcion: formulario.descripcion,
      observaciones: formulario.observaciones,
      idTipoCopia: formulario.idTipoCopia,
      idCaso: this.idCaso,
      idActoTramiteEstado: this.tramiteSeleccionado!.idActoTramiteEstado,
      archivo: this.documentoAdjunto.base64!,
      nombreArchivo: this.documentoAdjunto.namePdf
    }
    this.spinner.show();
    this.suscripciones.push(
      this.contiendaCompetenciaService.registrarResuelveContienda(this.datos).subscribe({
        next: async resp => {
          this.bloquearFormulario();

          this.gestionCasoService.obtenerCasoFiscal(this.gestionCasoService.casoActual.idCaso);

          this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: `Disposición registrada y firmada`,
              description: 'Se registró y firmó correctamente la disposición.',
              confirmButtonText: 'Aceptar'
            }
          } as DynamicDialogConfig<AlertaData>);

          this.obtenerDatosFormulario();
        },
        error: error => {
          this.spinner.hide();
          console.log(error)

          this.dialogService.open(AlertaModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'error',
              title: `PROCESO NO TERMINADO`,
              description: 'No se terminó con el proceso de firma y guardado.',
              confirmButtonText: 'Aceptar'
            }
          } as DynamicDialogConfig<AlertaData>);
        }
      })
    );
  }

  protected seleccionarTipoCopia(tipoCopia: Catalogo): void {
    console.log('oooooooooooooooooooooooooooooo - seleccionarTipoCopia');
    this.tipoCopiaSeleccionada = tipoCopia;
  }

  public obtenerTipoResultado() {
    console.log('oooooooooooooooooooooooooooooo - obtenerTipoResultado');
    const nombreGrupo = "ID_N_TIPO_RESULTADO";
    this.spinner.show();
    this.suscripciones.push(
      this.maestroService.obtenerCatalogo(nombreGrupo).subscribe({
        next: resp => {
          /**this.resultados = resp.data;**/
          this.resultados = resp.data.filter( (el:any)=> (el.id == 1105 || el.id===1106) );//Solo mostrar Fundado e Infundo
          this.spinner.hide();
        },
        error: (error) => {
          this.resultados = [];
          this.spinner.hide();
          console.log(error);
        }
      })
    );
  }

  public obtenerMotivoCompetencia() {
    console.log('oooooooooooooooooooooooooooooo - obtenerMotivoCompetencia');
    const nombreGrupo = "IN_N_MOTIVO_COMPETENCIA";
    this.spinner.show();
    this.suscripciones.push(
      this.maestroService.obtenerCatalogo(nombreGrupo).subscribe({
        next: resp => {
          this.motivos = resp.data;
          this.spinner.hide();
        },
        error: (error) => {
          this.motivos = [];
          this.spinner.hide();
          console.log(error);
        }
      })
    );
  }

  protected obtenerTipoCopia(): void {
    console.log('oooooooooooooooooooooooooooooo - obtenerTipoCopia');
    const nombreGrupo = 'ID_N_TIPO_COPIA';
    this.spinner.show();
    this.suscripciones.push(
      this.maestroService.obtenerCatalogo(nombreGrupo).subscribe({
        next: resp => {
          this.tipoCopias = resp.data;
          this.spinner.hide();
        },
        error: (error) => {
          this.tipoCopias = [];
          this.spinner.hide();
          console.log(error);
        }
      })
    );
  }

  private async verDocumentoVisor(documentoAdjunto: any): Promise<void> {
    console.log('documentoAdjunto', documentoAdjunto);
    this.documentoAdjunto = {
      id: documentoAdjunto.id,
      urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(documentoAdjunto.file)),
      preNamePdf: 'Vista previa del documento: ',
      namePdf: `${documentoAdjunto.nombreOrigen}`,
      isSign: documentoAdjunto.isSign,
      base64: await archivoFileToB64(documentoAdjunto.file),
      fromServer: false
    };
    this.spinner.hide();
  }

  private nuevoDocumento(): AdjuntoData {
    console.log('oooooooooooooooooooooooooooooo - nuevoDocumento');
    return this.documentoAdjunto = {
      id: null,
      urlPdf: null,
      preNamePdf: 'Sin vista previa de documento',
      namePdf: '',
      isSign: false,
      base64: null,
      fromServer: false
    } as AdjuntoData;
  }

  private async actualizarDocumentoAdjunto(esFirmado: boolean, documentoFile: File, documentoURL: any) {
    console.log('oooooooooooooooooooooooooooooo - actualizarDocumentoAdjunto');
    const fileB64 = await archivoFileToB64(documentoFile);
    this.documentoAdjunto = {
      ...this.documentoAdjunto,
      isSign: esFirmado,
      base64: await archivoFileToB64(documentoFile),
      urlPdf: documentoURL,
      fromServer: true
    };
    await this.registrarDatosFormulario();
  }

  private async obtenerDocumentoFirmado() {
    console.log('oooooooooooooooooooooooooooooo - obtenerDocumentoFirmado');
    return new Promise<void>((resolve, reject) => {
      this.spinner.show();
      this.suscripciones.push(
        this.repositorioDocumentoService
          .verDocumentorepositorio(this.nombreDocumentoCargado)
          .subscribe({
          next: async resp => {
            const documentoFirmado = new Blob([resp], {type: 'application/pdf'});
            const file = new File([documentoFirmado], this.documentoAdjunto.namePdf, {type: 'application/pdf'});
            const documentoURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(documentoFirmado));
            await this.actualizarDocumentoAdjunto(true, file, documentoURL);
            this.spinner.hide();
            resolve();
          },
          error: error => {
            this.spinner.hide();
            console.log(error)
          }
        })
      );
    });
  }

  private obtenerDocumentoAdjunto(idDocumento: string) {
    console.log('oooooooooooooooooooooooooooooo - obtenerDocumentoAdjunto');
    this.visorEfeService.getPDF64(idDocumento).subscribe({
      next: resp => {
        console.log('resp', resp)
        this.documentoAdjunto = {
          id: null,
          urlPdf: this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${String(resp.archivo)}`),
          preNamePdf: 'VISTA DEL DOCUMENTO',
          namePdf: resp.nombre,
          isSign: true,
          base64: String(resp.archivo),
          fromServer: true
        };

        this.files[0] = base64ToFile(String(resp.archivo));
        this.files[0].tamanyo = 0;
        this.files[0].nombreOrigen = resp.nombre;

      },
      error: error => {
        console.log(error)
      }
    });
  }

  public actualizarInformacion(): void {
    console.log('oooooooooooooooooooooooooooooo - actualizarInformacion');
    const referenciaModal = this.dialogService.open(ActualizarInformacionContiendaComponent, {
      width: '800px',
      contentStyle: {'overflow-y': 'auto', 'padding': '1.5vw'},
      baseZIndex: 10000,
      showHeader: false,
      data: {
        idCaso: this.idCaso,
        idBandejaElevacion: this.datos!.idBandejaElevacion,
        coEntidad: this.datos!.codigoEntidad,
        idTipoEntidad: this.datos!.idTipoEntidad,
        /**presidencia: 'PRESIDENCIA DE JUNTA DE FISCALES SUPERIORES - ' + this.datos!.distritoFiscal**/
        presidencia: this.datos!.entidad,
      }
    });

    referenciaModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.obtenerDatosFormulario();
        }
      }
    });
  }

  protected contadorCaracterDescripcion() {
    console.log('oooooooooooooooooooooooooooooo - contadorCaracterDescripcion');
    const words = this.form.get('descripcion')!.value ?? '';
    this.contadorCaracteresDescripcion = words.length;
    if (this.contadorCaracteresDescripcion >= this.maximoCaracteresDescripcion) {
      const currentValue = words;
      const newValue = currentValue.substring(0, this.maximoCaracteresDescripcion);
      this.form.get('descripcion')!.setValue(newValue);
    }
  }

  protected contadorCaracterObservaciones() {
    console.log('oooooooooooooooooooooooooooooo - contadorCaracterObservaciones');
    const words = this.form.get('observaciones')!.value ?? '';
    this.contadorCaracteresObservacion = words.length;
    if (this.contadorCaracteresObservacion >= this.maximoCaracteresObservacion) {
      const currentValue = words;
      const newValue = currentValue.substring(0, this.maximoCaracteresObservacion);
      this.form.get('observaciones')!.setValue(newValue);
    }
  }

  private llenarFormulario() {
    console.log('oooooooooooooooooooooooooooooo - llenarFormulario');

    this.form.get('resultado')!.setValue(this.datos!.idTipoResultado);
    this.form.get('fechaDisposicion')!.setValue(this.datePipe.transform(this.datos!.fechaDisposicion, 'dd/MM/yyyy'));
    this.form.get('motivo')!.setValue(this.datos!.idMotivoCompetencia);
    this.form.get('descripcion')!.setValue(this.datos!.descripcion);
    this.form.get('observaciones')!.setValue(this.datos!.observaciones);
    this.form.get('idTipoCopia')!.setValue(this.datos!.idTipoCopia == 0 ? null : this.datos!.idTipoCopia);

    if(this.datos && this.datos.fechaDisposicion !== null){
      this.form.get('resultado')!.disable();
      this.form.get('fechaDisposicion')!.disable();
      this.form.get('motivo')!.disable();
      this.form.get('descripcion')!.disable();
      this.form.get('observaciones')!.disable();
      this.form.get('idTipoCopia')!.disable();
      this.documentoCargado = true;
      this.esFirmadoGuardado = true;
    }
    if(this.datos && this.datos.archivo !== null){
      this.obtenerDocumentoAdjunto(this.datos!.archivo!);
    }

    this.spinner.hide();
  }

  /*** GUARDADO FORMULARIO Y FIRMADO DE DOCUMENTO ***/

  protected confirmarGuardarDigitalizado(): void {
    console.log('oooooooooooooooooooooooooooooo - confirmarGuardarDigitalizado');

    const confirmar = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: 'Registrar disposición',
        description: 'Está a punto de firmar digitalmente y registrar la disposición cargada.  ¿Desea continuar con el registro?',
        confirmButtonText: 'Sí, Continuar',
        cancelButtonText: 'Cancelar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    confirmar.onClose.subscribe((respuesta: string) => {
      respuesta === 'confirm' ? this.iniciarDocumentoFirmado() : null;
    });

    /*this.refModal = this.dialogService.open(ModalCargoFirmadoComponent, {
      showHeader: false,
      contentStyle: { 'max-width': '650px', padding: '0px' },
      data: {
        tipoModal: SLUG_CONFIRM_RESPONSE.OK,
        usuario: datosUsuario,
        tipoCopia: 'Copia de copia',
        //tipoCopia: this.tipoCopiaSeleccionada.toUpperCase(),
      },
    });

    this.refModal.onClose.subscribe((confirm) => {
      if (confirm === SLUG_CONFIRM_RESPONSE.OK) this.iniciarDocumentoFirmado();
    });*/
  }

  async iniciarDocumentoFirmado() {
    console.log('oooooooooooooooooooooooooooooo - iniciarDocumentoFirmado');
    await this.spinner.show()
    await this.obtenerDatosFirma();
    await this.cargarDocumentoRepositorio();
    let idTipoCopia = this.form.get('idTipoCopia')!.value;
    let desTipoCopia = this.tipoCopias.find(item => item.id === parseInt(idTipoCopia))?.noDescripcion;
    let id = this.tipoCopias.find(item => item.id === parseInt(idTipoCopia))?.id;
    let cargo = id?.toString() == TIPO_COPIA.COPIA_AUTENTICADA ? 'Fedatario institucional' : this.datosFirma.cargoFirmador;
    let body: FirmaInterface = {
      id: this.nombreDocumentoCargado,
      firma_url: `${BACKEND.FIRMA_CLIENTE}`,
      repositorio_url: `${BACKEND.REPOSITORIO_DOCUMENTO_ALFRESCO}`,
      rol: cargo,
      motivo: desTipoCopia,
      param_url: `${BACKEND.FIRMA_CLIENTE}cliente/obtenerparametros`,
      extension: 'pdf',
      posicionX: null,
      posicionY: null,
    };
    setTimeout(() => {
      this.spinner.show();
    }, 0);
    this.firmaDigitalClienteService.sendDataSign.emit(body);
  }

  private async obtenerDatosFirma() {
    console.log('oooooooooooooooooooooooooooooo - obtenerDatosFirma');
    await this.spinner.show();
    return new Promise<void>((resolve, reject) => {
      this.suscripciones.push(
        this.firmaIndividualService.obtenerDatosFirma().subscribe({
          next: (resp) => {
            this.datosFirma = resp;
            resolve();
          },
          error: (e) => {
            this.spinner.hide()
            console.error(e);
          },
        })
      );
    });
  }

  private async cargarDocumentoRepositorio() {
    await this.spinner.show();
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      formData.append(
        'file',
        base64ToFile(this.documentoAdjunto.base64!)!,
        this.documentoAdjunto.namePdf + '.pdf'
      );
      this.suscripciones.push(
        this.repositorioDocumentoService
          .guardarDocumentoRepositorio(formData)
          .subscribe({
            next: (resp) => {
              this.nombreDocumentoCargado = resp.data.nodeId;
              resolve();
            },
            error: (e) => {
              this.spinner.hide()
              console.error(e);
            },
          })
      );
    });
  }

  protected descargarArchivo(idDocumento: string, nombre?: string) {
    this.visorEfeService.getPDF64(this.datos!.archivo!).subscribe({
      next: (rs: any) => {
        descargarArchivoB64(
          rs.archivo,
          nombre ? nombre : rs.nombre ?? this.datos!.archivo!
        );
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  protected observarTramite(): void {
    const formulario = this.form.getRawValue();
    this.datos = {
      ...this.datos,
      etapa: this.etapa,
      idTipoResultado: formulario.resultado,
      //fechaDisposicion: formulario.fechaDisposicion ? this.datePipe.transform(formulario.fechaDisposicion, 'dd/MM/yyyy') : null,
      idMotivoCompetencia: formulario.motivo,
      descripcion: formulario.descripcion,
      observaciones: formulario.observaciones,
      idActoTramiteCaso: this._idActoTramiteCaso,
      idCaso: this.idCaso
    }

    this.referenciaModal = this.dialogService.open(ModalObservarRespuestaContiendaComponent, {
      width: '95%',
      contentStyle: {overflow: 'auto'},
      showHeader: false,
      data: {
        title: 'Observar pronunciamiento del Fiscal Superior',
        description: 'Hechos del caso',
        datos: this.datos
      }
    });

    this.referenciaModal.onClose.subscribe((resultado: any) => {
      if (resultado?.success) {
        this.obtenerDatosFormulario();
      }
    });
  }

  mostrarModalConfirmacion(){
    this.mensajeConfirmarRecibir('CONFIRMAR ACCIÓN', 'Por favor confirme la acción de recibir el trámite', 'warning', 'Aceptar',true);
  }
  protected eventoRecibirTramite() {
    this.modalDialogService
      .warning(
        'Confirmar acción',
        'Por favor confirme la acción de recibir el trámite',
        'Aceptar',
        true,
        'Cancelar'
      )
      .subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.recibeTramite();
          }
        },
      });
  }
  protected recibeTramite() {

    const formulario = this.form.getRawValue();
    this.datos = {
      ...this.datos,
      etapa: this.etapa,
      idTipoResultado: formulario.resultado,
      fechaDisposicion: formulario.fechaDisposicion ? this.datePipe.transform(formulario.fechaDisposicion, 'dd/MM/yyyy') : null,
      idMotivoCompetencia: formulario.motivo,
      descripcion: formulario.descripcion,
      observaciones: formulario.observaciones,
      idActoTramiteCaso: this._idActoTramiteCaso,
      idCaso: this.idCaso
    }

    this.spinner.show();
    this.suscripciones.push(
      this.contiendaCompetenciaService.aceptaResuelveContiendaEfe(this.datos).subscribe({
        next: datos => {
          this.datos = datos;
          this.spinner.hide();
          this.deshabilitado = true;
          this.mensajeConfirmarRecibir('Disposición recibida', 'Se recibió correctamente la disposición', 'success', 'OK', false);
        },
        error: error => {
          this.spinner.hide();
          console.log(error)
        }
      })
    );
  }

  mensajeConfirmarRecibir(mensaje:any, submensaje:any, icono:any, textoBotonConfirm:any, tipo:any) {
    let confirmacion = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icono,//'info',
        title: mensaje,
        description: submensaje,
        confirmButtonText: textoBotonConfirm,//OK,
        confirm: tipo,
        cancelButtonText : 'Cancelar',
      }
    } as DynamicDialogConfig<AlertaData>)

    confirmacion.onClose.subscribe((data:any)=>{
      if( data === 'confirm' && tipo) {
        this.recibeTramite();
      }
    })
  }

}
