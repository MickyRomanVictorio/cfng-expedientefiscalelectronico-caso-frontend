import { NgClass } from '@angular/common'
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MensajeCompletarInformacionComponent } from '@core/components/mensajes/mensaje-completar-informacion/mensaje-completar-informacion.component'
import { MensajeInteroperabilidadPjComponent } from '@core/components/mensajes/mensaje-interoperabilidad-pj/mensaje-interoperabilidad-pj.component'
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal'
import { CalendarModule } from 'primeng/calendar'
import { CheckboxModule } from 'primeng/checkbox'
import { DropdownModule } from 'primeng/dropdown'
import { RadioButtonModule } from 'primeng/radiobutton'
import { Subscription } from 'rxjs'
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog'
import { GuardarTramiteProcesalComponent } from '@core/components/modals/guardar-tramite-procesal/guardar-tramite-procesal.component'
import { ESTADO_REGISTRO, icono, IconUtil, RESPUESTA_MODAL } from 'dist/ngx-cfng-core-lib'
import { capitalizedFirstWord, valid } from '@core/utils/string'
import { TableModule } from 'primeng/table'
import { CmpLibModule } from 'dist/cmp-lib'
import { CfeDialogRespuesta, NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog'
import { DialogModule } from 'primeng/dialog'
import { ConclusionAnticipadaService } from '@core/services/provincial/tramites/interoperabilidad/conclusion-anticipada/auto-rechaza-conclusion-anticipada/conclusion-anticipada.service'
import { GestionCasoService } from '@core/services/shared/gestion-caso.service'
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service'
import { EncabezadoModalComponent } from '@core/components/modals/encabezado-modal/encabezado-modal.component'
import { ContadorFooterTextareaComponent } from "@core/components/reutilizable/contador-footer-textarea/contador-footer-textarea.component";
import { TramiteService } from '@core/services/provincial/tramites/tramite.service'
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component'
import { DeclaraConsentidoConclusionAnticipada } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/declara-consentido-conclucion-anticipada/declara-consentido-conclusion.interface'
import { Imputado } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/auto-rechaza-conclusion-anticipada/imputado-interface'
import { Delito } from '@core/interfaces/provincial/tramites/interoperabilidad/conclusion-anticipada/declara-consentido-conclucion-anticipada/delito-interface'
import { RegistrarPenasService } from '@core/services/reusables/otros/registrar-penas.service'
@Component({
  selector: 'app-registrar-auto-consentido-conclusion-anticipada',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    MensajeInteroperabilidadPjComponent,
    MensajeCompletarInformacionComponent,
    CalendarModule,
    NgClass,
    CheckboxModule,
    DropdownModule,
    TableModule,
    CmpLibModule,
    DialogModule,
    NgxCfngCoreModalDialogModule,
    ContadorFooterTextareaComponent,
    PaginatorComponent
],
  providers: [ 
    DialogService,
    DynamicDialogConfig,
  ],
  templateUrl: './registrar-auto-consentido-conclucion-anticipada.component.html',
  styleUrl: './registrar-auto-consentido-conclucion-anticipada.component.scss'
})
export class RegistrarConsentidoConclusionAnticipadaComponent implements OnInit, OnDestroy {

  protected idCaso!: string

  protected idActoTramiteCaso!: string

  public idEtapa!: string

  public numeroCaso!: string

  protected tramiteSeleccionado: TramiteProcesal | null = null

  /**protected tramiteEnModoEdicion: boolean = false**/
  @Input() tramiteEnModoEdicion: boolean = false;

  protected idEstadoTramite!: number

  protected idEstadoRegistro!: number

  private readonly casoService = inject(Casos)

  private readonly conclusionAnticipadaService = inject(ConclusionAnticipadaService)

  private readonly constructorFormulario = inject(FormBuilder)

  private readonly dialogService = inject(DialogService)

