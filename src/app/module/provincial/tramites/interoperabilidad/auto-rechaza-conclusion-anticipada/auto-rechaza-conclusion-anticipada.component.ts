import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component';
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { capitalizedFirstWord, valid } from '@core/utils/string';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { obtenerIcono } from '@utils/icon';
import { ESTADO_REGISTRO, icono, RESPUESTA_MODAL } from 'ngx-cfng-core-lib';
import { CmpLibModule, ctrlErrorMsg } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { Observable, Subscription } from 'rxjs';

import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component';
import { Imputado } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/auto-rechaza-conclusion-anticipada/imputado-interface';
import { RechazaConclusionAnticipadaInterface } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/auto-rechaza-conclusion-anticipada/rechaza-conclusion-anticipada-interface';
import { TipoSentencia } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/auto-rechaza-conclusion-anticipada/tipo-sentencia-interface';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { ConclusionAnticipadaService } from '@core/services/provincial/tramites/interoperabilidad/conclusion-anticipada/auto-rechaza-conclusion-anticipada/conclusion-anticipada.service';
import { MaestroService } from '@core/services/shared/maestro.service';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { NO_GRUPO_CATALOGO } from '@core/types/grupo-catalago';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { GestionAudiosComponent } from '@core/components/modals/gestion-audios/gestion-audios.component';
import { RegistroResolucionIncoacionService } from '@core/services/provincial/tramites/especiales/incoacion/registro-resolucion-incoacion.service';
import { ContadorFooterTextareaComponent } from "@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component";

enum TipoSentenciaEnum {
  CONCLUSION_TOTAL = 1362,
  CONCLUSION_PARCIAL = 1363,
}

