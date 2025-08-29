import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DerivacionJPL } from '@interfaces/provincial/tramites/derivacion/derivacion-jpl.interface';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { DerivacionJuzgadoPazLetradoService } from '@services/provincial/tramites/derivacion-juzgado-paz-letrado.service';
import { MaestroService } from '@services/shared/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, Observable, of, Subject, Subscription, switchMap, takeUntil, throwError } from 'rxjs';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { TokenService } from '@core/services/shared/token.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { Alerta, AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { ID_ETAPA } from '@core/constants/menu';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
  ],
  selector: 'app-disposicion-derivacion-juzgado-paz-letrado',
  templateUrl: './disposicion-derivacion-juzgado-paz-letrado.component.html',
  styleUrls: ['./disposicion-derivacion-juzgado-paz-letrado.component.scss']
})
export class DisposicionDerivacionJuzgadoPazLetradoComponent implements OnInit {

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() etapa: string = '';
  @Input() idActoTramiteCaso!: string;
  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>();
  @Input() iniTramiteCreado: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null

  public refModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public datosDerivacionJpl: DerivacionJPL | null = null;
  public formularioDerivacion: FormGroup;
  public casoFiscal: CasoFiscal | null = null;
  private informacionDerivacionInicial: string = '';
  protected bloquearFormulario: boolean = false

  listaJuzgados: any[] = []

  private readonly desuscribir$ = new Subject<void>();

  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService);
  private readonly firmaIndividualService = inject(FirmaIndividualService);
  private readonly casoService = inject(Casos);

  constructor(private formulario: FormBuilder,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private tramiteService: TramiteService,
    private derivacionJpl: DerivacionJuzgadoPazLetradoService,
    private readonly tokenService: TokenService,
    private readonly alertaService: AlertaService) {
    this.formularioDerivacion = this.formulario.group({
      juzgado: [null]
    });
  }

  ngOnInit(): void {
    //resuleve las alertas del caso
    /**this.resolverAlertas();**/

    this.listarJuzgadosPazLetrado();
    this.obtenerFormulario();
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());

    this.formularioDerivacion.valueChanges.subscribe({
      next: () => {
        this.establecerBotonesTramiteSiCambio()
      }
    })

    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            /**this.registrarAlertas()**/
            setTimeout(() => {
              const request: AlertaGeneralRequestDTO = {
                idCaso: this.idCaso,
                numeroCaso: this.numeroCaso,
                idActoTramiteCaso: this.idActoTramiteCaso,
                codigoAlertaTramite: (CodigoAlertaTramiteEnum.AL_DE1),
                idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
                destino: CodigoDestinoAlertaTramiteEnum.PROV_ENTIDAD_DESPACHO_DERIVACION,
                data: []
              };
              this.registrarAlertas(request);
            }, 0);
            this.bloquearFormulario = true;
            this.formularioDerivacion.disable()
          }
        }
      )
    )
  }

  resolverAlertas() {
    if (this.iniTramiteCreado && (this.idEtapa==ID_ETAPA.CALIFICACION || this.idEtapa==ID_ETAPA.PRELIMINAR)) {
      this.solucionarAlerta();
    }
  }


  solucionarAlerta(): void {
    const alerta: Alerta = {
      codigoCaso: this.numeroCaso,
      codigoDespacho: this.tokenService.getDecoded().usuario.codDespacho,
      fechaCreacion: '',
      codigoUsuarioDestino: this.tokenService.getDecoded().usuario.usuario,
      texto: '',
      idAsignado: this.tokenService.getDecoded().usuario.usuario
    }
    this.alertaService
      .solucionarAlerta(alerta)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  registrarAlertas(request: AlertaGeneralRequestDTO): void {
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  get formularioValido(): boolean {
    return this.formularioDerivacion.get('juzgado')!.value != null;
  }

  listarJuzgadosPazLetrado() {
    this.spinner.show()
    this.maestroService.listarJuzgadosPazLetrado().subscribe({
      next: resp => {
        this.listaJuzgados = resp.data
        this.spinner.hide();
      },
      error: () => this.spinner.hide()
    })
  }

  eventoSeleccionarJuzgado(juzgado: number) {
    if (juzgado === null) this.datosDerivacionJpl = null;
    this.datosDerivacionJpl = {
      idJuzgadoPazLetrado: juzgado,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      /**codEntidadDestino: ,
      codDespachoDestino: **/
    };
  }

  public obtenerFormulario() {
    this.spinner.show();
    this.derivacionJpl.obtenerDerivacionJPL(this.etapa, this.idActoTramiteCaso).subscribe({
      next: resp => {
        this.spinner.hide();
        this.datosDerivacionJpl = resp;
        if (resp.idJuzgadoPazLetrado != null && resp.idJuzgadoPazLetrado != 0) {
          this.formularioDerivacion.patchValue({ juzgado: resp.idJuzgadoPazLetrado });
          this.informacionDerivacionInicial = JSON.stringify(this.formularioDerivacion.getRawValue())
          this.formularioEditado(false);
          this.obtenerDetalleActoTramiteCaso();
        }
      },
      error: () => { this.spinner.hide() }
    })
  }

  private obtenerDetalleActoTramiteCaso(): void {
    this.casoService.actoTramiteDetalleCaso(this.idActoTramiteCaso)
      .subscribe({
        next: (resp: any) => {
          if (resp.idEstadoTramite === ESTADO_REGISTRO.FIRMADO) {
            this.bloquearFormulario = true;
            this.formularioDerivacion.disable();
          }
        }
      })
  }

  private elFormularioHaCambiado(): boolean {
    return this.informacionDerivacionInicial != JSON.stringify(this.formularioDerivacion.getRawValue())
  }

  private habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  private guardarFormulario(): Observable<any> {
    if (!this.datosDerivacionJpl) {
      return of();
    }
    return this.derivacionJpl.guardarDerivacionJPL(this.etapa, this.datosDerivacionJpl, ).pipe(
      switchMap(_ => {
        this.tramiteService.formularioEditado = false;
        this.modalDialogService.success(
          'Datos guardados correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        )
        return of('válido')
      }),
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

  private establecerBotonesTramiteSiCambio(): void {
    const cambio = this.elFormularioHaCambiado()
    if (cambio) {
      this.formularioEditado(true)
      this.habilitarGuardar(true)
    } else if (this.formularioValido) {
      this.habilitarFirma()
    } else {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

}
