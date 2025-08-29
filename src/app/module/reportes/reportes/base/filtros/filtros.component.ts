import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DateMaskModule } from '@directives/date-mask.module';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { CargaLaboralService } from '@modules/reportes/reportes/monitoreo-fiscal/services/carga-laboral.service';
import {
  FiscalDespachoRequest,
  FiscalDespachoResponse,
  YearOption,
  MonthOption,
} from '../../monitoreo-fiscal/models/carga-laboral.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from '@core/constants/mesa-turno';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-filtros',
  standalone: true,
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
    MultiSelectModule,
  ],
  templateUrl: './filtros.component.html',
  styleUrls: [
    './filtros.component.scss',
    // './documentos-nuevos-filtro.component.scss',
    // '../documentos-ingresados.component.scss',
  ],
  providers: [NgxCfngCoreModalDialogService, DatePipe],
})
export class FiltrosComponent {
  @Output() enviarFlitroBuscarRequest = new EventEmitter<string>();

  protected filterForm: FormGroup;
  protected mostrarFiltros = true;
  protected resultsFiscales: FiscalDespachoResponse[] = [];
  private readonly cargaLaboralService: CargaLaboralService =
    inject(CargaLaboralService);

  public dependencia: string = '';
  public codigoCargo: string = '';
  public codigoUsuario: string = '';
  public despachoUsuario: string = '';

  public fiscalesSeleccionados!: FiscalDespachoResponse[];
  public sinSeleccionFiscales: boolean = false;
  public rangeOptions = [
    { label: 'Anual', value: 'A' },
    { label: 'Mensual', value: 'M' },
    { label: 'Intervalo', value: 'I' },
  ];
  public yearOptions: YearOption[] = [];
  public mesOptions: MonthOption[] = [];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private dialogService: NgxCfngCoreModalDialogService
  ) {
    this.filterForm = this.fb.group({
      buscar: [''],
      periodo: [this.rangeOptions[0], Validators.required],
      fechaInicio: [null],
      fechaFin: [null],
      anio: [this.yearOptions[0]],
      mes: [null],
      fiscales: [null, Validators.required],
      etapaCaso: [null],
      actoProcesal: [null],
      tramite: [null],
      indicador: [null],
      fiscalia: [null],
      despacho: [null],
    });
  }

  ngOnInet() {
    this.generateYearOptions();
    this.generateMonthOptions();
    this.obtenerDatosDelToken();
    this.fiscales();
    this.filterForm.patchValue({
      periodo: this.rangeOptions[0],
      anio: this.yearOptions[0],
      mes: null,
      fechaInicio: null,
      fechaFin: null,
      fiscales: null,
      etapaCaso: null,
      actoProcesal: null,
      tramite: null,
      indicador: null,
      fiscalia: null,
      despacho: null,
    });
  }

  get periodoValue() {
    return this.filterForm.get('periodo')?.value?.value;
  }

  public onPeriodoChange(event: any) {
    const periodoValue = event.value.value;

    if (periodoValue === 'A') {
      this.filterForm.get('fechaInicio')?.setValue(null);
      this.filterForm.get('fechaFin')?.setValue(null);
      this.filterForm.get('mes')?.setValue(null);
    } else if (periodoValue === 'M') {
      this.filterForm.get('fechaInicio')?.setValue(null);
      this.filterForm.get('fechaFin')?.setValue(null);
    } else if (periodoValue === 'I') {
      this.filterForm.get('anio')?.setValue(null);
      this.filterForm.get('mes')?.setValue(null);
    }
  }

  private generateYearOptions() {
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: 5 }, (_, index) => ({
      label: (currentYear - index).toString(),
      value: currentYear - index,
    }));
  }

  private generateMonthOptions() {
    this.mesOptions = [
      { label: 'Enero', value: 1 },
      { label: 'Febrero', value: 2 },
      { label: 'Marzo', value: 3 },
      { label: 'Abril', value: 4 },
      { label: 'Mayo', value: 5 },
      { label: 'Junio', value: 6 },
      { label: 'Julio', value: 7 },
      { label: 'Agosto', value: 8 },
      { label: 'Septiembre', value: 9 },
      { label: 'Octubre', value: 10 },
      { label: 'Noviembre', value: 11 },
      { label: 'Diciembre', value: 12 },
    ];
  }

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  protected eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public onChangeFiscalesSeleccionados(event: any): void {
    this.fiscalesSeleccionados = event.value;
    console.log(this.fiscalesSeleccionados);
    this.sinSeleccionFiscales = this.fiscalesSeleccionados.length === 0;
  }

  public limpiar(): void {
    this.filterForm.patchValue({
      buscar: '',
      fiscal: null,
      periodo: null,
      estapaCaso: null,
      actoProcesal: null,
      tramite: null,
      indicador: null,
      fiscalia: null,
      despacho: null,
    });
  }

  protected buscar() {
    const form = this.filterForm.getRawValue();
  }

  private obtenerDatosDelToken() {
    let usuarioToken: any;
    const helper = new JwtHelperService();
    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME)!);
    const decodedToken = helper.decodeToken(token.token);

    usuarioToken = decodedToken.usuario;

    this.dependencia = usuarioToken.codDependencia;
    this.codigoCargo = usuarioToken.codCargo;
    this.codigoUsuario = usuarioToken.usuario;
    this.despachoUsuario = usuarioToken.codDespacho;
  }

  public fiscales() {
    this.cargaLaboralService
      .listarFiscales(this.obtenerFiscalesPayload())
      .subscribe({
        next: (response) => {
          this.resultsFiscales = response;
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
        },
      });
  }

  private obtenerFiscalesPayload(): FiscalDespachoRequest {
    return {
      codigoDependencia: this.dependencia,
      codigoCargo: this.codigoCargo,
      codigoDespacho: this.despachoUsuario,
      usuario: this.codigoCargo === '00000009' ? this.codigoUsuario : null,
    };
  }

  protected buscarSegunTexto() {
    const buscado = this.filterForm.get('buscar')!.value;
    this.enviarFlitroBuscarRequest.emit(buscado);
  }
}
