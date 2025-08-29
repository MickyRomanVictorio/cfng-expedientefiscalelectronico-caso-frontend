import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { ConclusionInvestigacion } from '@core/interfaces/comunes/conclusion-investigacion.interface';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { RegistrarPlazoRequest } from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import { ConclusionInvestigacionService } from '@services/provincial/tramites/comun/preparatoria/conclusion-investigacion.service';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import {
  DialogService,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { Observable, Subject, Subscription, catchError, firstValueFrom, map, takeUntil, tap, throwError } from 'rxjs';
import { Expediente } from '@core/utils/expediente';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { FirmaIndividualService } from '@services/firma-digital/firma-individual.service';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { ESTADO_REGISTRO, IconAsset } from 'dist/ngx-cfng-core-lib';
import { CodigoAlertaTramiteEnum, CodigoDestinoAlertaTramiteEnum, TipoOrigenAlertaTramiteEnum } from '@core/constants/constants';
import { AlertaGeneralRequestDTO } from '@core/interfaces/comunes/alerta';
import { AlertaService } from '@core/services/shared/alerta.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conclusion-investigacion',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    AlertasTramiteComponent,
  ],
  providers: [MessageService, DialogService],
  templateUrl: './conclusion-investigacion.component.html',
  styleUrls: ['./conclusion-investigacion.component.scss'],
})
export class ConclusionInvestigacionComponent implements OnInit {

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso!: string;
  @Input() idEstadoTramite!: number;
  @Input() deshabilitado: boolean = false;
  @Output() peticionParaEjecutar = new EventEmitter<() => Observable<any>>();

  public subscriptions: Subscription[] = [];
  public alertas: AlertaFormulario[] = [];
  public casoFiscal: Expediente | null = null;
  public plazoRequest: RegistrarPlazoRequest | null = null;
  public conclusionData: ConclusionInvestigacion | null = null;
  private readonly desuscribir$ = new Subject<void>();
  private informacionCasoInicial: string = '';

  protected iconAsset = inject(IconAsset)
  private readonly router = inject(Router)
  private readonly dialogService = inject(DialogService)
  private readonly tramiteService = inject(TramiteService)
  private readonly reusablesAlertas = inject(ReusablesAlertas)
  private readonly gestionCasoService = inject(GestionCasoService)
  private readonly firmaIndividualService = inject(FirmaIndividualService)
  private readonly modalDialogService = inject(NgxCfngCoreModalDialogService)
  private readonly conclusionInvestigacionService = inject(ConclusionInvestigacionService)
  private readonly alertaService = inject(AlertaService)

  get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  ngOnInit(): void {
    this.peticionParaEjecutar.emit(() => this.guardarFormulario());
    this.cargarAlertas();
    this.getCasoFiscal();
    this.firmaRealizada();
  }

  private getCasoFiscal(): void {
    this.casoFiscal = this.gestionCasoService.expedienteActual;
  }

  protected firmaRealizada(): void {
    this.firmaIndividualService.esFirmadoCompartidoObservable
        .pipe(takeUntil(this.desuscribir$))
        .subscribe((respuesta: any) => {
            if (respuesta.esFirmado) {
              this.registrarAlertas();
            }
          });
  }

