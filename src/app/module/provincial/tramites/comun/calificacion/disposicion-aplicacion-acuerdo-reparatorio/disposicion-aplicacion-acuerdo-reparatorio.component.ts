import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, Subscription, catchError, map, takeUntil, tap, throwError } from 'rxjs';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MenuModule } from 'primeng/menu';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DisposicionAplicacionPrincipioOportunidadService } from '@services/provincial/tramites/disposicion-aplicacion-principio.oportunidad.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { RegistroFechaCitacion } from '@core/interfaces/provincial/tramites/acta-acuerdo/registro-fecha-citacion.interface';
import { PrincipioOportunidadService } from '@core/services/provincial/tramites/comun/preparatoria/principio-oportunidad.service';
import dayjs from 'dayjs';
import { FirmaIndividualService } from '@core/services/firma-digital/firma-individual.service';
import { Alerta } from '@core/interfaces/comunes/alerta';
import { AlertaService } from '@core/services/shared/alerta.service';
import { TokenService } from '@core/services/shared/token.service';
import { ID_ETAPA } from '@core/constants/menu';
@Component({
  selector: 'app-disposicion-aplicacion-acuerdo-reparatorio',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    CheckboxModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    MenuModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
  ],
  providers: [MessageService, DialogService, NgxCfngCoreModalDialogService],
  templateUrl: './disposicion-aplicacion-acuerdo-reparatorio.component.html',
  styleUrls: ['./disposicion-aplicacion-acuerdo-reparatorio.component.scss']
})
export class DisposicionAplicacionAcuerdoReparatorioComponent implements OnInit {

  @Input() idCaso!: string;
  @Input() numeroCaso: string = '';
  @Input() idEtapa: string = '';//Id de la etapa
  @Input() idActoTramiteCaso!: string;
  @Input() tramiteSeleccionado!: TramiteProcesal;
  @Input() idEstadoTramite!: number;
  @Output() peticionParaEjecutar = new EventEmitter<() => any>();
  @Input() iniTramiteCreado: boolean = false;

  public subscriptions: Subscription[] = []
  public genericoFormulario!: FormGroup
  public cargandoInformacion: boolean = false;

  protected fechaMinimaCitacion: Date | null = null;

  private readonly desuscribir$ = new Subject<void>();

  constructor(
    protected tramiteService: TramiteService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    private readonly disposicionPrincipioOportunidadService: DisposicionAplicacionPrincipioOportunidadService,
    private readonly principioOportunidadService: PrincipioOportunidadService,
    private readonly formulario: FormBuilder,
    private readonly firmaIndividualService: FirmaIndividualService,
    private readonly tokenService: TokenService,
    private readonly alertaService: AlertaService,

  ) {
    this.inicializarFormularioRegistroCitacion();
    this.fechaMinimaCitacion = dayjs().toDate();
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }
  protected habilitarFirmar(valor: boolean) {
    this.tramiteService.habilitarFirmar = valor
  }

  ngOnInit(): void {
    //resuleve las alertas del caso
    this.resolverAlertas();

    this.obtenerInformacion();

    this.peticionParaEjecutar.emit(() => this.guardarFormulario());

    this.genericoFormulario.get('fechaCitacion')?.valueChanges.subscribe(value => {
      if (!this.cargandoInformacion) {
        this.formularioEditado(true)
        this.habilitarGuardar(value !== null)
      }
    });

    this.subscriptions.push(
      this.firmaIndividualService.esFirmadoCompartidoObservable.subscribe(
        (respuesta: any) => {
          if (respuesta.esFirmado) {
            this.genericoFormulario.disable()
          }
        }
      )
    )

    if(this.tramiteService.tramiteEnModoVisor){
      this.genericoFormulario.disable()
      this.habilitarFirmar(false)
    }
  }

  resolverAlertas() {
    if (this.iniTramiteCreado && (this.idEtapa==ID_ETAPA.CALIFICACION || this.idEtapa==ID_ETAPA.PRELIMINAR)) {
      this.solucionarAlerta();
    }
  }

  solucionarAlerta(): void {
    console.log('numeroCaso = ', this.numeroCaso);
    console.log('codDespacho = ', this.tokenService.getDecoded().usuario.codDespacho);
    console.log('usuario = ', this.tokenService.getDecoded().usuario.usuario);

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
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((e) => e.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  private inicializarFormularioRegistroCitacion(): void {
    this.genericoFormulario = this.formulario.group({
      fechaCitacion: [null, [Validators.required]]
    })
  }

  protected guardarFormulario(): Observable<any> {
    const request: RegistroFechaCitacion = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      fechaCitacion: this.genericoFormulario.value.fechaCitacion
    }

    return this.disposicionPrincipioOportunidadService.actualizarFechaCitacion(request)
      .pipe(
        tap(() => {
          this.modalDialogService.success(
            'Exito',
            'Se guardo correctamente la información del trámite ' + this.tramiteSeleccionado?.nombreTramite,
            'Ok'
          );
          this.formularioEditado(false)
          this.habilitarGuardar(false)
        }),
        map(() => 'válido'),
        catchError(() => {
          this.modalDialogService.error(
            'Error',
            'No se pudo guardar la información del trámite ' + this.tramiteSeleccionado.nombreTramite,
            'Ok'
          );
          return throwError(() => new Error('Error al guardar'));
        })
      );
  }

  obtenerInformacion() {
    this.cargandoInformacion = true;
    this.principioOportunidadService.obtenerDisposicionProvidencia(this.idActoTramiteCaso).subscribe({
      next: resp => {
        if (resp != undefined && resp != null) {
          if (resp?.fechaCitacion != null) {
            this.formularioEditado(false);
            this.genericoFormulario.get('fechaCitacion')?.setValue(this.convertStringToDate(resp.fechaCitacion));
          }
        }
        this.cargandoInformacion = false;
      },
      error: error => {
        this.cargandoInformacion = false;
        this.modalDialogService.error("Error", `Se ha producido un error al intentar recuperar la información de disposición de aplicación`, 'Ok');
      }
    })
  }

  convertStringToDate(dateString: string | null): Date | null {
    return dateString ? dayjs(dateString).toDate() : null;
  }
}