  private readonly gestionCasoService = inject(GestionCasoService)

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)

  protected readonly iconUtil = inject(IconUtil)

  private readonly tramiteService = inject(TramiteService)

  private readonly registrarPenasService = inject(RegistrarPenasService)

  private readonly suscripciones: Subscription[] = []

  protected formularioConsentido: any;

  protected imputados: Imputado[] = [];

  protected delitos: Delito[] = [];

  protected listaPenas: any = [];

  protected listaPenasTodo: any = [];

  protected listaPenasFiltrado: any = [];

  protected longitudMaximaObservaciones: number = 200;

  protected flagregistrar: boolean = false;

  //PAGINADO
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

  ngOnInit(): void {
    console.log('idActoTramiteCaso = ', this.idActoTramiteCaso);
    console.log('tramiteNoDespachadoMesa = ', this.tramiteNoDespachadoMesa);
    console.log('tramiteEstadoRecibido = ', this.tramiteEstadoRecibido);
    
    this.tramiteService.verIniciarTramite = false;
    this.formularioConsentido = this.construirFormulario();
    this.listarSujetosProcesal();
 
    if (this.tieneActoTramiteCasoDocumento) {
      this.obtenerDetalleActoTramiteCaso();
    }
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach( suscripcion => suscripcion.unsubscribe() )
  }

  private construirFormulario(): FormGroup {
    return this.constructorFormulario.group({
      fechaNotificacion: [ null, Validators.required ],
      sujetoProcesal: [ null ],
      delito: [ null ],
      observaciones: [ '' , [Validators.maxLength(this.longitudMaximaObservaciones)]],
    })
  }

  protected bloquearFormulario(bloquear: boolean) {
    this.flagregistrar = bloquear;
    bloquear ? this.formularioConsentido.disable() : this.formularioConsentido.enable();
  }

  protected activarFormulario(event: boolean) {
    this.tramiteService.verIniciarTramite = event;
  }

  get esFormularioValido(): boolean {
    const datos = this.formularioConsentido.getRawValue() 
    const tieneDatosRequeridos = 
      datos.fechaNotificacion !== null &&
      this.listaPenasActivas.length > 0
  
    return tieneDatosRequeridos;
  }

  get esPosibleEditarPorEstado(): boolean {
    return !this.tramiteEstadoRecibido
  }

  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso( this.idActoTramiteCaso )
      .subscribe({
        next: (resp: any) => {
          this.idEstadoRegistro = resp.idEstadoTramite;
          this.obtenerDatosTramite();
        }
    })
  }

  protected get esModoEdicion(): boolean {
    return this.tramiteEnModoEdicion;
  }

  private obtenerDatosTramite() {
    console.log('entro obtenerDatosTramite')
    console.log('esModoEdicion = ', this.esModoEdicion)
    console.log('tramiteEstadoRecibido = ', this.tramiteEstadoRecibido);
    
    const formularioBloqueado = !this.esModoEdicion;
    this.bloquearFormulario(formularioBloqueado); 

    this.obtenerDetalleAutoDeclaraConsentidoConclusionAnticipada();
    this.listarPenasRegistradasConsentido();
  }

  private obtenerDetalleAutoDeclaraConsentidoConclusionAnticipada(): void {
    this.suscripciones.push(
      this.conclusionAnticipadaService.obtenerDetalleTramiteConsentidoConclusionAnticipada( this.idActoTramiteCaso ).subscribe({
        next: (resp) => {
          if (resp.code === 200) {
            this.establecerValoresFormularioRecibido( resp.data[0] )
          }
        }
      })
    )
  }

  private establecerValoresFormularioRecibido(resp: DeclaraConsentidoConclusionAnticipada): void {
    this.formularioConsentido.patchValue({
      fechaNotificacion: resp.fechaNotificacion,
      observaciones: resp.observacion,
    })
  }

  private listarSujetosProcesal() {
    this.suscripciones.push(
      this.conclusionAnticipadaService.obtenerListaImputadosConsentido(this.idActoTramiteCaso).subscribe({
        next: (resp) => {
          if (resp.code === 200) {
            this.imputados = resp.data;
          }
        },
        error: () => {},
      })
    )
  }

  public listarDelitos(idSujetoCaso: string) {
    this.suscripciones.push(
      this.conclusionAnticipadaService.obtenerListaPenasConsentido(this.idActoTramiteCaso, idSujetoCaso).subscribe({
        next: (resp) => {
          if (resp.code === 200) {
            this.delitos = resp.data;
          }
        },
        error: () => {},
      })
    )
  }

  private listarPenasRegistradasConsentido(): void {
    this.suscripciones.push(
      this.conclusionAnticipadaService.obtenerPenasConsentidoRegistradas(this.idActoTramiteCaso).subscribe({
        next: resp => {
          this.listaPenas = resp;
          this.listaPenasTodo = resp;
          this.actualizarListaFiltrada();
        },
        error: () => {},
      })
    )
  }

  private actualizarListaFiltrada(): void {
    this.listaPenasFiltrado = this.listaPenas.filter((pena: any) => pena.esActivo === '1');
    this.itemPaginado.data.data = this.listaPenasFiltrado;
    this.itemPaginado.data.total = this.listaPenasFiltrado.length;
  }

  formularioValido(): boolean {
    return !!this.formularioConsentido.get('sujetoProcesal')?.value &&
          !!this.formularioConsentido.get('delito')?.value;
  }

  protected eventoAgregarPenaConsentido() {
    const idSujetoProcesal = this.formularioConsentido.get('sujetoProcesal')?.value;
    const idDelito = this.formularioConsentido.get('delito')?.value;

    if (!idSujetoProcesal) {
      this.modalDialogService.warning(
        'Selección requerida',
        'Debe seleccionar un sujeto procesal para agregar.',
        'Aceptar'
      );
      return;
    }

    if (!idDelito) {
      this.modalDialogService.warning(
        'Selección requerida',
        'Debe seleccionar un delito para agregar.',
        'Aceptar'
      );
      return;
    }

    // Buscar si ya existe (activo o inactivo)
    const penaExistente = this.listaPenas.find((e: any) =>
      e.idSujetoCaso === idSujetoProcesal &&
      e.idDelitoSujeto === idDelito
    );

    if (penaExistente) {
      if (penaExistente.esActivo === '1') {
        this.modalDialogService.info(
          'Registro duplicado',
          'El sujeto procesal y delito ya fue ingresado.',
          'Aceptar'
        );
      } else {
        penaExistente.esActivo = '1';
        this.actualizarListaFiltrada();
      }
    } else {
      console.log('no exite la pena se agrega');
    }
    
    this.formularioConsentido.get('sujetoProcesal')?.setValue(null);
    this.formularioConsentido.get('delito')?.setValue(null);
    this.delitos = [];
  }

  protected eliminarPenaConsentido(item: any) {
    console.log('idActoTramiteResultadoDelitoSujeto= ' , item.idActoTramiteResultadoDelitoSujeto);

    const pena = this.listaPenas.find((p: any)  =>
      p.idActoTramiteResultadoDelitoSujeto === item.idActoTramiteResultadoDelitoSujeto
    );

    console.log('pena = ', pena);

    if (pena) {
      pena.esActivo = '0';
    }

    this.modalDialogService.success('', 'Se eliminó correctamente', 'Aceptar');
    this.actualizarListaFiltrada();
  }

  protected preguntarGuardadoAutoDeclaraConsentidoConclusionAnticipada(): void {
    const totalPenas = this.listaPenasTodo.length;
    const penasActivas = this.listaPenasActivas.length;

    if (penasActivas === 0) {
      this.modalDialogService.info(
        'Sin penas activas',
        'Debe registrar al menos una pena activa para poder continuar con el trámite.',
        'Aceptar'
      );
      return;
    }

    let titulo = 'Confirmar';
    let mensaje = '';
    let flgConcluido = false;

    
    if (penasActivas === totalPenas) {
      mensaje = `A continuación se registrará <b>sentencia consentida total</b> (todos los sentenciados). 
        Esta confirmación concluye la etapa de <b>juzgamiento</b> y el caso pasará a la bandeja de <b>concluidos</b>, después no podrá revertir el cambio.<br>
        <b>Nota:</b> Para las sentencias condenatorias o reparación civil exclusiva se creará cuadernos de ejecución (Módulo <b>SEGUIMIENTO DE EJECUCIÓN</b>).<br>
        ¿Está seguro de realizar este trámite?`;
        flgConcluido = true;
    } else {
      mensaje = `A continuación se procederá a registrar <b>sentencia consentida parcial</b>.<br>
        <b>Nota:</b> Para las sentencias condenatorias o reparación civil exclusiva se creará cuadernos de ejecución.<br>
        ¿Está seguro de realizar este trámite?`;
    }

    this.modalDialogService.question(titulo, mensaje, 'Aceptar', 'Cancelar')
      .subscribe({
        next: (resp: CfeDialogRespuesta) => {
          if (resp === CfeDialogRespuesta.Confirmado) {
            this.guardadoAutoDeclaraConsentidoConclusionAnticipada(flgConcluido);
          }
        }
      });
  }

  protected guardadoAutoDeclaraConsentidoConclusionAnticipada(flgConcluido: boolean): void {
    const datos = this.formularioConsentido.getRawValue()
    const listaResultado: any = this.listaPenasActivas.map((e : any) => e.idActoTramiteResultadoDelitoSujeto);
    const datosSentencia = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaNotificacion: datos.fechaNotificacion,
      observaciones: datos.observaciones,
      listaIdResultado: listaResultado,
      flgConcluido: flgConcluido ? '1' : '0'
    }
    this.suscripciones.push(
      this.conclusionAnticipadaService.registrarAutoDeclaraConsentidoConclusionAnticipada(
        datosSentencia       
      ).subscribe({
        next: () => {
          this.idEstadoRegistro = ESTADO_REGISTRO.RECIBIDO
          this.gestionCasoService.obtenerCasoFiscal(this.idCaso)
          this.modalDialogService.success('', `Se registró la información de la <b>${this.nombreTramite()}</b>.`, 'Aceptar')
          this.bloquearFormulario(true);
        }
      })
    )
  }

  protected get tramiteNoDespachadoMesa(): boolean {
    return !this.tieneActoTramiteCasoDocumento && !this.tramiteEstadoRecibido
  }

  protected get tieneActoTramiteCasoDocumento(): boolean {
    return !(this.idActoTramiteCaso == null || this.idActoTramiteCaso == '')
  }

  protected get tramiteEstadoRecibido(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.RECIBIDO
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

  protected validarObservacion(input: string): boolean {
    return valid(this.formularioConsentido.get(input)?.value)
  }

  get listaPenasActivas(): any[] {
    return this.listaPenas.filter( (pena : any) => pena.esActivo === '1');
  }

  //ICONO
  protected icono(name: string): string {
      return icono(name);
  }

  //PAGINADO
  protected eventoOnPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  private updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.listaPenasFiltrado = this.listaPenasActivas.slice(start, end);
  }

  //¿Este documento no pertenece a este trámite?
  protected abrirModalSeleccionarTramite(): void {
    const ref = this.dialogService.open(GuardarTramiteProcesalComponent, {
      showHeader: false,
      data: {
        tipo: 2,
        idCaso: this.idCaso,
        idEtapa: this.idEtapa,
        idActoTramiteCaso: this.idActoTramiteCaso,
      }
    })

    ref.onClose.subscribe((confirm) => {
      if (confirm === RESPUESTA_MODAL.OK) this.recargarPagina()
    })
  }

  private recargarPagina(): void {
    window.location.reload()
  }

}