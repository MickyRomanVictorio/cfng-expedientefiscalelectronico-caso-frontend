import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { obtenerIcono } from '@utils/icon';
import { DialogService } from 'primeng/dynamicdialog';
// import {StorageService} from "@services/shared/storage.service";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AmpliarPlazoRequest } from '@interfaces/provincial/administracion-casos/preliminar/ampliar-plazo.request';
import { DateMaskModule } from '@directives/date-mask.module';
import { AmpliacionPlazoPreliminaresService } from '@services/provincial/tramites/ampliacion-plazo-preliminares.service';
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
import { Observable } from 'rxjs';
import { AmpliarPlazoComponent } from './ampliar-plazo/ampliar-plazo.component';
import { CustomFormService } from './ampliar-plazo/custom-form.service';

type CallGenerarTramite = (data: AmpliarPlazoRequest) => Observable<any>;

// const AMPLIACION_DE_DILIGENCIAS_PRELIMINARES = '1410101110102';
const DISPOSICION_DE_AMPLIACION_DE_DILIGENCIAS_PRELIMINARES =
  '14101011101020601';

@Component({
  selector: 'app-gestionar-disposicion-prorroga',
  standalone: true,
  templateUrl: './gestionar-disposicion-prorroga.component.html',
  styleUrls: ['./gestionar-disposicion-prorroga.component.scss'],
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
export class GestionarDisposicionProrrogaComponent
  implements OnInit, OnDestroy
{
  /**
   * lo que se debe repetir en los componentes
   * */
  private _idActoTramiteCaso: string = '';
  @Input() idCaso: string = '';
  @Input() esNuevo: boolean = false;
  @Input()
  set idActoTramiteCaso(idActoTramiteCaso: string) {
    if (this._idActoTramiteCaso !== idActoTramiteCaso) {
      this._idActoTramiteCaso = idActoTramiteCaso;
      // this.esNuevo ? this.alSeleccionar() : this.obtenerFormulario()
    }
  }

  @Output() datosFormulario = new EventEmitter<any>();
  @Output() peticionParaEjecutar = new EventEmitter<CallGenerarTramite>();

  get formularioValido(): boolean {
    return this.aps.form!.valid;
  }
  /** fin de lo que se debe repetir */

  public casoFiscal: CasoFiscal | null = null;
  public isShowModal = false;

  constructor(
    public aps: CustomFormService,
    private dialogService: DialogService,
    // private storageService: StorageService, TODO
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
}