@Component({
  selector: 'app-auto-rechaza-conclusion-anticipada',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    CalendarModule,
    CheckboxModule,
    RadioButtonModule,
    DropdownModule,
    TableModule,
    ReactiveFormsModule,
    PaginatorComponent,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    ContadorFooterTextareaComponent
],
  providers: [
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
    NgxCfngCoreModalDialogService,
  ],
  templateUrl: './auto-rechaza-conclusion-anticipada.component.html',
  styleUrl: './auto-rechaza-conclusion-anticipada.component.scss',
})
export class AutoRechazaConclusionAnticipadaComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() public idActoTramiteCasoDocumento: string | null = null;
  @Input() tramiteEnModoEdicion: boolean = false;

  protected idActoTramiteCaso!: string
  protected idEstadoRegistro!: number;

  protected obtenerIcono = obtenerIcono;
  protected listaSentencias: TipoSentencia[] = [];
  protected imputados: Imputado[] = [];
  protected listaImputados: Imputado[] = [];
  protected listaImputadosFiltrado: Imputado[] = [];
  protected longitudMaximaObservaciones: number = 200;
  protected formRegistro: FormGroup = new FormGroup({});
  protected flagregistrar: boolean = false;
  protected rechazaConclusionAnticipadaDetalle!: RechazaConclusionAnticipadaInterface;
  private readonly suscripciones: Subscription[] = [];

  protected audiosAudienciaCorrectos: boolean = false
  protected ocultarBotonGestionVideos: boolean = true

  protected query: any = { limit: 10, page: 1, where: {} };
  protected itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly conclusionAnticipadaService: ConclusionAnticipadaService,
    private readonly maestroService: MaestroService,
    private readonly casoService: Casos,
    private readonly dialogService: DialogService,
    private readonly gestionCasoService: GestionCasoService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly tramiteService: TramiteService,
    private readonly registroResolucionIncoacionService: RegistroResolucionIncoacionService,
    
  ) {
    this.formRegistro = this.fb.group({
      tipoSentencia: new FormControl(TipoSentenciaEnum.CONCLUSION_TOTAL, [Validators.required]),
      fechaNotificacion: new FormControl(null, [Validators.required]),
      esAudio: new FormControl(false),
      esVideo: new FormControl(false),
      sujetoProcesal: new FormControl(null),
      esPedidoApelacion: new FormControl(false),
      txtObservacion: new FormControl(null, [
        Validators.maxLength(this.longitudMaximaObservaciones),
      ]),
    });
  }

  ngOnInit(): void {
    this.tramiteService.verIniciarTramite = false;
    this.obtenerValidacionAudiosAudiencia();
    this.obtenerTipoSentenciaConlusionAnticipada();
    this.obtenerListaImputados(this.idCaso);
    if (this.tieneActoTramiteCasoDocumento) {
      this.obtenerDetalleActoTramiteCaso();
    }
  }

  protected activarFormulario(event: boolean) {
    this.tramiteService.verIniciarTramite = event;
  }

  protected errorMsg(ctrlName: any) {
    return ctrlErrorMsg(this.verificationForm().get(ctrlName));
  }

  protected counterReportChar(): number {
    return this.formRegistro.get('txtObservacion')!.value !== null
      ? this.formRegistro.get('txtObservacion')!.value.length
      : 0;
  }

  private verificationForm(): FormGroup {
    return new FormGroup({
      fechaPresentacion: new FormControl('', [Validators.required]),
    });
  }

  protected eventoAgregarSujetoProcesal() {
    const idSujetoProcesal = this.formRegistro.get('sujetoProcesal')?.value;

    if (!idSujetoProcesal) {
      this.modalDialogService.warning(
        'Selección requerida',
        'Debe seleccionar un sujeto procesal para agregar.',
        'Aceptar'
      );
      return;
    }

    const esDuplicado: boolean = this.esSujetoDuplicado(idSujetoProcesal);
    if (!esDuplicado) {
      const sujetoProcesalSeleccionado = this.imputados.filter(
        (e) => e.idSujetoCaso === idSujetoProcesal
      );

      this.listaImputados.push(sujetoProcesalSeleccionado[0]);
      this.listaImputadosFiltrado = this.listaImputados;
      this.itemPaginado.data.data = this.listaImputadosFiltrado;
      this.itemPaginado.data.total = this.listaImputados.length;
      // this.formRegistro.get('sujetoProcesal')?.setValue(null);
    } else {
      this.modalDialogService.info(
        'Registro duplicado',
        'El sujeto procesal ya fue ingresado.',
        'Aceptar'
      );
    }
    this.formRegistro.get('sujetoProcesal')?.setValue(null);
  }

  private esSujetoDuplicado(idSujetoProcesal: any): boolean {
    return this.listaImputados.some((e) => e.idSujetoCaso === idSujetoProcesal);
  }

  protected get esFormValid(): boolean {
    let esValid: boolean = false;

    const tipoSentencia = this.formRegistro.get('tipoSentencia')?.value;
    if (tipoSentencia) {
      if (tipoSentencia == TipoSentenciaEnum.CONCLUSION_TOTAL) {
        esValid = this.listaImputados.length === this.imputados.length;
      } else if (tipoSentencia == TipoSentenciaEnum.CONCLUSION_PARCIAL) {
        esValid = this.listaImputados.length > 0;
      } 
    }
    
    return esValid && this.formRegistro.valid;
  }

  private obtenerTipoSentenciaConlusionAnticipada(): void {
    this.suscripciones.push(
      this.maestroService.obtenerCatalogo(NO_GRUPO_CATALOGO.SENTENCIA_CONCLUSION_ANTICIPADA).subscribe({
        next: resp => {
          this.listaSentencias = resp.data.map((data: any) => ({ idCatalogo: data.id, descripcion: capitalizedFirstWord(data.noDescripcion) }))
        }
      })
    )
  }

  private obtenerListaImputados(idCaso: string) {
    this.conclusionAnticipadaService.obtenerListaImputados(idCaso).subscribe({
      next: (resp) => {
        if (resp.code === 200) {
          this.imputados = resp.data;
        }
      },
      error: () => {},
    });
  }

  private modalConfirmarRegistrarAutoRechazaConclusionAnticipada(): Observable<CfeDialogRespuesta> {
    return this.modalDialogService.question(
      '',
      'A continuación, se procederá a guardar el trámite de <b>Resolución - auto que rechaza la conclusión anticipada</b>. ¿Está seguro de realizar la siguiente acción?',
      'Aceptar',
      'Cancelar'
    );
  }

  protected eventoGuardar() {
    if (this.esFormValid) {
      this.modalConfirmarRegistrarAutoRechazaConclusionAnticipada().subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.registrarAutoRechazaConclusionAnticipada();
          }
        },
      });
    }
  }

  private obtenerDetalleActoTramiteCaso() {
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso)
      .subscribe({
        next: (resp: any) => {
          this.idEstadoRegistro = resp.idEstadoTramite;
          this.obtenerDatosTramite();
        },
      });
  }

  private obtenerDatosTramite() {
    const formularioBloqueado = !this.tramiteEnModoEdicion ? true : (!this.esModoEdicion && this.tramiteEstadoRecibido);
    this.bloquearFormulario(formularioBloqueado); 
    
    if (this.tramiteEstadoRecibido) {
      this.obtenerDetalleAutoRechazaConclusionAnticipada();
      this.obtenerImputadosTramiteCaso();
    } else if (this.esModoEdicion) {
      console.log('esModoEdicion');
    }
  }

  private registrarAutoRechazaConclusionAnticipada() {
    const datos = this.formRegistro.getRawValue();
    const listaSujetos: any = this.listaImputados.map((e) => e.idSujetoCaso);
    const body: any = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      idTipoConsecuencia: datos.tipoSentencia,
      fechaNotificacion: datos.fechaNotificacion,
      audio: this.audiosAudienciaCorrectos ? 'S' : 'N',
      video: this.ocultarBotonGestionVideos ? 'S' : 'N',
      observacion: datos.txtObservacion,
      listaIdSujetos: listaSujetos,
    };
    this.conclusionAnticipadaService
      .registrarAutoRechazaConclusionAnticipada(body)
      .subscribe({
        next: (resp) => {
          if (resp.code === 200) {
            this.idEstadoRegistro = ESTADO_REGISTRO.RECIBIDO
            this.gestionCasoService.obtenerCasoFiscal(this.idCaso);
            setTimeout(() => {
              this.modalDialogService.success(
                '',
                '<b>Se registró correctamente la información de la Resolución - auto que rechaza la conclusión anticipada</b>',
                'Cerrar'
              );
            }, 200);
            this.bloquearFormulario(true);
          }
        },
        error: () => {
          this.flagregistrar = false;
        },
      });
  }

  protected abrirModalVideosAudiencia(): void {
    const ref = this.dialogService.open(GestionAudiosComponent, {
      showHeader: false,
      width: '80%',
      contentStyle: { padding: '0' },
      data: {
        idCaso: this.idCaso,
        tituloModal: 'Audios de la audiencia',
        idActoTramiteCaso: this.idActoTramiteCaso,
        modoLectura: this.tramiteEstadoRecibido
      },
    });

    ref.onClose.subscribe(() => {
      this.obtenerValidacionAudiosAudiencia();
    });
  }

  protected obtenerValidacionAudiosAudiencia() {
    this.audiosAudienciaCorrectos = false;
    this.suscripciones.push(
      this.registroResolucionIncoacionService
        .validarAudiosDeAudiencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (resp.data !== null && resp.data === '1') {
              this.audiosAudienciaCorrectos = true;
            }
          }
        })
    );
  }

  protected obtenerTitulo(): string {
    const titulo = this.tramiteSeleccionado?.nombreTramite;
    if (!titulo) return '';
    let textoFormateado = titulo.toLowerCase();
    let palabras = textoFormateado.split(' ');
    for (let i = 0; i < palabras.length; i++) {
      palabras[i] = palabras[i].charAt(0).toUpperCase() + palabras[i].slice(1);
    }
    textoFormateado = palabras.join(' ');
    textoFormateado = textoFormateado.replaceAll(' De ', ' de ');
    return textoFormateado;
  }

  private obtenerDetalleAutoRechazaConclusionAnticipada() {
    this.conclusionAnticipadaService
      .obtenerDetalleAutoRechazaConclusionAnticipada(
        /**this.idActoTramiteProcesalEnlace**/
        this.idActoTramiteCaso
      )
      .subscribe({
        next: (resp) => {
          if (resp.code === 200) {
            this.rechazaConclusionAnticipadaDetalle = resp.data[0];
            const data: any = {
              tipoSentencia: this.rechazaConclusionAnticipadaDetalle.idTipoConsecuencia,
              fechaNotificacion: this.rechazaConclusionAnticipadaDetalle.fechaNotificacion,
              esAudio: this.rechazaConclusionAnticipadaDetalle.audio === 'S',
              esVideo: this.rechazaConclusionAnticipadaDetalle.video === 'S',
              txtObservacion:
                this.rechazaConclusionAnticipadaDetalle.observacion,
            };
            this.formRegistro.patchValue(data);
          }
        },
        error: () => {},
      });
  }

  private obtenerImputadosTramiteCaso() {
    this.conclusionAnticipadaService
      /**.obtenerImputadosTramiteCaso(this.idActoTramiteProcesalEnlace)**/
      .obtenerImputadosTramiteCaso(this.idActoTramiteCaso)
      .subscribe({
        next: (resp) => {
          if (resp.code === 200) {
            this.listaImputados = resp.data;
            this.listaImputadosFiltrado = resp.data;
            this.itemPaginado.data.data = this.listaImputadosFiltrado;
            this.itemPaginado.data.total = this.listaImputados.length;
          }
        },
        error: () => {},
      });
  }

  protected get servicioActivo(): boolean {
    return !this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido;
  }

  protected get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '')
  }

  get tramiteEstadoRecibido(): boolean {
    return this.idEstadoRegistro === ESTADO_REGISTRO.RECIBIDO;
  }

  protected get esModoEdicion(): boolean {
    return this.tramiteEnModoEdicion;
  }

  protected bloquearFormulario(bloquear: boolean) {
    this.flagregistrar = bloquear;
    bloquear ? this.formRegistro.disable() : this.formRegistro.enable();
  }

  protected eventoEliminarImputado(item: Imputado) {
    this.listaImputados = this.listaImputados.filter(
      (imputado) => imputado !== item
    );
    this.modalDialogService.success('', 'Se eliminó correctamente', 'Aceptar');
    this.listaImputadosFiltrado = this.listaImputados;
    this.itemPaginado.data.data = this.listaImputadosFiltrado;
    this.itemPaginado.data.total = this.listaImputados.length;
  }

  protected eventoOnPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  private updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.listaImputadosFiltrado = this.listaImputados.slice(start, end);
  }

  protected modalActualizarActoYTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,
      data: {
        tipo: 2,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoTramiteCaso: this.idActoTramiteCaso
      },
    });
    ref.onClose.subscribe((confirm: any) => {
      if (confirm === RESPUESTA_MODAL.OK) window.location.reload();
    });
  }

  protected validarObservacion(input: string): boolean {
    return valid(this.formRegistro.get(input)?.value)
  }

  protected icono(name: string): string {
    return icono(name);
  }
}
