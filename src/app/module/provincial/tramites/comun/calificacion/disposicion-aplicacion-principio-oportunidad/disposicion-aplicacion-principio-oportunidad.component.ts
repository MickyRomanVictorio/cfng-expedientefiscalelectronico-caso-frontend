import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, firstValueFrom } from 'rxjs';
import { AlertaFormulario } from '@core/interfaces/comunes/alerta-formulario.interface';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RegistrarPlazoRequest } from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReusablesAlertas } from '@services/reusables/reusable-alertas.service';
import { DiligenciaPreliminar } from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterComponent } from '@components/generales/filter/filter.component';
import { MessageService } from 'primeng/api';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import { obtenerAlertasDeArchivo } from '@utils/validacion-tramites';

import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { DisposicionAplicacionPrincipioOportunidadService } from '@services/provincial/tramites/disposicion-aplicacion-principio.oportunidad.service';
import { TramiteService } from '@core/services/provincial/tramites/tramite.service';

@Component({
  selector: 'app-disposicion-aplicacion-principio-oportunidad',
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
    FilterComponent,
    AlertasTramiteComponent
  ],
  providers: [MessageService, DialogService],
  templateUrl: './disposicion-aplicacion-principio-oportunidad.component.html',
  styleUrls: ['./disposicion-aplicacion-principio-oportunidad.component.scss']
})
export class DisposicionAplicacionPrincipioOportunidadComponent implements OnInit {

  @Input() idCaso: string = ''
  @Input() idEtapa: string = ''
  @Input() esNuevo: boolean = false
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso
      this.esNuevo ? this.alSeleccionar() : this.obtenerFormulario()
    }
  }

  @Output() datosFormulario = new EventEmitter<any>();
  @Output() peticionParaEjecutar = new EventEmitter<(datos: any) => any>();

  public refModal!: DynamicDialogRef
  public subscriptions: Subscription[] = []
  public alertas: AlertaFormulario[] = [];
  private _idActoTramiteCaso: string = ''
  public casoFiscal: CasoFiscal | null = null
  public plazoRequest: RegistrarPlazoRequest | null= null
  public esCasoReservado: boolean = false
  public datosDiligencia: DiligenciaPreliminar | null = null

  constructor(
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    // private storageService: StorageService, TODO
    private reusablesAlertas: ReusablesAlertas,
    private readonly tramiteService: TramiteService,
    private disposicionAplicPrinOportuService: DisposicionAplicacionPrincipioOportunidadService,

  ) {
  }

  ngOnInit(): void {
    console.log('solicitud principio oportunidad' + this._idActoTramiteCaso);
    //TODO this.casoFiscal = JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
    this.obtenerAlertas();
    this.habilitarFirma()
    //this.peticionParaEjecutar.emit((datos: any) => this.diligenciasService.procesarDiligenciaPreliminar(datos))
  }

  get formularioValido(): boolean {
    // return this.alertas?.length === 0 &&
    return this.plazoRequest != undefined && this.plazoRequest != null;
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso
  }
  protected formularioEditado(valor: boolean) {
    this.tramiteService.formularioEditado = valor
  }

  protected habilitarGuardar(valor: boolean) {
    this.tramiteService.habilitarGuardar = valor
  }
  public habilitarFirma(): void {
    this.formularioEditado(false)
    this.habilitarGuardar(false)
  }

  private async obtenerAlertas(): Promise<void> {

    const validaciones = [
      this.reusablesAlertas.obtenerAlertaSujetosProcesalesDebidamenteRegistrados(this.idCaso),
    ];

    const resultados = await Promise.allSettled(validaciones.map(validacion => firstValueFrom(validacion)))
    this.alertas = [
      ...this.alertas,
      ...obtenerAlertasDeArchivo(resultados)
    ]
  }

  public alSeleccionar(): void {

    this.datosDiligencia = {
      plazosRequest: this.plazoRequest!,
      flCasoReservado: this.esCasoReservado,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso
    }

    this.datosFormulario.emit(this.plazoRequest)
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public mostrarModal(): void {

    const ref = this.dialogService.open(RegistrarPlazoComponent, {
      width: '50%',
      contentStyle: { 'overflow-y': 'auto', 'padding': '1.5vw' },
      baseZIndex: 10000,
      showHeader: false,
      data: {
        idCaso: this.idCaso,
        calificarCaso: this.casoFiscal,
        idTramite: '10101011101010451',
        idActoProcesal: '1010101110101'
      },
    });

    ref.onClose.subscribe((data) => {
      this.plazoRequest = data;
      this.alSeleccionar();
    });
  }

  public obtenerFormulario() {
    this.disposicionAplicPrinOportuService.obtenerDiligenciaPreliminar(this._idActoTramiteCaso).subscribe({
      next: resp => {
        console.log(resp);
        if ( resp != undefined && resp != null){
          this.datosDiligencia = resp
          this.datosFormulario.emit(this.plazoRequest)
        }
      }
    })

  }
}
