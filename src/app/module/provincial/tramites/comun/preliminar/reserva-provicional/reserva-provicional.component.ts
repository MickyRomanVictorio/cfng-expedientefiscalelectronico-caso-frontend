import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { validOnlyNumbers } from '@utils/utils';
import { BehaviorSubject, catchError, map, Observable, Subject, takeUntil, tap, throwError } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { ReservaProvisional } from '@interfaces/provincial/tramites/comun/preliminar/reserva-provisional.interface';
import { ReservaProvicionalService } from '@services/provincial/tramites/reserva-provicional.service';
import { DateUtil, ESTADO_REGISTRO } from 'ngx-cfng-core-lib';
import { ChangeDetectorRef } from '@angular/core';
import { Plazo } from '@core/interfaces/comunes/casosFiscales';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { Expediente } from '@core/utils/expediente';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants';
import { AlertaService } from '@core/services/shared/alerta.service';

@Component({
  selector: 'app-reserva-provicional',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reserva-provicional.component.html',
  styleUrls: ['./reserva-provicional.component.scss'],
})
export class ReservaProvicionalComponent implements OnInit {
  public dias: number = 0;
  public fecha!: string;
  @Output() fechaFinCalculada = new EventEmitter<string>();
  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idEstadoTramite!: number;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() deshabilitado: boolean = false;
  @Input() iniTramiteCreado: boolean = false;
  @Input() numeroCaso: string = '';

  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
      this.esNuevo && this.alSeleccionar();//ES NUEVO - ejecuta (alSeleccionar)
      !this.esNuevo && this.obtenerFormulario();//NO ES NUEVO - ejecuta (obtenerFormulario)
    }
  }

  private _idActoTramiteCaso: string = '';
  public datosForm!: ReservaProvisional;
  private suscripciones: Subscription[] = [];

  @Output() datosFormulario = new EventEmitter<Object>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Output() ocultarTitulo = new EventEmitter<boolean>();
  @Output() ocultarBotonTramite = new EventEmitter<boolean>();

  public casoFiscal: CasoFiscal | null = null;

  public caso!: Expediente;
  public casoPlazoNivelT!: Plazo[] | any[];

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  protected readonly firmaIndividualService = inject(FirmaIndividualService);
  private readonly alertaService = inject(AlertaService)

  private readonly desuscribir$ = new Subject<void>()

  constructor(
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    // private storageService: StorageService, TODO
    private reservaProvisionalService: ReservaProvicionalService,
    protected tramiteService: TramiteService,
    private readonly gestionCasoService: GestionCasoService,
    protected dateUtil: DateUtil,
    private cdr: ChangeDetectorRef
  ) {

    this.tramiteService.data$.subscribe((value: any) => {
      this.casoPlazoNivelT = value;
    });

  }

  get formularioValido(): boolean {
    return this.dias !== undefined && this.dias !== null && this.dias > 0;
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  ngOnInit(): void {
    console.log('iniTramiteCreado = ', this.iniTramiteCreado);
    console.log('numeroCaso = ', this.numeroCaso);

    console.log('etapa=>', this.etapa);
    this.caso = this.gestionCasoService.casoActual;
    // TODO this.casoFiscal = JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
    this.peticionParaEjecutar.emit(() =>
      /**this.reservaProvisionalService.guardarReservaProvisional(
        this.etapa,
        this.datosForm
      )**/
      this.guardarFormulario()
    );
    this.hasFlagNivelT();

    //Consecuencia de la firma:
    this.firmaIndividualService.esFirmadoCompartidoObservable
      .pipe(takeUntil(this.desuscribir$))
      .subscribe((respuesta: any) => {
        console.log('respuesta.esFirmado = ', respuesta.esFirmado)
        if (respuesta.esFirmado) {
          this.registrarAlertas()
          //this.bloquearFormulario = true
        }
      })
  }

  private guardarFormulario(): Observable<any> {
    return this.reservaProvisionalService.guardarReservaProvisional(this.etapa, this.datosForm).pipe(
      tap(() => {
        //if (this.formularioValido) {
          this.habilitarFirma();
        //}
      }),
      map(() => 'válido'),
      catchError(() => {
        this.modalDialogService.error(
          'Error',
          'No se pudo guardar la información para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        );
        return throwError(() => new Error('Error al guardar.'));
      })
    );
  }

  public habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  ngOnDestroy(): void {
    this.ocultarTitulo.emit(false);
    this.ocultarBotonTramite.emit(false);
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
  }

  private hasFlagNivelT() {
    console.log('entro hasFlagNivelT');
    console.log('caso = ', this.caso)
    this.casoPlazoNivelT = this.caso.plazos.filter(
      (plazo: any) => 
        plazo.flgNivel === 'T'
    );
    console.log('casoPlazoNivelT = ', this.casoPlazoNivelT);
    setTimeout(() => {
      this.cdr.detectChanges();
    })
  }

  public alSeleccionar(): void {
    this.dias = Number(this.dias.toString().replace(/^0+/, ''));
    if (this.dias === 0) {
      this.dias = 0;
    }

    console.log('dias = ', this.dias)

    this.datosForm = {
      plazo: this.dias,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
    };

    console.log('datosForm = ', this.datosForm)

    this.formularioEditado(true)
    this.habilitarGuardar(this.dias > 0);

    this.datosFormulario.emit(this.datosForm);
  }

  public obtenerFormulario() {
    console.log('-->', this.casoFiscal);
    this.spinner.show();
    this.suscripciones.push(
      this.reservaProvisionalService
        .obtenerReservaProvisional(this.etapa, this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            if (resp != undefined && resp != null) {
              this.datosForm = resp;
              this.dias = resp.plazo;
              this.validarEstadoRegistro();
              this.fecha =
                this.casoFiscal!?.idEstadoRegistro != ESTADO_REGISTRO.FIRMADO
                  ? null
                  : resp.fechaFinCalculada;
              this.datosFormulario.emit(this.datosForm);
              setTimeout(() => {
                this.cdr.detectChanges();
              })
            }
          },
          error: () => {
            this.spinner.hide();
          },
        })
    );
  }

  private validarEstadoRegistro(): void {
    if (
      this.casoFiscal?.idEstadoRegistro === ESTADO_REGISTRO.PENDIENTE_COMPLETAR
    ) {
      console.log(
        'El estado del registro está pendiente. Ejecutar lógica adicional.'
      );
    }
  }

  public validOnlyNumbers(event: KeyboardEvent): boolean {
    const valor = this.dias !== null && this.dias !== undefined ? this.dias.toString() : '';

    if (valor === '' && event.key === '0') {
      return true;
    }

    if (valor === '0' && event.key === '0') {
      event.preventDefault();
      return false;
    }

    // Permitir solo teclas numéricas
    const regex = /^[0-9]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  public preventPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    // Validar que solo contenga números
    const regex = /^[0-9]*$/;
    if (!regex.test(pastedText)) {
      event.preventDefault();
    }
  }

  //Funcion que llama a alertas
  protected registrarAlertas(): void {
    const request: AlertaGeneralRequestDTO = {
      idCaso: this.idCaso,
      numeroCaso: this.caso.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_RP,
      idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
      destino: CodigoDestinoAlertaTramiteEnum.PROV_FISCAL_ASIGNADO
    }
    console.log('entro registrarAlertas');
    console.log('request = ', request)
    this.alertaService.generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }


}
