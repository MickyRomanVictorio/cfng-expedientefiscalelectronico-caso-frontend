import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { AmpliarPlazoRequest } from '@interfaces/provincial/administracion-casos/preliminar/ampliar-plazo.request';
import { CustomFormService } from '@modules/provincial/tramites/comun/preliminar/ampliacion-diligencias-preliminares/ampliar-plazo/custom-form.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, Subscription } from 'rxjs';
// import {StorageService} from "@services/shared/storage.service";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TramiteProcesal } from '@core/interfaces/comunes/tramiteProcesal';
import { RegistrarPlazoRequest } from '@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest';
import { DateMaskModule } from '@directives/date-mask.module';
import { DiligenciaPreliminar } from '@interfaces/provincial/tramites/comun/preliminar/diligencia-preliminar.interface';
import { AmpliarPlazoComponent } from '@modules/provincial/tramites/comun/preliminar/ampliacion-diligencias-preliminares/ampliar-plazo/ampliar-plazo.component';
import { AmpliacionPlazoPreliminaresService } from '@services/provincial/tramites/ampliacion-plazo-preliminares.service';
import { IniciarDiligenciaPreliminarService } from '@services/provincial/tramites/iniciar-diligencia-preliminar.service';
import { PlazoDeclararComplejoComponent } from '@components/modals/acto-procesal/asignar-plazo/plazo-declarar-complejo/plazo-declarar-complejo.component';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
type CallGenerarTramite = (data: AmpliarPlazoRequest) => Observable<any>;
const DISPOSICION_DE_AMPLIACION_DE_DILIGENCIAS_PRELIMINARES =
  '14101011101020601';

@Component({
  selector: 'app-declarar-complejo-inv-preliminar',
  standalone: true,
  templateUrl: './declarar-complejo-inv-preliminar.component.html',
  styleUrls: ['./declarar-complejo-inv-preliminar.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextareaModule,
    MessagesModule,
    InputTextModule,
    ButtonModule,
    InputNumberModule,
    FormsModule,
    ProgressBarModule,
    ToastModule,
    CalendarModule,
    DateMaskModule,
    DialogModule,
    AmpliarPlazoComponent,
  ],
  providers: [CustomFormService],
})
export class DeclararComplejoInvPreliminarComponent
  implements OnInit, OnDestroy
{
  private _idActoTramiteCaso: string = '';
  @Input() idCaso: string = '';
  @Input() esNuevo: boolean = false;
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
      this.esNuevo && this.alSeleccionar();
      !this.esNuevo && this.obtenerFormulario();
    }
  }

  public refModal!: DynamicDialogRef;
  public subscriptions: Subscription[] = [];
  @Input() deshabilitado: boolean = false;

  @Output() datosFormulario = new EventEmitter<any>();
  @Output() peticionParaEjecutar = new EventEmitter<CallGenerarTramite>();

  public casoFiscal: CasoFiscal | null = null;
  public isShowModal = false;

  constructor(
    private spinner: NgxSpinnerService,
    public aps: CustomFormService,
    private dialogService: DialogService,
    // private storageService: StorageService, TODO
    private diligenciasService: IniciarDiligenciaPreliminarService,
    private ampPlazoService: AmpliacionPlazoPreliminaresService
  ) {
    // registrando evento para el close,open y ampliar.
    this.aps.closeModal = this.closeModal.bind(this);
    this.aps.openModal = this.openModal.bind(this);
    this.aps.ampliarPlazo = this.ampliarPlazo.bind(this);
  }

  ngOnInit(): void {
    /*
    TODO
    this.casoFiscal = JSON.parse(this.storageService.getItem(LOCALSTORAGE.CASO_OBJETO_KEY));
    this.storageService.getItem(LOCALSTORAGE.TRAMITE_RSP_KEY);
    */
    //this.peticionParaEjecutar.emit(this.generarSolicitudAmpliacion());
    this.aps.calificarCaso = this.casoFiscal;
    this.aps.idCaso = this.idCaso;
    this.aps.idActoTramiteEstado =
      DISPOSICION_DE_AMPLIACION_DE_DILIGENCIAS_PRELIMINARES;
  }

  public closeModal() {
    this.isShowModal = false;
  }

  public openModal() {
    this.isShowModal = true;
  }

  public ampliarPlazo() {
    this.aps.form!.markAllAsTouched();
    if (this.aps.form!.invalid) return;

    const data: Partial<AmpliarPlazoRequest> = {};
    data.idTipoSedeInvestigacion = this.aps.fieldSede!.value;
    data.descripcionPlazo = this.aps.fieldDescripcion!.value;
    data.idCaso = this.aps.idCaso;
    data.idActoTramiteEstado = this.aps.idActoTramiteEstado;
    data.idActoTramiteCasoUltimo =
      this.aps.calificarCaso?.idActoTramiteCasoUltimo;
    // data.idActoProcesalConfigura = this.aps.idActoProcesalConfigura;
    data.idTipoUnidad = this.aps.fieldUnidadMedida!.value;
    data.nroPlazo = this.aps.fieldUnidadMedida!.value;
    this.datosFormulario.emit(data);
    this.isShowModal = false;
  }

  generarSolicitudAmpliacion() {
    //return (data: AmpliarPlazoRequest) => {
      /*
      TODO
      const tramite = JSON.parse(this.storageService.getItem(LOCALSTORAGE.TRAMITE_RSP_KEY));
      data.idMovimiento = tramite.idMovimiento;
      */
      //return this.ampPlazoService.insertarPlazoCaso(data);
    //};
  }

  protected readonly obtenerIcono = obtenerIcono;

  ngOnDestroy(): void {
    this.aps.form!.reset();
  }

  protected readonly open = open;

  //NUEVA LOGICA

  get formularioValido(): boolean {
    return this.plazoRequest !== undefined && this.plazoRequest !== null;
  }

  get idActoTramiteCaso(): string {
    return this._idActoTramiteCaso;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  get iconButton(): string {
    return this.idActoTramiteCaso
      ? 'success'
      : this.formularioValido
      ? 'success'
      : 'error';
  }

  public mostrarModal(): void {
    const ref = this.dialogService.open(PlazoDeclararComplejoComponent, {
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
              //this.esCasoReservado = this.datosDiligencia.flCasoReservado;
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

  public alSeleccionar(): void {
    this.datosDiligencia = {
      plazosRequest: this.plazoRequest!,
      flCasoReservado: this.esCasoReservado,
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
    };
    this.datosFormulario.emit(this.datosDiligencia);
  }

  public esCasoReservado: boolean = false;
  public plazoRequest: RegistrarPlazoRequest | null = null;
  public datosDiligencia: DiligenciaPreliminar | null = null;
  @Input() tramiteSeleccionado: TramiteProcesal | null = null;
}
