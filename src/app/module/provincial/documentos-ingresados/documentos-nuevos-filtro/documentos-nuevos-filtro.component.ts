import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DocumentoIngresadoNuevoRequest } from '@interfaces/provincial/documentos-ingresados/DocumentoIngresadoNuevoRequest';
import { DateMaskModule } from '@directives/date-mask.module';
import { MaestroService } from '@services/shared/maestro.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { NgxCfngCoreModalDialogService } from 'dist/ngx-cfng-core-modal/dialog';
import { DocumentosIngresadosService } from '@services/provincial/documentos-ingresados/documentos-ingresados.service';
import { ID_TIPO_ORIGEN } from '@core/types/tipo-origen.type';
import { EscenarioUno } from '@interfaces/maestros/escenarios.interface';

@Component({
  standalone: true,
  selector: 'app-documentos-nuevos-filtro',
  templateUrl: './documetos-nuevos-filtro.component.html',
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
  ],
  styleUrls: [
    './documentos-nuevos-filtro.component.scss',
    '../documentos-ingresados.component.scss',
  ],
  providers: [NgxCfngCoreModalDialogService, DatePipe],
})
export class DocumentosNuevosFiltroComponent implements OnInit {
  @Input() idBandeja: number = 0;
  @Output() enviarFiltroRequest =
    new EventEmitter<DocumentoIngresadoNuevoRequest>();
  @Output() enviarFlitroBuscarRequest = new EventEmitter<string>();

  protected formularioFiltrarDocIngresadoNuevo: FormGroup;
  protected mostrarFiltros = true;
  protected subscriptions: Subscription[] = [];

  protected origenes: EscenarioUno[] = [];

  protected fechaDesdeInicial: Date | null = null;
  protected fechaHastaInicial: Date | null = null;

  protected maxFecha: Date | null = null;
  protected minFecha: Date | null = null;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private maestrosService: MaestroService,
    private dialogService: NgxCfngCoreModalDialogService,
    private documentosIngresadosService: DocumentosIngresadosService
  ) {
    let today = new Date();
    this.fechaDesdeInicial = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );
    this.fechaHastaInicial = today;

    this.minFecha = this.fechaDesdeInicial;
    this.maxFecha = today;
    this.formularioFiltrarDocIngresadoNuevo = this.fb.group(
      {
        buscar: [''],
        fechaDesde: [this.fechaDesdeInicial, Validators.required],
        fechaHasta: [this.fechaHastaInicial, Validators.required],
        origen: [null],
      },
      { validators: this.dateRangeValidator }
    );
  }

  ngOnInit() {
    this.obtenerOrigenes();
    this.buscar();
  }

  get cantidadPagina(): number {
    return this.documentosIngresadosService.cantidadPagina;
  }

  protected obtenerOrigenes(): void {
    this.subscriptions.push(
      this.maestrosService.obtenerOrigen().subscribe({
        next: (resp) => {
          this.origenes = resp.data.filter(e => e.id == ID_TIPO_ORIGEN.MPE || e.id == ID_TIPO_ORIGEN.MD)
        },
      })
    );
  }

  protected icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  protected eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public limpiar(): void {
    this.formularioFiltrarDocIngresadoNuevo.patchValue({
      buscar: '',
      fechaDesde: this.fechaDesdeInicial,
      fechaHasta: this.fechaHastaInicial,
      origen: null,
    });
  }

  onFechaDesdeSelect(event: Date) {
    this.formularioFiltrarDocIngresadoNuevo.get('fechaDesde')?.setValue(event);
    this.formularioFiltrarDocIngresadoNuevo.updateValueAndValidity();
  }

  onFechaHastaSelect(event: Date) {
    this.formularioFiltrarDocIngresadoNuevo.get('fechaHasta')?.setValue(event);
    this.formularioFiltrarDocIngresadoNuevo.updateValueAndValidity();
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const fechaDesde = group.get('fechaDesde')?.value;
    const fechaHasta = group.get('fechaHasta')?.value;

    if (fechaDesde && fechaHasta) {
      const fechaInicio = new Date(fechaDesde);
      const fechaFin = new Date(fechaHasta);

      const monthDiff =
        fechaFin.getMonth() -
        fechaInicio.getMonth() +
        12 * (fechaFin.getFullYear() - fechaInicio.getFullYear());

      if (
        monthDiff > 1 ||
        (monthDiff === 1 && fechaFin.getDate() > fechaInicio.getDate())
      ) {
        return { invalidDateRange: true };
      }
    }
    return null;
  }

  protected buscar() {
    const form = this.formularioFiltrarDocIngresadoNuevo.getRawValue();

    if (this.formularioFiltrarDocIngresadoNuevo.valid) {
      const request: DocumentoIngresadoNuevoRequest = {
        idOrigen: form.origen ? form.origen : 0,
        fechaDesde: form.fechaDesde
          ? this.datePipe.transform(form.fechaDesde, 'dd/MM/yyyy')
          : null,
        fechaHasta: form.fechaHasta
          ? this.datePipe.transform(form.fechaHasta, 'dd/MM/yyyy')
          : null,
        idBandeja: this.idBandeja,
        page: 1,
        perPage: this.cantidadPagina,
      };

      this.enviarFiltroRequest.emit(request);
    } else {
      this.dialogService.error(
        'Fecha Inválida',
        'El rango de fechas seleccionado no puede exceder un mes.'
      );
    }
  }

  public buscarInicial() {
    this.formularioFiltrarDocIngresadoNuevo.patchValue({
      buscar: '',
      fechaDesde: this.fechaDesdeInicial,
      fechaHasta: this.fechaHastaInicial,
      origen: null,
    });

    const request: DocumentoIngresadoNuevoRequest = {
      idOrigen: 0,
      fechaDesde: this.datePipe.transform(this.fechaDesdeInicial, 'dd/MM/yyyy'),
      fechaHasta: this.datePipe.transform(this.fechaHastaInicial, 'dd/MM/yyyy'),
      idBandeja: this.idBandeja,
      page: 1,
      perPage: this.cantidadPagina,
    };

    this.enviarFiltroRequest.emit(request);
  }

  protected buscarSegunTexto() {
    const buscado =
      this.formularioFiltrarDocIngresadoNuevo.get('buscar')!.value;
    this.enviarFlitroBuscarRequest.emit(buscado);
  }
}
