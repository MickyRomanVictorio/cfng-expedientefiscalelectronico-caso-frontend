import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { MessageService, SelectItem } from "primeng/api";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {CalificarCaso} from "@interfaces/provincial/administracion-casos/calificacion/CalificarCaso";
import { ObtenerValorMaxPlazoResponse } from "@interfaces/provincial/administracion-casos/gestion-plazo/GestionPlazoRequest";
import { DynamicDialogModule } from "primeng/dynamicdialog";
import {MaestroService} from "@services/shared/maestro.service";
import {GestionPlazoService} from "@services/provincial/gestion-plazo/gestion-plazo.service";
import {tap, zip} from "rxjs";
import {obtenerCasoHtml} from "@utils/utils";
import { obtenerIcono } from "@utils/icon";
import { format } from 'date-fns';
import { CustomFormService, field } from "./custom-form.service";
import {CommonModule} from "@angular/common";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {InputTextareaModule} from "primeng/inputtextarea";
import {MessagesModule} from "primeng/messages";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {InputNumberModule} from "primeng/inputnumber";
import {ProgressBarModule} from "primeng/progressbar";
import {ToastModule} from "primeng/toast";
import {CalendarModule} from "primeng/calendar";
import {DateMaskModule} from "@directives/date-mask.module";
import {DigitOnlyModule} from "@directives/digit-only.module";

@Component({
  selector: 'app-ampliar-plazo',
  templateUrl: './ampliar-plazo.component.html',
  styleUrls: ['./ampliar-plazo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    DynamicDialogModule,
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
    DigitOnlyModule
  ],
  //providers: []
})
export class AmpliarPlazoComponent implements OnInit {
  // campos del formulario
  fd = field;
  sedes: SelectItem[] = [];
  unidadesMedidas: SelectItem[] = [];
  titulo: string = 'Ampliar plazos';
  numeroCaso: string = '00000000-0000-0000-0';
  public obtenerIcono = obtenerIcono;
  public tituloModal: SafeHtml | undefined = undefined;
  calificarCaso!: CalificarCaso;

  public verBarraProgreso: boolean = true;
  valorMaximoResponse!: ObtenerValorMaxPlazoResponse;

  constructor(
    private sanitizador: DomSanitizer,
    private messageService: MessageService,
    private maestroService: MaestroService,
    private gestionPlazoService: GestionPlazoService,
    public aps: CustomFormService,
  ) {
  }

  get f() { return this.aps.form; }

  ngOnInit(): void {
    this.obtenerTitulo();

    zip(
      this.listarSedeInvestigacion().pipe(tap(this.handlerListarInvestigacion())),
      this.listarUnidadMedida().pipe(tap(this.handlerListarUnidadMedida())),
      this.obtenerValorMaxPlazo().pipe(tap(this.handlerValorMaxPlazo()))
    ).subscribe(
      _ => this.verBarraProgreso = false,
      _ => this.verBarraProgreso = false
    );

    this.aps.fieldFecIni!.setValue(this.fechaIniInvPreliminar());
    this.aps.fieldFecFin!.setValue(this.fechaFinInvPreliminar());
  }

  fechaIniInvPreliminar() {
    const fecha = this.aps.calificarCaso.plazos.at(0)?.fechaEmision;
    return fecha ? format(new Date(fecha), 'dd/MM/yyyy') : null;
  }

  fechaFinInvPreliminar() {
    const fecha = this.aps.calificarCaso.plazos.at(0)?.fechaFinCalculada;
    return fecha ? format(new Date(fecha), 'dd/MM/yyyy') : null;
  }

  private obtenerTitulo(): void {
    let tituloHtml = `${this.titulo}`;
    tituloHtml += this.aps.calificarCaso.numeroCaso !== '00000000-0000-0000-0' ? ` - Caso: N°${obtenerCasoHtml(this.aps.calificarCaso.numeroCaso)}` : ''
    this.tituloModal = this.sanitizador.bypassSecurityTrustHtml(tituloHtml)
  }

  public cerrarModal(): void {
    this.aps.closeModal!();
  }

  public ampliar(): void {
    this.aps.ampliarPlazo!();
  }

  listarSedeInvestigacion() {
    return this.maestroService.listarSedeInvestigacion();
  }

  listarUnidadMedida() {
    return this.maestroService.listarUnidadMedida();
  }

  obtenerValorMaxPlazo() {
    const idTipoComplejidad = this.idComplejidad;
    const idActoTramiteEstado =  this.aps.idActoTramiteEstado;
    return this.gestionPlazoService.obtenerValoMaxPlazo({ idTipoComplejidad, idActoTramiteEstado });
  }

  private handlerListarInvestigacion() {
    return (resp:any) => this.sedes = resp.map((item:any) => ({ value: item.id, label: item.nombre }));
  }

  private handlerListarUnidadMedida() {
    return (resp:any) => this.unidadesMedidas = resp.filter((e:any) => e.id !== 1).map((item:any) => ({ value: item.id, label: item.nombre }))
  }

  private handlerValorMaxPlazo() {
    return (result:any) => {
      this.valorMaximoResponse = result;
      this.aps.form!.get(this.fd.complejidad)!.setValue(this.idComplejidad);
      this.aps.form!.get(this.fd.canMax)!.setValue(this.valorMaximoResponse.idTipoComplejidad);
    };

  }

  get idComplejidad() {
    return 2 // this.aps.calificarCaso.plazos.at(-1).complejidad;
  }

}
