import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { rangoFechaXDefecto } from 'ngx-cfng-core-lib';
import { IconUtil } from 'ngx-cfng-core-lib';
import { formatDate } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
// import { FormularioActoInvestigacion } from '../lista-actos-investigacion.component';
import { ActosInvestigacionService } from '../services/actos-investigacion.service';
import { SujetoProcesal } from '../interfaces/sujetos-procesales-interface';
import { GestionCasoService } from '@core/services/shared/gestion-caso.service';
import { Expediente } from '@core/utils/expediente';
import { FormularioActoInvestigacion } from '../interfaces/formulario-acto-investigacion-interface';

@Component({
  selector: 'app-filtro-acto-investigacion',
  standalone: true,
  imports: [
    CmpLibModule,
    NgClass,
    NgIf,
    NgStyle,
    RadioButtonModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    ToastModule,
  ],
  templateUrl: './filtro-acto-investigacion.component.html',
  styleUrl: './filtro-acto-investigacion.component.scss',
  providers: [MessageService],
})
export class FiltroActoInvestigacionComponent {
  @Output()
  public buscarOut = new EventEmitter<FormularioActoInvestigacion>();

  @Output()
  public buscarTextOut = new EventEmitter<string>();

  protected mostrarFiltro: boolean = true;
  protected form!: FormGroup;
  protected listaClasificadorExpediente: any = [];
  protected TipoBusquedaEnum = TipoBusqueda;
  private buscarTextTiempo: ReturnType<typeof setTimeout> | undefined =
    undefined;
  protected caso: Expediente;
  protected listaSujetosProcesales: SujetoProcesal[] = [];
  protected listaCatalogoClasificacion: any[] = [];
  protected listaActosProcesales: any[] = [];
  protected listaEtapas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    protected iconUtil: IconUtil,
    private actosInvestigacionService: ActosInvestigacionService,
    private gestionCasoService: GestionCasoService
  ) {
    this.caso = this.gestionCasoService.casoActual;
  }

  ngOnInit(): void {
    this.inicioFormulario();
    this.inicioDatos();
    this.eventoBuscar(TipoBusqueda.Inicio);
  }

  private inicioFormulario() {
    const fechaRango = rangoFechaXDefecto();
    this.form = this.fb.group({
      filtroTiempo: ['0'],
      fechaDesdeIngreso: [fechaRango.inicio, Validators.required],
      fechaHastaIngreso: [fechaRango.fin, Validators.required],
      sujetoProcesal: [null],
      clasificacion: [null],
      etapa: [null],
      actoProcesal: [null],
    });
  }

  private inicioDatos() {
    this.obtenerSujetosProcesales();
    this.obtenerActosDeInvestigacion();
    this.obtenerActosProcesales();
    this.obtenerEtapas();
  }

  private obtenerSujetosProcesales() {
    this.actosInvestigacionService
      .obtenerSujetosProcesales(this.caso.idCaso)
      .subscribe({
        next: (resp) => {
          console.log(
            'resp - obtenerSujetosProcesales: ',
            JSON.stringify(resp)
          );

          this.listaSujetosProcesales = resp;
        },
        error: (err) => {},
      });
  }

  private obtenerActosDeInvestigacion() {
    this.actosInvestigacionService.obtenerActosDeInvestigacion().subscribe({
      next: (resp) => {
        this.listaCatalogoClasificacion = resp.data;
      },
      error: (err) => {},
    });
  }

  private obtenerActosProcesales() {
    this.actosInvestigacionService.obtenerActosProcesales().subscribe({
      next: (resp) => {
        this.listaActosProcesales = resp.data;
      },
      error: (err) => {},
    });
  }

  private obtenerEtapas() {
    this.actosInvestigacionService.obtenerEtapas().subscribe({
      next: (resp) => {
        this.listaEtapas = resp.data;
      },
      error: (err) => {},
    });
  }

  protected eventoBuscar(tipoBusqueda: TipoBusqueda): void {
    // ;
    let datosRespuesta: FormularioActoInvestigacion = {
      fechaDesdeIngreso: '01/01/1900',
      fechaHastaIngreso: '',
      // idTipoClasificadorExpediente: null,
    };
    const fechaRango = rangoFechaXDefecto();

    switch (tipoBusqueda) {
      case TipoBusqueda.Inicio:
        this.form.reset();
        this.form.patchValue({
          filtroTiempo: '0',
          fechaDesdeIngreso: fechaRango.inicio,
          fechaHastaIngreso: fechaRango.fin,
        });
        datosRespuesta.fechaDesdeIngreso = formatDate(fechaRango.inicio);
        datosRespuesta.fechaHastaIngreso = formatDate(fechaRango.fin);
        break;

      case TipoBusqueda.UltimoMeses:
        datosRespuesta.fechaDesdeIngreso = formatDate(fechaRango.inicio);
        datosRespuesta.fechaHastaIngreso = formatDate(fechaRango.fin);
        break;

      case TipoBusqueda.Todos:
        datosRespuesta.fechaHastaIngreso = formatDate(fechaRango.fin);
        break;

      case TipoBusqueda.Personalizado:
        if (this.form.invalid === true) {
          return;
        }
        if (this.form.get('fechaHastaIngreso')!.value > new Date()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Rango de Fechas',
            detail: 'La fecha no debe ser mayor a la fecha actual',
          });
          return;
        }

        datosRespuesta.fechaDesdeIngreso = formatDate(
          this.form.get('fechaDesdeIngreso')!.value
        );
        datosRespuesta.fechaHastaIngreso = formatDate(
          this.form.get('fechaHastaIngreso')!.value
        );
        datosRespuesta.sujetoProcesal = this.form.get('sujetoProcesal')!.value;
        datosRespuesta.clasificacion = this.form.get('clasificacion')!.value;
        datosRespuesta.etapa = this.form.get('etapa')!.value;
        datosRespuesta.actoProcesal = this.form.get('actoProcesal')!.value;
        break;
    }

    console.log('datosRespuesta: ', JSON.stringify(datosRespuesta));

    this.buscarOut.emit(datosRespuesta);
  }

  protected eventoBuscarText(e: Event) {
    clearTimeout(this.buscarTextTiempo);
    const valor = (e.target as HTMLInputElement).value;
    this.buscarTextTiempo = setTimeout(() => {
      this.buscarTextOut.emit(valor);
    }, 500);
  }
}

export enum TipoBusqueda {
  Inicio = 0,
  UltimoMeses = 1,
  Todos = 2,
  Personalizado = 3,
}