  private guardarFormulario(): Observable<any> {
    const plazosRequest = this.conclusionData?.plazosRequest;
    const nroPlazo = plazosRequest?.nroPlazo;

    if (!plazosRequest || nroPlazo === 0) {
      this.modalDialogService.error(
        'Plazo',
        'Debe asignar un plazo.',
        'Aceptar'
      );
      return throwError(() => new Error('Falta completar los datos del causal'));
    }

    if (!this.conclusionData) {
      return throwError(() => new Error('Falta completar los datos de la diligencia'));
    }

    return this.conclusionInvestigacionService.guardarConclusionInvetigacion(this.idActoTramiteCaso, this.conclusionData).pipe(
      tap(() => {
        this.modalDialogService.success(
          'Datos guardados correctamente',
          'Se guardaron correctamente los datos para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        );
        this.informacionCasoInicial = JSON.stringify(this.conclusionData)
        this.habilitarFirma()
      }),
      map(() => 'válido'),
      catchError(() => {
        this.modalDialogService.error(
          'Error',
          'No se pudo guardar la información para el trámite: <b>' + this.tramiteSeleccionado?.nombreTramite + '</b>.',
          'Aceptar'
        )
        return throwError(() => new Error('Error al guardar'))
      })
    )
  }

  public habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  ngOnDestroy(): void {
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  private async cargarAlertas(): Promise<void> {
    const validaciones = [
      this.reusablesAlertas.obtenerAlertaSujetosProcesalesDebidamenteRegistrados(this.idCaso),
      this.reusablesAlertas.obtenerAlertaFaltaTipificarDelito(this.idCaso),
    ];
    const resultados = await Promise.allSettled(
      validaciones.map((validacion) => firstValueFrom(validacion))
    );

    this.alertas = [...this.alertas, ...obtenerAlertasDeArchivo(resultados)];
    this.obtenerFormulario();
  }

  get formularioValido(): boolean {
    const { nroPlazo } = this.plazoRequest ?? {};
    return this.alertas?.length === 0 && nroPlazo! > 0;
  }

  get plazoRequestValido(): boolean {
    return this.plazoRequest != undefined && this.plazoRequest != null;
  }

  public alSeleccionar(): void {
    this.conclusionData = {
      plazosRequest: this.plazoRequest!,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
    };
    this.establecerBotonesTramiteSiCambio()
  }

  protected elFormularioHaCambiado(): boolean {
    return this.informacionCasoInicial !== JSON.stringify(this.conclusionData)
  }

  private establecerBotonesTramiteSiCambio(): void {
    const cambio = this.elFormularioHaCambiado()
    if ( cambio ) {
      this.formularioEditado(true)
      this.habilitarGuardar(this.formularioValido)
    } else if ( this.formularioValido) {
       this.habilitarFirma()
    } else {
      this.formularioEditado(true)
      this.habilitarGuardar(false)
    }
  }

  public mostrarModal(): void {
    const ref = this.dialogService.open(RegistrarPlazoComponent, {
      showHeader: false,
      width: '60rem',
      data: {
        idCaso: this.idCaso,
        calificarCaso: this.casoFiscal,
        idTramite: this.tramiteSeleccionado!.idTramite,
        idActoProcesal: this.tramiteSeleccionado!.idActoTramiteConfigura,
        plazos: this.conclusionData?.plazosRequest,
      },
    });

    ref.onClose.subscribe((data) => {
      this.plazoRequest = data;
      this.alSeleccionar();
    });
  }

  public obtenerFormulario() {
    this.subscriptions.push(
      this.conclusionInvestigacionService
        .obtenerConclusionInvetigacion(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (resp) {
              this.conclusionData = resp;
              this.informacionCasoInicial = JSON.stringify(resp);
              this.plazoRequest = this.conclusionData!.plazosRequest;
              this.plazoRequest.esEditado = false;
              this.formularioEditado(this.conclusionData?.plazosRequest == null || !this.formularioValido);
              this.habilitarGuardar(this.formularioValido);
            }
          },
          error: (error) => {
            this.modalDialogService.error("Error en el servicio",error.error.messagge,'Acpetar');
          },
        })
    );
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  private registrarAlertas(): void {
    const request: AlertaGeneralRequestDTO = {
      idCaso: this.idCaso,
      numeroCaso: this.numeroCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      codigoAlertaTramite: CodigoAlertaTramiteEnum.AL_DC,
      idTipoOrigen: TipoOrigenAlertaTramiteEnum.EFE,
      destino: CodigoDestinoAlertaTramiteEnum.PROV_FISCAL_ASIGNADO
    };
    this.alertaService
      .generarAlertaTramite(request)
      .pipe(takeUntil(this.desuscribir$))
      .subscribe();
  }

}
