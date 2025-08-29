import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MedidasCoercionComponent } from '@core/components/modals/medidas-coercion/medidas-coercion.component';
import { CatalogoInterface } from '@core/interfaces/comunes/catalogo-interface';
import {
  GenericResponseList,
} from '@core/interfaces/comunes/GenericResponse';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { MaestroService } from '@core/services/shared/maestro.service';
import { NO_GRUPO_CATALOGO } from '@core/types/grupo-catalago';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  catchError,
  map,
  Observable,
  Subject,
  Subscription,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { icono } from 'dist/ngx-cfng-core-lib';
import {
  RequerimientoIncoacionProcesoInmediato,
  SupuestosRequest,
} from '@core/interfaces/provincial/tramites/comun/calificacion/requerimiento-incoacion/registrar-requerimiento.interface';
import { RequerimientoIncoacionService } from '@core/services/provincial/tramites/comun/calificacion/requerimiento-incoacion/requerimiento-incoacion.service';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { NgxCfngCoreModalDialogService } from '@ngx-cfng-core-modal/dialog';
import { CmpLibModule } from 'dist/cmp-lib';
import { capitalizedFirstWord } from '@core/utils/string';
import { TokenService } from '@core/services/shared/token.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { Alerta } from '@core/interfaces/comunes/alerta';
import { ID_ETAPA } from '@core/constants/menu';

@Component({
  selector: 'app-requerimiento-incoacion-proceso-inmediato',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    ButtonModule,
    MultiSelectModule,
  ],
  providers: [DialogService, NgxCfngCoreModalDialogService],
  templateUrl: './requerimiento-incoacion-proceso-inmediato.component.html',
  styleUrl: './requerimiento-incoacion-proceso-inmediato.component.scss',
})
export class RequerimientoIncoacionProcesoInmediatoComponent {

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() etapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso!: string;
  @Input() iniTramiteCreado: boolean = false;

  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>();

  protected subscriptions: Subscription[] = [];
  protected listaSupuestos: CatalogoInterface[] = [];
  protected supuestoSeleccionados: CatalogoInterface[] = [];
  protected esMedidaCoercionCorrecta: boolean = false;
  protected esSupuestoCorrecto: boolean = false;
  protected supuestoSeleccionadosIniciales: any[] = [];
  protected datosForm: RequerimientoIncoacionProcesoInmediato | null = null;

  private readonly desuscribir$ = new Subject<void>();

  constructor(
    protected fb: FormBuilder,
    protected maestrosService: MaestroService,
    protected requerimientoIncoacionService: RequerimientoIncoacionService,
    private readonly tramiteService: TramiteService,
    protected readonly modalDialogService: NgxCfngCoreModalDialogService,
    protected dialogService: DialogService,
    private readonly tokenService: TokenService,
    private readonly alertaService: AlertaService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    //resuleve las alertas del caso
    this.resolverAlertas();

    await this.obtenerSupuestos();
    this.obtenerFormulario();
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());
    if (this.tramiteEnModoVisor) {
      this.habilitarFirmar(false);
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

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }

  protected habilitarFirmar(valor: boolean) {
    this.tramiteService.habilitarFirmar = valor
  }

  protected get tramiteEnModoVisor(): boolean {
    return this.tramiteService.tramiteEnModoVisor;
  }

  protected nombreTramite(): string {
    return capitalizedFirstWord(this.tramiteSeleccionado?.nombreTramite)
  }

  protected guardarFormulario(): Observable<any> {
    const idsSeleccionados = this.supuestoSeleccionados.map(
      (supuesto) => supuesto.id
    );

    let request: SupuestosRequest = {
      idActoTramiteCaso: this.idActoTramiteCaso,
      supuestos: idsSeleccionados,
    };

    return this.requerimientoIncoacionService.guardarSupuestos(request).pipe(
      tap(() => {
        this.formularioEditado(false)
        this.supuestoSeleccionadosIniciales = [...this.supuestoSeleccionados];
        this.modalDialogService.success(
          'Datos guardado correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.nombreTramite() + '</b>.',
          'Aceptar'
        );
      }),
      map(() => 'válido'),
      catchError(() => {
        this.modalDialogService.error(
          'Error',
          'No se pudo guardar la información para el trámite: <b>' + this.nombreTramite() + '</b>.',
          'Aceptar'
        );
        return throwError(() => new Error('Error al guardar'));
      })
    );
  }

