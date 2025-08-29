import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { RegistrarPlazoRequest } from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
// import { StorageService } from '@core/services/shared/storage.service';
import { DisposicionReaperturaCasoService } from '@services/provincial/tramites/comun/preliminar/disposicion-reapertura-caso.service';
import { AlertasTramiteComponent } from '@components/generales/alertas-tramite/alertas-tramite.component';
import { FilterComponent } from '@components/generales/filter/filter.component';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { RegistrarPlazoComponent } from '@core/components/modals/acto-procesal/asignar-plazo/registrar-plazo/registrar-plazo.component';

@Component({
  selector: 'app-disposicion-reapertura-caso',
  templateUrl: './disposicion-reapertura-caso.component.html',
  styleUrls: ['./disposicion-reapertura-caso.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    MessagesModule,
    ToastModule,
    DialogModule,
    DynamicDialogModule,
    FormsModule,
    ReactiveFormsModule,
    FilterComponent,
    AlertasTramiteComponent,
  ],
  providers: [MessageService, DialogService],
})
export class DisposicionReaperturaCasoComponent implements OnInit {
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
  private _idActoTramiteCaso: string = '';
  public casoFiscal: CasoFiscal | null = null;
  public plazoRequest: RegistrarPlazoRequest | null = null;
  public esCasoReservado: boolean = false;
  public datosForm: any = null;
  public nombreEtapa: string = '';

  constructor(
    private dialogService: DialogService,
    // private storageService: StorageService, TODO
    private disposicionReapertura: DisposicionReaperturaCasoService
  ) {}

  ngOnInit() {
    // TODO this.casoFiscal = JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
    this.peticionParaEjecutar.emit((datos: any) =>
      this.disposicionReapertura.guardarDisposicionReaperturaCaso(datos)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  get formularioValido(): boolean {
    return this.plazoRequest !== undefined && this.plazoRequest !== null;
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

  public alSeleccionar(): void {
    this.datosForm = {
      plazosRequest: this.plazoRequest,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
    };
    this.datosFormulario.emit(this.datosForm);
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public mostrarModal(): void {
    const ref = this.dialogService.open(RegistrarPlazoComponent, {
      showHeader: false,
      data: {
        idCaso: this.idCaso,
        calificarCaso: this.casoFiscal,
        idTramite: this.tramiteSeleccionado!.idTramite,
        idActoProcesal: this.tramiteSeleccionado!.idActoTramiteConfigura,
        plazos: this.datosForm?.plazosRequest,
      },
    });

    ref.onClose.subscribe((data) => {
      this.plazoRequest = data;
      this.alSeleccionar();
    });
  }

  public obtenerFormulario() {
    this.subscriptions.push(
      this.disposicionReapertura
        .obtenerDisposicionReaperturaCaso(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            if (resp != undefined && resp != null) {
              this.datosForm = resp;
              this.plazoRequest = this.datosForm.plazosRequest;
              this.datosFormulario.emit(this.datosForm);
            }
          },
          error: (error) => {
            console.error(error);
          },
        })
    );
  }
}
