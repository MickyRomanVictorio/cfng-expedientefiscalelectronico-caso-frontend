import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DesagregarCasoModalComponent } from '@components/modals/desagregar-caso-modal/desagregar-caso-modal.component';
import { ID_ETAPA } from '@core/constants/menu';
import { Alerta } from '@core/interfaces/comunes/alerta';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';
import { AlertaService } from '@core/services/shared/alerta.service';
import { TokenService } from '@core/services/shared/token.service';
import { GruposDesagregadosRequest } from '@interfaces/provincial/administracion-casos/desagregar/GruposDesagregadosRequest';
import { DesagregarCasoService } from '@services/provincial/desagregar/desagregar-caso.service';
import { icono } from 'dist/ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    CmpLibModule,
    CheckboxModule,
    ButtonModule,
  ],
  selector: 'app-desagregar-caso',
  templateUrl: './desagregar-caso.component.html',
  styleUrls: ['./desagregar-caso.component.scss'],
  providers: [DialogService],
})
export class DesagregarCasoComponent implements OnInit, OnDestroy {
  @Input() idCaso: string = '';
  @Input() numeroCaso: string = '';
  @Input() idEtapa: string = '';
  @Input() esNuevo: boolean = false;
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
      this.esNuevo && this.alSeleccionarDesagregarCaso();
    }
  }
  @Output() datosFormulario = new EventEmitter<Object>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();
  @Input() iniTramiteCreado: boolean = false;

  private _idActoTramiteCaso: string = '';
  private gruposDesagregadosRequest: GruposDesagregadosRequest[] = [];
  public desagregarCasoCargado: boolean = false;

  private readonly desuscribir$ = new Subject<void>();

  constructor(
    private readonly dialogService: DialogService,
    protected tramiteService: TramiteService,
    private readonly desagregarCasoService: DesagregarCasoService,
    private readonly tokenService: TokenService,
    private readonly alertaService: AlertaService,
  ) { }

  public subscriptions: Subscription[] = [];

  ngOnInit(): void {
    //resuleve las alertas del caso
    this.resolverAlertas();

    this.habilitarGuardar(false);
    this.peticionParaEjecutar.emit((datos: any) => {
      this.desagregarCasoService.confirmarDesagregarCaso(datos);
    });
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
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.desuscribir$.next();
    this.desuscribir$.complete();
  }

  public alSeleccionarDesagregarCaso() {
    this.datosFormulario.emit(this.gruposDesagregadosRequest);
  }

  public cargarModalDesagregarCaso() {
    const verDesagregarCasoRef = this.dialogService.open(
      DesagregarCasoModalComponent,
      {
        width: '90%',
        showHeader: false,
        data: {
          numeroCaso: this.numeroCaso,
          idCaso: this.idCaso,
          idActoTramiteCaso: this._idActoTramiteCaso,
        },
      }
    );
    verDesagregarCasoRef.onClose.subscribe((datosRequest) => {
      if (datosRequest !== undefined) {
        this.gruposDesagregadosRequest = datosRequest;
        this.validarDesagregarCaso();
        this.alSeleccionarDesagregarCaso();
      }
    });
  }

  // public icono(nombre: string): any {
  //   return obtenerIcono(nombre);
  // }

  public icono(name: string): string {
    return icono(name);
  }

  get formularioValido(): boolean {
    return this.validarDesagregarCaso();
  }

  private validarDesagregarCaso(): boolean {
    for (const grupo of this.gruposDesagregadosRequest) {
      if (grupo.nombreGrupo === 'Grupo 2') {
        const tamanioDelitosGrupo2 = grupo.delitos.length;
        if (tamanioDelitosGrupo2 > 0) {
          this.desagregarCasoCargado = true;
          this.formularioEditado(false);
          return true;
        }
      }
    }
    return false;
  }

  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor;
  }

  private habilitarGuardar(estado: boolean) {
    this.tramiteService.habilitarGuardar = estado;
  }
}