  protected obtenerFormulario() {
    this.subscriptions.push(
      this.requerimientoIncoacionService
        .listarSupuestos(this.idActoTramiteCaso)
        .subscribe({
          next: (resp: GenericResponseList<any>) => {
            if (resp.code === 200 && resp.data.length > 0) {
              resp.data.forEach((r: any) => {
                const supuesto = this.listaSupuestos.find((s) => s.id === r.ID_N_SUPUESTO_APLIC);
                if (supuesto && !this.supuestoSeleccionados.includes(supuesto)) {
                  this.supuestoSeleccionados.push(supuesto);
                }
              });
              this.supuestoSeleccionadosIniciales = [...this.supuestoSeleccionados];
              this.esSupuestoCorrecto = true;

              this.obtenerValidacionDeMedidas().then(() => {
                this.formularioEditado(!this.esMedidaCoercionCorrecta);
              });

            } else {
              this.esSupuestoCorrecto = false;
              this.formularioEditado(true);
              this.habilitarGuardar(false);
              this.obtenerValidacionDeMedidas();
            }
          },
          error: () => {
            this.modalDialogService.error(
              'Error',
              'No se pudo obtener los supuestos',
              'Aceptar'
            );
          },
        })
    );
  }


  protected abrirModalMedidasCoercion() {
    const modal = this.dialogService.open(MedidasCoercionComponent, {
      showHeader: false,
      style: {
        width: '70%',
        'max-width': '955px',
        margin: 'auto',
        position: 'fixed',
      },
      data: {
        idCaso: this.idCaso,
        etapa: this.etapa,
        idActoTramiteCaso: this.idActoTramiteCaso,
        modoLectura: this.tramiteEnModoVisor
      },
    });
    modal.onClose.subscribe(async (resultado: boolean) => {
      await this.obtenerValidacionDeMedidas();
      if (this.supuestoSeleccionadosIniciales.length > 0) {
        this.formularioEditado(resultado);
      }
      else {
        this.formularioEditado(true);
      }
      const formularioCompleto = this.esMedidaCoercionCorrecta && this.esSupuestoCorrecto;
      this.habilitarGuardar(formularioCompleto);
    });
  }

  protected obtenerValidacionDeMedidas(): Promise<void> {
    this.esMedidaCoercionCorrecta = false
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.requerimientoIncoacionService
          .validarMedidas(this.idCaso, this.idActoTramiteCaso)
          .subscribe({
            next: (resp: any) => {
              this.esMedidaCoercionCorrecta = resp.code === 200 && resp.data === '1';
              resolve();
            },
            error: (err) => {
              this.modalDialogService.error(
                'Error',
                'Se ha producido un error al intentar validar las medidas de coerción con los sujetos',
                'Aceptar'
              );
              reject(new Error(err));
            },
          })
      );
    });
  }

  protected verificarSupuestos() {
    this.esSupuestoCorrecto = this.supuestoSeleccionados.length > 0;
    if (this.supuestoSeleccionadosIniciales.length > 0) {
      const cambio = !this.sonIguales(this.supuestoSeleccionadosIniciales, this.supuestoSeleccionados);
      if (cambio) {
        this.formularioEditado(true);
        this.habilitarGuardar(this.esSupuestoCorrecto && this.esMedidaCoercionCorrecta);
        return;
      }
      this.formularioEditado(!this.esSupuestoCorrecto || !this.esMedidaCoercionCorrecta);
      this.habilitarGuardar(this.esSupuestoCorrecto && this.esMedidaCoercionCorrecta);
      return;
    }

    this.formularioEditado(true);
    this.habilitarGuardar(this.esSupuestoCorrecto && this.esMedidaCoercionCorrecta);
  }



  protected obtenerSupuestos(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.subscriptions.push(
        this.maestrosService
          .obtenerCatalogo(NO_GRUPO_CATALOGO.SUPUESTO_APLIC)
          .subscribe({
            next: (resp: GenericResponseList<CatalogoInterface>) => {
              this.listaSupuestos = resp.data;
              resolve();
            },
            error: (err) => {
              this.modalDialogService.error(
                'Error',
                'Se ha producido un error al obtener los supuestos',
                'Aceptar'
              );
              reject(new Error(err));
            },
          })
      );
    });
  }

  protected icono(name: string): string {
    return icono(name);
  }

  protected sonIguales(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].noDescripcion !== arr2[i].noDescripcion) {
        return false;
      }
    }

    return true;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }
}
