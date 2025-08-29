import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { RegistrarPlazoRequest } from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import { DiligenciaPreliminar } from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import { FilterComponent } from '@components/generales/filter/filter.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription, firstValueFrom } from 'rxjs';
// import {StorageService} from "@services/shared/storage.service";
import { IniciarDiligenciaPreliminarService } from '@services/provincial/tramites/iniciar-diligencia-preliminar.service';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { PlazoAmpliacionComponent } from '@components/modals/acto-procesal/asignar-plazo/plazo-ampliacion/plazo-ampliacion.component';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';

@Component({
  standalone: true,
  selector: 'app-gestionar-disposicion-inv-preparatoria',
  templateUrl: './gestionar-disposicion-inv-preparatoria.component.html',
  styleUrls: ['./gestionar-disposicion-inv-preparatoria.component.scss'],
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
    FilterComponent,
    AlertasTramiteComponent,
  ],
  providers: [MessageService, DialogService],
})
export class GestionarDisposicionInvPreparatoriaComponent implements OnInit {
  @Input() idCaso: string = '';
  @Input() etapa: string = '';
  @Input() idEtapa: string = '';
  @Input() esNuevo: boolean = false;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
      this.esNuevo && this.alSeleccionar();
      !this.esNuevo && this.obtenerFormulario();
    }
  }

  @Input() deshabilitado: boolean = false;

  @Output() datosFormulario = new EventEmitter<any>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  public refModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  public alertas: AlertaFormulario[] = [];
  private _idActoTramiteCaso: string = '';
  public casoFiscal: CasoFiscal | null = null;
  public plazoRequest: RegistrarPlazoRequest | null = null;
  public esCasoReservado: boolean = false;
  public datosDiligencia: DiligenciaPreliminar | null = null;
  public nombreEtapa: string = '';

  constructor(
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    // private storageService: StorageService,
    private reusablesAlertas: ReusablesAlertas,
    private diligenciasService: IniciarDiligenciaPreliminarService
  ) {}

  ngOnInit(): void {
    //TODO this.casoFiscal = JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
    this.obtenerAlertas();
    this.peticionParaEjecutar.emit((datos: any) =>
      this.diligenciasService.procesarDiligenciaPreliminar(datos)
    );
    /*this.dialogService.open( AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `ATENCIÓN`,
        description: `¿Los sujetos procesales y la tipifación del delito están correctamente registrados?. En caso requiera verificar ir a la sección de <span class='bold'>hechos del caso,</span> de lo contrario continúe con el trámite.`,
        confirmButtonText: 'Continuar',
        irHechoCasoButtonText: 'Ir a hechos del caso',
        confirmHechosCasos: true,
      }
    } as DynamicDialogConfig<AlertaData>).onClose.subscribe({
      next: resp => {
        console.log("resp " ,resp)
        if (resp === 'confirm') {
          //this.inicializarFormulario();
        }
      }
    })*/
  }

  get formularioValido(): boolean {
    return (
      this.alertas?.length === 0 &&
      this.plazoRequest !== undefined &&
      this.plazoRequest !== null
    );
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso;
  }

  get iconButton(): string {
    return this.idActoTramiteCaso
      ? 'success'
      : this.formularioValido
      ? 'success'
      : 'error';
  }

  private async obtenerAlertas(): Promise<void> {
    const validaciones = [
      this.reusablesAlertas.obtenerAlertaSujetosProcesalesDebidamenteRegistrados(
        this.idCaso
      ),
    ];

    const resultados = await Promise.allSettled(
      validaciones.map((validacion) => firstValueFrom(validacion))
    );
    this.alertas = [...this.alertas, ...obtenerAlertasDeArchivo(resultados)];
  }

  public alSeleccionar(): void {
    this.datosDiligencia = {
      plazosRequest: this.plazoRequest!,
      flCasoReservado: this.esCasoReservado,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
    };
    this.datosFormulario.emit(this.datosDiligencia);
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public mostrarModal(): void {
    const ref = this.dialogService.open(PlazoAmpliacionComponent, {
      width: '50%',
      contentStyle: { 'overflow-y': 'auto', padding: '1.5vw' },
      baseZIndex: 10000,
      showHeader: false,
      data: {
        idCaso: this.idCaso,
        calificarCaso: this.casoFiscal,
        idTramite: this.tramiteSeleccionado!.idTramite,
        idActoProcesal: this.tramiteSeleccionado!.idActoTramiteConfigura,
        plazos: this.datosDiligencia?.plazosRequest,
      },
    });

    ref.onClose.subscribe((data) => {
      console.log('data form al cerrar', data);
      this.plazoRequest = data;
      this.alSeleccionar();
    });
  }

  public obtenerFormulario() {
    this.spinner.show();
    this.subscriptions.push(
      this.diligenciasService
        .obtenerDiligenciaPreliminar(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            if (resp != undefined && resp != null) {
              this.datosDiligencia = resp;
              this.esCasoReservado = this.datosDiligencia!.flCasoReservado;
              this.plazoRequest = this.datosDiligencia!.plazosRequest;
              this.datosFormulario.emit(this.datosDiligencia);
            }
          },
          error: (error) => {
            console.error(error);
            this.spinner.hide();
          },
        })
    );
  }
}
