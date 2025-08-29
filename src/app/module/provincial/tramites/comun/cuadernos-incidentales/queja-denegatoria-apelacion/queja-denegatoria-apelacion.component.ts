import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Observable,
  Subscription,
  catchError,
  map,
  tap,
  throwError,
} from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { QuejaDenegatoriaApelacionService } from '@services/provincial/tramites/comun/calificacion/queja-denegatoria-apelacion/queja-denegatoria-apelacion.service';
import { SujetoQueja } from '@interfaces/provincial/tramites/comun/cuadernos-incidentales/queja-denegatoria-apelacion/sujeto-queja.interface';
import { QuejaDenegatoriaApelacion } from '@interfaces/provincial/tramites/comun/cuadernos-incidentales/queja-denegatoria-apelacion/queja-denegatoria-apelacion.interface';
import { SujetosQuejaModalComponent } from '@modules/provincial/tramites/comun/cuadernos-incidentales/queja-denegatoria-apelacion/sujetos-queja-modal/sujetos-queja-modal.component';
import { ResolucionAutoResuelveRequerimientoService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/resuelve-requerimiento.service';
import { SujetosProcesalesPestanas } from '@core/interfaces/reusables/sujeto-procesal/sujetos-procesales-pestanas.interface';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import {ESTADO_REGISTRO, ACTOS} from 'ngx-cfng-core-lib';
import { ValidacionTramite } from '@interfaces/comunes/crearTramite';

@Component({
  selector: 'app-queja-denegatoria-apelacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queja-denegatoria-apelacion.component.html',
  styleUrls: ['./queja-denegatoria-apelacion.component.scss'],
})
export class QuejaDenegatoriaApelacionComponent implements OnInit, OnDestroy {
  @Input() etapa: string = 'preliminar';
  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idEstadoTramite!: number;
  @Input() validacionTramite!: ValidacionTramite;

  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
      //!this.esNuevo && this.obtenerDatosFormulario();
      this.esNuevo && this.registrarDatosFormulario();
    }
  }

  @Input() deshabilitado: boolean = false;

  @Output() datosFormulario = new EventEmitter<Object>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  private _idActoTramiteCaso: string = '';

  private sujetosQueja: SujetoQueja[] = [];
  private sujetosQuejaSele: SujetoQueja[] = [];
  private suscripciones: Subscription[] = [];
  public sujetosProcesales: SujetosProcesalesPestanas[] = [];
  private readonly subscriptions: Subscription[] = [];
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  constructor(
    private quejaDenegatoriaApelacionService: QuejaDenegatoriaApelacionService,
    private dialogService: DialogService,
    private spinner: NgxSpinnerService,
    private readonly resolucionAutoResuelveRequerimientoService: ResolucionAutoResuelveRequerimientoService,
    protected readonly tramiteService: TramiteService
  ) {}

  ngOnInit(): void {
    // this.obtenerDatosFormulario();
    this.obtenerSujetosProcesales();
    this.peticionParaEjecutar.emit((_) => this.guardarFormulario());
    if(this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO){
      this.deshabilitado = true;
    }

  }
  protected habilitarGuardar(estado: boolean): void {

    this.tramiteService.habilitarGuardar = estado;
  }
  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso;
  }

  get formularioValido(): boolean {

    return !this.verSujetos || this.sujetosQueja.some(
      (sujeto: SujetoQueja) => sujeto.estadoQueja === '1' && sujeto.idPetitorioQueja !== 0
    );
  }

  get obtenerEtapa(): string  {
    return this.etapa == 'incoacion-proceso-inmediato' ? 'procesosespeciales' : this.etapa;
  }

  get verSujetos(): boolean {
    const actos: string[] = [ACTOS.APELACION_PROCESO_INMEDIATO,
      ACTOS.APELACION_TERMINACION_ANTICIPADA,
      ACTOS.APELACION_PRINCIPIO_OPORTUNIDAD,
      ACTOS.APELACION_ACUERDO_REPARATORIO];
    return !actos.includes(this.validacionTramite.idActoSeleccionado);
  }
  enviarDatosFormulario(): void {
    this.sujetosQuejaSele = this.sujetosQueja.filter(
      (sujeto: SujetoQueja) => sujeto.estadoQueja === '1' && sujeto.idPetitorioQueja !== 0
    );
  }
  private guardarFormulario(): Observable<any> {
    this.enviarDatosFormulario();
    const quejaDenegatoriaApelacion: QuejaDenegatoriaApelacion = {
      etapa: this.obtenerEtapa,
      idActoTramiteCaso: this.idActoTramiteCaso,
      sujetosQueja: this.sujetosQuejaSele,
    };

    return this.quejaDenegatoriaApelacionService
      .registrar(quejaDenegatoriaApelacion)
      .pipe(
        tap(() => {
          this.modalDialogService.success(
            'Datos guardados correctamente',
            'Se guardaron correctamente los datos para el trámite: <b>' +
              this.tramiteSeleccionado?.nombreTramite +
              '</b>.',
            'Aceptar'
          );
          if (this.formularioValido) {
            this.habilitarFirma();
          }
        }),
        map(() => 'válido'),
        catchError(() => {
          this.modalDialogService.error(
            'Error',
            'No se pudo guardar la información para el trámite: <b>' +
              this.tramiteSeleccionado?.nombreTramite +
              '</b>.',
            'Aceptar'
          );
          return throwError(() => new Error('Error al guardar.'));
        })
      );
  }
  public habilitarFirma(): void {
    this.formularioEditado(false);
    this.habilitarGuardar(false);
  }
  protected formularioEditado(valor: boolean) {
    this.deshabilitado = !valor;
    this.tramiteService.formularioEditado = valor;
  }
  private obtenerSujetosProcesales(): void {
    // this.sujetosProcesales = [];
    this.subscriptions.push(
      this.resolucionAutoResuelveRequerimientoService
        .obtenerSujetosProcesales(this.idActoTramiteCaso, 1)
        .subscribe({
          next: (resp) => {
            this.sujetosQueja = this.getSujetos(resp);
            this.habilitarGuardar(this.formularioValido);
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }
  getSujetos(respuesta: SujetosProcesalesPestanas[]): SujetoQueja[] {
    return respuesta.map((response) => this.transformarSujeto(response));
  }
  private transformarSujeto(backendSujeto: any): SujetoQueja {
    return {
      idSujetoCaso: backendSujeto.idSujetoCaso,
      nombreSujeto: backendSujeto.nombreCompleto,
      tipoParteSujeto: backendSujeto.noTipoParteSujeto,
      resultadoPrimera: backendSujeto.noTipoRespuestaInstancia1,
      respuestaInstancia: backendSujeto.noTipoRespuestaApelacion,
      idRespuestaInstancia: backendSujeto.idTipoRespuestaApelacion,
      estadoQueja: backendSujeto.estadoQueja,
      usuarioApelacion: backendSujeto.usuarioApelacion,
      flApelacion: backendSujeto.flApelacion,
      idTipoRespuestaInstancia1: backendSujeto.idTipoRespuestaInstancia1,
      idPetitorioQueja: backendSujeto.idPetitorioQueja,
      flApelacionFiscal: backendSujeto.flApelacionFiscal==='1',
      flConsentidoInstancia1: backendSujeto.flConsentidoInstancia1==='1',
      idActoTramiteResultadoSujeto: backendSujeto.idActoTramiteResultadoSujeto || '',

    };
  }

  private registrarDatosFormulario(): void {
    this.sujetosQueja = this.sujetosQueja.map((sujeto) => {
      const sujetoSeleccionado = this.sujetosQuejaSele.find(
        (sujetoSele) => sujetoSele.idSujetoCaso === sujeto.idSujetoCaso &&
        (!sujetoSele.hasOwnProperty('idActoTramiteResultadoSujeto') || sujetoSele.idActoTramiteResultadoSujeto === "" || sujeto.idActoTramiteResultadoSujeto === sujetoSele.idActoTramiteResultadoSujeto)
      );
      if (sujetoSeleccionado) {
        return { ...sujeto, estadoQueja: sujetoSeleccionado.estadoQueja, idPetitorioQueja: sujetoSeleccionado.idPetitorioQueja };
      }
      return sujeto;
    });
    this.habilitarGuardar(this.formularioValido);
    //  this.datosFormulario.emit(quejaDenegatoriaApelacion);
  }

  protected mostrarSujetos() {

    const refModal = this.dialogService.open(SujetosQuejaModalComponent, {
      width: '80%',
      showHeader: false,
      data: {
        coCaso: this.numeroCaso,
        sujetosQueja: this.sujetosQueja,
        soloLectura: this.deshabilitado ,
        idActoTramiteCaso: this.idActoTramiteCaso,
      },
    });

    refModal.onClose.subscribe((data) => {
      if (data) {
        this.sujetosQuejaSele = data;
        this.registrarDatosFormulario();
      }
    });
  }

  get iconButton(): string {
    return this.formularioValido ? 'success' : '';
  }

  public iconSVG(name: string): string {
    return `assets/icons/${name}.svg`;
  }
}
