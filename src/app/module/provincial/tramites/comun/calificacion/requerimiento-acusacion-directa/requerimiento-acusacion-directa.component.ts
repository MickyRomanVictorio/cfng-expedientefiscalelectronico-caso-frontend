
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { ValidacionTramite } from '@core/interfaces/comunes/crearTramite';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';
import { Subject, Subscription, firstValueFrom, takeUntil } from 'rxjs';
import { AsociarSujetosDelitosComponent } from '@core/components/reutilizable/asociar-sujetos-delitos/asociar-sujetos-delitos.component'
import { ESTADO_REGISTRO } from 'dist/ngx-cfng-core-lib';
import { Alerta } from '@core/interfaces/comunes/alerta';
import { TokenService } from '@core/services/shared/token.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { ID_ETAPA } from '@core/constants/menu';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AlertasTramiteComponent,
    AsociarSujetosDelitosComponent
  ],
  selector: 'app-requerimiento-acusacion-directa',
  templateUrl: './requerimiento-acusacion-directa.component.html',
  styleUrls: ['./requerimiento-acusacion-directa.component.scss'],
})
export class RequerimientoAcusacionDirectaComponent implements OnInit {

  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input() idActoTramiteCaso: string = '';
  @Input() validacionTramite!: ValidacionTramite;
  @Input() idEstadoTramite!: number;
  @Input() tramiteEnModoEdicion!: boolean;
  @Input() iniTramiteCreado: boolean = false;

  private readonly desuscribir$ = new Subject<void>();

  public alertas: AlertaFormulario[] = [];

  private readonly suscripciones: Subscription[] = [];
  protected seHanRegistradoAsociaciones: boolean = false

  protected tramiteService = inject(TramiteService);
  protected reusablesAlertas = inject(ReusablesAlertas);
  protected tokenService = inject(TokenService);
  protected alertaService = inject(AlertaService);

  get formularioValido(): boolean {
    return this.alertas.length === 0 && this.seHanRegistradoAsociaciones;
  }

  get tramiteEstadoFirmado(): boolean {
    return this.idEstadoTramite === ESTADO_REGISTRO.FIRMADO;
  }

  ngOnInit(): void {
    //resuleve las alertas del caso
    this.resolverAlertas();
    
    this.cargarAlertas();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((suscripcion) => suscripcion.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
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

  private async cargarAlertas(): Promise<void> {
    const validaciones = [
      this.reusablesAlertas.obtenerAlertaSujetosProcesalesDebidamenteRegistrados(this.idCaso),
      this.reusablesAlertas.obtenerAlertaFaltaTipificarDelito(this.idCaso),
    ];
    const resultados = await Promise.allSettled(
      validaciones.map((validacion) => firstValueFrom(validacion))
    );
    this.alertas = [...this.alertas, ...obtenerAlertasDeArchivo(resultados)];
    this.alSeleccionar()
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor;
  }

  protected establecerSiSeHanRegistradoAsociaciones(valor: boolean): void {
    this.seHanRegistradoAsociaciones = valor
    this.alSeleccionar()
  }

  public alSeleccionar(): void {
    this.formularioEditado(!this.formularioValido);
    this.habilitarGuardar(this.formularioValido);
  }

}
