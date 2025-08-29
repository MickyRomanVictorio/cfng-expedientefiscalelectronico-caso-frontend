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
// import { StorageService } from '@core/services/shared/storage.service';
import { LOCALSTORAGE } from '@environments/environment';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { icono } from 'dist/ngx-cfng-core-lib';

@Component({
  selector: 'app-solicitud-principio-oportunidad',
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
  templateUrl: './solicitud-principio-oportunidad.component.html',
  styleUrls: ['./solicitud-principio-oportunidad.component.scss']
})
export class SolicitudPrincipioOportunidadComponent implements OnInit {

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
  public casoFiscal: CasoFiscal | null= null
  public plazoRequest: RegistrarPlazoRequest | null = null
  public esCasoReservado: boolean = false
  public datosDiligencia: DiligenciaPreliminar | null= null

  constructor(
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    // private storageService: StorageService, TODO
    private reusablesAlertas: ReusablesAlertas
  ) {
  }

  ngOnInit(): void {
    console.log('solicitud principio oportunidad' + this._idActoTramiteCaso);
    // TODO this.casoFiscal = JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
    this.obtenerAlertas()
    //this.peticionParaEjecutar.emit((datos: any) => this.diligenciasService.procesarDiligenciaPreliminar(datos))
  }

  get formularioValido(): boolean {
    // return this.alertas?.length === 0 &&
    return this.plazoRequest != undefined && this.plazoRequest != null;
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso
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

  public icono(name: string): string {
    return icono(name);
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
    /*this.diligenciasService.obtenerDiligenciaPreliminar(this._idActoTramiteCaso).subscribe({
      next: resp => {
        console.log(resp);
        if ( resp != undefined && resp != null){
          this.datosDiligencia = resp
          this.datosFormulario.emit(this.plazoRequest)
        }
      }
    })*/
  }
}
