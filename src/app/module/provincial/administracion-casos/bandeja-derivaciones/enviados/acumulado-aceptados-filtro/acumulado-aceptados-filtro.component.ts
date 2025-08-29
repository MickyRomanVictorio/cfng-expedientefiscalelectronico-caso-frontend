import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CalendarModule} from "primeng/calendar";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {DateMaskModule} from "@directives/date-mask.module";
import {DropdownModule} from "primeng/dropdown";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {Subscription} from "rxjs";
import {MaestroService} from "@services/shared/maestro.service";
import {NgxSpinnerService} from "ngx-spinner";
import {obtenerIcono} from "@utils/icon";
import {RadioButtonModule} from "primeng/radiobutton";
import {BandejaTramiteRequest} from "@interfaces/provincial/bandeja-tramites/BandejaTramiteRequest";
import { BandejaDerivacionesAcumuladas } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-aceptados/AcumuladoAceptados';
import { FiltroDerivacionesRequest } from '@interfaces/provincial/bandeja-derivacion/enviados/acumulado-aceptados/FiltrosDirivacionesRequest';

@Component({
  standalone: true,
  selector: 'app-acumulado-derivado-aceptados-filtro',
  templateUrl: './acumulado-aceptados-filtro.component.html',
  imports: [
    CalendarModule,
    CmpLibModule,
    DateMaskModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    RadioButtonModule
  ],
  providers: [DatePipe],
})
export class AcumuladoAceptadosFiltroComponent implements OnInit {

  @Input() derivacionesEnviadasList: BandejaDerivacionesAcumuladas[] = [];
  @Output() enviarFiltroRequest: EventEmitter<BandejaTramiteRequest> = new EventEmitter<BandejaTramiteRequest>();
  @Output() enviarTextoBuscado: EventEmitter<string> = new EventEmitter<string>();

  public formFiltrarAcumuladosAceptados!: FormGroup;
  public mostrarFiltros = false;
  public subscriptions: Subscription[] = [];
  private today = new Date();

  constructor(
    private fb: FormBuilder,
    private maestrosService: MaestroService,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
  ) {
  }

  ngOnInit() {
    this.formBuild();
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  private formBuild(): void {

    let fechaDesde = new Date(this.today.getFullYear(), this.today.getMonth() - 1, this.today.getDate());

    let fechaHasta = this.today;

    this.formFiltrarAcumuladosAceptados = this.fb.group({
      buscar: [''],
      tipoFecha: ['0'],
      fechaDesde: [fechaDesde],
      fechaHasta: [fechaHasta]
    });
  }

  buscarSegunTexto() {
    const buscado = this.formFiltrarAcumuladosAceptados.get('buscar')!.value;
    this.enviarTextoBuscado.emit(buscado);
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public limpiarFiltros(): void {
    this.formBuild();
  }

  public buscar() {
    const form = this.formFiltrarAcumuladosAceptados.getRawValue();
    let request: FiltroDerivacionesRequest = {
      textBusqueda: form.buscar,
      tipoFecha: form.tipoFecha === 0 ? 0 : 1,
      fechaDesde: this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy'),
      fechaHasta: this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy'),
      accion: 131
    }
  }

  public getDate(value: string): Date | null {
    if (value === null) return null;

    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return date;
  }

}
