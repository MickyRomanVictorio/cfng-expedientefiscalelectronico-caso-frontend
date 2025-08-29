import { NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { SujetosProcesalesPestanas } from '@interfaces/reusables/sujeto-procesal/sujetos-procesales-pestanas.interface';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { ResolucionAutoResuelveRequerimientoService } from '@services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service';
import { obtenerIcono } from '@utils/icon';
import { obtenerCasoHtml } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { NombrePropioPipe } from '@pipes/nombre-propio.pipe';
import { SujetoQueja } from '@core/interfaces/provincial/tramites/comun/cuadernos-incidentales/queja-denegatoria-apelacion/sujeto-queja.interface';
import { AutoResuelveQuejaDenegatoriapelacionService } from '@core/services/provincial/cuadernos-incidentales/auto-resuelve-queja-denegatoria-apelacion/auto-resuelve-queja-denegatoria-apelacion.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { Combo } from '@interfaces/comunes/combo';
import {
  ApelacionFiscalia,
  ApelacionProcesoInmediato
} from '@interfaces/provincial/tramites/fundado-procedente/apelacion-fiscalia';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { BaseResponse } from '@interfaces/comunes/genericos.interface';

@Component({
  standalone: true,
  selector: 'app-registrar-auto-queja-denegatoria-modal',
  templateUrl: './registrar-auto-queja-denegatoria-modal.component.html',
  styleUrls: ['./registrar-auto-queja-denegatoria-modal.component.scss'],
  imports: [
    CmpLibModule,
    NgIf,
    ProgressBarModule,
    PaginatorComponent,
    CapitalizePipe,
    NgForOf,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
    NombrePropioPipe,
    NombrePropioPipe,
    ReactiveFormsModule,
  ],
})
export class RegistrarAutoQuejaDenegatoriaModalComponent implements OnInit, OnDestroy {
  public tituloModal: SafeHtml | undefined = undefined;
  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  public sujetosProcesalesModal: any[] = [];
  public sujetosProcesalesBackup: SujetosProcesalesPestanas[] = [];
  public disableButtonAceptarModalSujetoProcesal: boolean = false;
  protected readonly obtenerIcono = obtenerIcono;
  private idCaso: string = '';
  private idActoTramiteCaso: string = '';
  protected nuPestana: string = '';
  private readonly subscriptions: Subscription[] = [];
private idsSujeto: string[] = ['000172'];
  protected formQuejaFiscalia: FormGroup;
  public sujetosProcesales: SujetosProcesalesPestanas[] = [];
  public sujetosProcesalesFiltrados: any[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesalesPestanas[] = [];
  public sujetosSeleccionados: SujetosProcesalesPestanas[] = [];
  protected listaQuejaFiscalia: Combo[] = [];
  protected listaRespuesta: Combo[] = [];
  protected apelacionFiscalia!: ApelacionProcesoInmediato;
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: boolean = false;
  private selectedSujetos: any = [];

  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected selectAllCheck: boolean = false;
  protected esApelacion: boolean = false;
  protected esQueja: boolean = false;
  protected nivelApelacion: string = ''; //proceso | sujeto
  protected nuApelacionFiscal: number = 0;

  constructor(
    private readonly fb: FormBuilder,
    public config: DynamicDialogConfig,
    private readonly sanitizador: DomSanitizer,
    private readonly dialogRef: DynamicDialogRef,
    private readonly tramiteService: TramiteService,
    private readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
    private readonly autoResuelveQuejaDenegatoriapelacionService: AutoResuelveQuejaDenegatoriapelacionService
  ) {
    this.formQuejaFiscalia = this.fb.group({
      resultadoQueja: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.esApelacion = this.config.data?.esApelacion;
    this.esQueja = this.config.data?.esQueja;
    this.nuPestana = this.config.data?.nuPestana;
    this.nivelApelacion = this.numeroCaso.endsWith('0') ? 'proceso' : 'sujeto';

    this.tituloModal = `Seleccionar resultado de la resolución de la queja por denegatoria`;
    this.tituloDelCaso();
    this.iniciarValores();
    this.obtenerSujetosProcesales();
    if (!this.esSujeto) {
      this.obtenerApelacionFiscalia();
    }
    this.disableButtonAceptarModalSujetoProcesal = true;

    if (this.config.data?.soloLectura) {
      this.soloLectura = true;
      this.formQuejaFiscalia.disable();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  protected get esSujeto(): boolean {
    return this.nivelApelacion === 'sujeto' || this.idsSujeto.includes(this.idActo);
  }


  protected get fiscalQuejaAudiencia(): boolean {
    return this.apelacionFiscalia && this.apelacionFiscalia.flagRspQueja !== null;
  }

  protected get idActoSeleccionado(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }

  protected esMismoTramite(sujeto: SujetoQueja): boolean {
    if (sujeto.idActoTramiteCasoGuardado) {
      return sujeto.idActoTramiteCasoGuardado == this.idActoTramiteCaso;
    }
    return false;
  }

  protected apeloAudiencia(idActoTramiteCasoResultado: string): boolean {
    return this.idActoSeleccionado !== idActoTramiteCasoResultado;
  }

  protected quejaAudiencia(flRspQueja: string): boolean {
    return flRspQueja !== null && flRspQueja === '1';
  }

  protected get descripcionResultado(): string {
    return this.apelacionFiscalia.descripcionResultado ?? '';
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `${this.numeroCaso.endsWith('0') ? 'Número de caso: ' : 'Incidente: '
    } ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }

  private iniciarValores(): void {
    this.listaQuejaFiscalia = this.listaRespuesta = [
      { id: 1059, nombre: 'Procedente/Fundado queja' },
      { id: 1060, nombre: 'Improcedente/Infundado queja' },
      { id: 1049, nombre: 'Consentido' },
    ];
  }

  private obtenerApelacionFiscalia(): void {
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerProcesoInmediato(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: ApelacionProcesoInmediato) => {
            this.apelacionFiscalia = resp;
            this.formQuejaFiscalia.get('resultadoQueja')?.setValue(resp.idRspInstanciaQueja);
          },
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar obtener la apelación de la fiscalía al proceso inmediato',
              'Aceptar'
            );
          },
        })
    );
  }

  protected onChangeResultadoQuejaFiscalia(): void {
    let data = this.formQuejaFiscalia.getRawValue();

    if (data.resultadoQueja !== null) {
      let request: ApelacionFiscalia = {
        idActoTramiteCaso: this.apelacionFiscalia.idActoTramiteCaso,
        idRspInstancia: data.resultadoQueja
      };
      this.guardarResultadoApelacion(request);
    }
  }

  private guardarResultadoApelacion(request: ApelacionFiscalia): void {
    this.subscriptions.push(
      this.autoResuelveQuejaDenegatoriapelacionService
        .registrarRespuestaQueja(request)
        .subscribe({
          next: (resp: BaseResponse) => {},
          error: () => {
            this.modalDialogService.error(
              'ERROR',
              'Error al intentar registrar el resultado de la queja de la fiscalía',
              'Aceptar'
            );
          },
        })
    );
  }

  private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosProcesales = resp
              .filter((sujeto: any) => (!this.esSujeto && sujeto.idTipoRespuestaPE) || this.esSujeto)
              .map((sujeto: any) => ({
                ...sujeto,
                flApelacionFiscal: sujeto.flApelacionFiscal === '1',
                sujetoSelected: false,
              }))
              .map((sujeto: any) => {
                if (!this.esOtroTramiteGuardado(sujeto)) {
                  sujeto.sujetoSelected = true;
                }
                return sujeto;
              })
              .sort((a: any, b: any) => {
                // Mostrar primero los elementos con estadoQueja igual a null o 0

                // Ordenar por idTipoRespuestaInstancia1: 1048 primero, luego 1492, y luego el resto
                //  const order = [1024 , 1062];
                // Priorizar por idTipoRespuestaInstancia1 = 1048
                const getPriority = (item: any) => {
                  if (item.idTipoRespuestaApelacion === 1024 && item.flApelacionFiscal === true) return 1;
                  if (item.flApelacionFiscal === true && item.idTipoRespuestaApelacion !== 1024) return 2;
                  if (item.flApelacionFiscal === false && item.idTipoRespuestaApelacion === 1024) return 3;
                 return 4;
                };

                const priorityA = getPriority(a);
                const priorityB = getPriority(b);

                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }
                // Si tienen la misma prioridad, mantener el orden original


                // Dentro de los que tienen idTipoRespuestaInstancia1 = 1024, priorizar por idActoTramiteCasoGuardado
                if (
                  a.idTipoRespuestaApelacion === 1024 &&
                  b.idTipoRespuestaApelacion === 1024
                ) {
                  const aHasCondition =
                    a.idActoTramiteCasoGuardado == null ||
                    (a.idActoTramiteCasoGuardado !== null &&
                      a.idActoTramiteCasoGuardado == this.idActoTramiteCaso);

                  const bHasCondition =
                    b.idActoTramiteCasoGuardado == null ||
                    (b.idActoTramiteCasoGuardado !== null &&
                      b.idActoTramiteCasoGuardado == this.idActoTramiteCaso);

                  if (aHasCondition && !bHasCondition) {
                    return -1; // 'a' va antes que 'b'
                  }
                  if (!aHasCondition && bHasCondition) {
                    return 1; // 'b' va antes que 'a'
                  }
                }

                // Si no cumplen las condiciones anteriores, mantener el orden original
                return 0;
              });
            console.log('Sujetos procesales:', this.sujetosProcesales);
            /*         this.nuApelacionFiscal = this.sujetosProcesales.filter(
              (sujeto: SujetoQueja) =>
                sujeto.usuarioApelacion ===
                this.tokenService.getDecoded().usuario.usuario
            ).length; */
            this.nuApelacionFiscal = this.sujetosProcesales.filter(
              (sujeto: any) => sujeto.flApelacionFiscal
            ).length;
            if (this.soloLectura && this.esSujeto) {
              this.sujetosProcesales = this.sujetosProcesales.filter((sujeto) =>
                this.esMismoTramite(sujeto)
              );
              this.nuApelacionFiscal = this.sujetosProcesales.length;
            }
            this.sujetosProcesalesFiltrados = this.sujetosProcesales;
            this.verificarElementos();

            this.sujetosProcesalesSeleccionados = [];
            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.actualizarPaginaRegistros(this.sujetosProcesales);
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  protected esOtroTramiteGuardado(sujeto: SujetoQueja): boolean {
    if (sujeto.idActoTramiteCasoGuardado) {
      return (
        sujeto.idActoTramiteCasoGuardado !== this.idActoTramiteCaso &&
        sujeto.idTipoRespuestaQueja !== 0
      );
    }
    return false;
  }

  protected esMiApelacion(sujeto: SujetoQueja): boolean {
    return (
      sujeto.flApelacionFiscal === true
      //  sujeto.usuarioApelacion === this.tokenService.getDecoded().usuario.usuario
    );
  }

  private verificarElementos() {
    this.mostrarBtnAceptar = this.sujetosProcesalesFiltrados.some(
      (sujeto) => sujeto.selection
    );
  }

  protected onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  private updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = this.sujetosProcesalesModal.slice(
      start,
      end
    );
  }

  private actualizarPaginaRegistros(data: any) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }

  protected alCambiarQueja(item: any, drop: DropdownChangeEvent): void {
    item.idTipoRespuestaQueja = drop.value;
    item.sujetoSelected = true;
    item.selection = true;

    this.verificarElementos();
  }

  public cerrarModal(): void {
    this.dialogRef.close();
  }

  cancelar() {
    this.dialogRef.close();
  }

  aceptar() {
    const seleccionados = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.selection
    );
    this.selectedSujetos = seleccionados;
    this.eventoRegistrarSujetosProcesales();
  }

  protected eventoRegistrarSujetosProcesales() {
    const data: any = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetos: this.selectedSujetos,
    };
    console.log('Datos a enviar:', data);
    this.subscriptions.push(
      this.autoResuelveQuejaDenegatoriapelacionService
        .registrarResolucion(data)
        .subscribe({
          next: (resp) => {
            if (resp.code === '0') {
              this.dialogRef.close({
                flCheckModal: true,
              });
            }
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }
  protected get idActo(): string {
    return this.tramiteService.validacionTramite.idActoSeleccionado;
  }



}
