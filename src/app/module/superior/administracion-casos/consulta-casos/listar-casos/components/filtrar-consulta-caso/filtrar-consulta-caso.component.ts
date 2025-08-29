import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { MessageService, SelectItem } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import {CommonModule, DatePipe} from '@angular/common';
import { DataService } from '../../DataService';
import { DelitosPartesDesacumularModalComponent } from '@components/modals/delitos-partes-desacumular-modal/delitos-partes-desacumular-modal.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormFilter } from '@core/interfaces/comunes/casosFiscales';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { obtenerIcono } from '@utils/icon';
import { ActivatedRoute } from '@angular/router';
import {DateMaskModule} from "@directives/date-mask.module";
import {NgxSpinnerService} from "ngx-spinner";
import {Subscription} from "rxjs";
import {MaestroService} from "@services/shared/maestro.service";
import {ReusableBuscarTramites} from "@services/reusables/reusable-buscar-tramites.service";

@Component({
  selector: 'app-filtrar-consulta-caso',
  standalone: true,
  templateUrl: './filtrar-consulta-caso.component.html',
  styleUrls: ['./filtrar-consulta-caso.component.scss'],
  providers: [DialogService, DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    DateMaskModule
  ]
})
export class FiltrarConsultaCasoComponent implements OnInit{


  @Output()
  search = new EventEmitter<FormFilter>();
  @Output()
  buscarTexto = new EventEmitter<string>();
  @Input()
  isLoading = false;

  @Input() generico = false;
  @Input() tipoProceso = 1;
  @Input() idEtapa:any = null;
  @Input() concluido = null;

  /*@Input()
  mostrarEtapa = false;*/
  @Input()
  id = null;

  idCaso: string = '';

  public mostrarFiltros = false

  isModoGrilla!: boolean;

  ordenarPor: SelectItem[] = [
    { label: 'Fecha de ingreso', value: 'fecha_ingreso' },
    { label: 'Fecha del último trámite', value: 'fecha_ultimo_tramite' },
  ];

  tipoProcesos: SelectItem[] = []
  subtipoProcesos: SelectItem[] = []
  etapas: SelectItem[] = []
  actoProcesales: SelectItem[] = []
  tramites: SelectItem[] = []

  mostrarProceso: boolean = false;
  mostrarSubtipo: boolean = false;
  mostrarEtapa: boolean = false;

  subscriptions: Subscription[] = [];

  form!: FormGroup;

  SORT = [{ label: 'Ascendente', value: 'asc' }, { label: 'Descendente', value: 'desc' }];
  public refModal!: DynamicDialogRef;
  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private Casos: Casos,
    private dataService: DataService,
    private maestrosService: MaestroService,
    private buscarTramitesService: ReusableBuscarTramites,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    ) {

      /*this.Casos.getEtapas().subscribe((data:any) => {
        this.etapas = data.data.map( item => ({ value:item.codigo,label:item.nombre }))
        if (this.etapas.length > 0) {
          this.form.patchValue({
            etapa: this.etapas[0].value
          });

          this.Casos.getActoProcesal(this.form.value.etapa).subscribe((data:any)=>{
            this.actoProcesales = data.data.map(item => ({ value:item.codigo,label:item.nombre }))
            if(this.actoProcesales.length>0) {
              this.form.patchValue({
                actoProcesal: this.etapas[0].value
              });
            }

            this.Casos.getTramiteByActoProcesal(this.form.value.actoProcesal).subscribe((data:any) => {
              this.tramites = data.data.map(item => ({value:item.id,label:item.nombre}))
            })

          })
        }});*/

      this.dataService.modeGrid$.subscribe((valor) => {
        this.isModoGrilla = valor;
      });
      const queryParams = this.route.snapshot.queryParams;
      const parametroBuscar = queryParams['idCaso'];
      if (parametroBuscar) {
        this.form.patchValue({ buscar: parametroBuscar });
      }
    }

  ngOnInit(): void {
    this.formBuild();
    this.obtenerTipoProceso();
    this.obtenerSubtipoProceso((this.tipoProceso) ? this.tipoProceso : 1);
    this.evaluarParametros();
  }

  private formBuild(): void {

    this.form = this.fb.group({
      buscar: [null],
      filtroTiempo: [0],
      tipoFecha: ['0'],
      fechaInicio: [null],
      fechaFin: [null],
      proceso: [(this.tipoProceso) ? this.tipoProceso : 1],
      subtipoProceso: [null],
      etapa: [null],
      actoProcesal: [null],
      tramite: [null],
      ordenarPor: ['fecha_ingreso'],
      order: ['desc'],
    });
  }

  private evaluarParametros() {

    if (this.generico) {
      this.mostrarProceso = true;
      this.mostrarSubtipo = true;
      this.mostrarEtapa = true;
    } else if (this.tipoProceso === 1) {//COMUN
      this.mostrarProceso = false;
      this.mostrarSubtipo = false;
      this.mostrarEtapa = false;
    } else if (this.tipoProceso === 2) {//ESPECIAL
      this.mostrarProceso = false;
      this.mostrarSubtipo = true;
      this.mostrarEtapa = true;
    }


  }
    onEtapaChange(value: string) {
      this.updateActoProcesal(value);
    }

    private updateActoProcesal(etapaId: any): void {
      this.Casos.getActoProcesal(etapaId).subscribe((data: any) => {
        this.actoProcesales = data.data.map( (item:any) => ({ value: item.codigo, label: item.nombre }));

      });
    }

  buscar() {
    let body = {...this.form.value};
    body = {
      ...body,
      fechaInicio: body.fechaInicio ? this.datePipe.transform(body.fechaInicio, 'dd/MM/yyyy') : null,
      fechaFin: body.fechaFin ? this.datePipe.transform(body.fechaFin, 'dd/MM/yyyy') : null,
      etapa: body.etapa ? body.etapa : '0',
      actoProcesal: body.actoProcesal ? body.actoProcesal : '0',
      tramite: body.tramite ? body.tramite : '0',
    };
    this.search.emit({...body});
  }

  buscarSegunTexto() {
    const buscado = this.form.get('buscar')!.value;
    this.buscarTexto.emit(buscado);
  }

  clear() {
    this.refModal = this.dialogService.open(DelitosPartesDesacumularModalComponent, {
      showHeader: false,
      styleClass: 'desacumular_caso_modal',
      contentStyle: { 'max-width': '1200px' },
      data: {
        caso: {},
      },
    });
    this.form.reset();
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }


  private obtenerTiposTramite(idActoProcesal:string): void {

    this.Casos.getTramiteByActoProcesal(idActoProcesal).subscribe((data: any) => {
      this.tramites = data.data.map( (item:any) => ({value:item.id,label:item.nombre}))
    });
  }


  public eventoCambiarTramite(item: any) {
    const idActoProcesal = item.value;
    this.obtenerTiposTramite(idActoProcesal);
  }

  public eventoCambiarFiltroTiempo(filtroTiempo: any) {
    let body = {filtroTiempo: filtroTiempo};
    this.search.emit({...body});
  }

  public eventoCambiarTipoProceso(idTipoProceso: any) {
    this.resetearSubtipoProceso();
    this.resetearEtapa();
    this.resetearActoProcesal();
    this.resetearTramite();
    if (idTipoProceso !== null) {
      this.obtenerSubtipoProceso(idTipoProceso);
    }
  }

  public eventoCambiarSubtipoProceso(idSubtipoProceso: any) {
    this.resetearEtapa();
    this.resetearActoProcesal();
    this.resetearTramite();
    if (idSubtipoProceso !== null) {
      const idProceso = this.form.get('proceso')!.value;
      this.obtenerEtapas(idProceso, idSubtipoProceso);
    }
  }

  public eventoCambiarEtapa(idEtapa: any) {
    this.resetearActoProcesal();
    this.resetearTramite();
    if (idEtapa !== null) {
      this.obtenerActosProcesales(idEtapa);
    }
  }

  public eventoCambiarActoProcesal(idActoProcesal: any) {
    this.resetearTramite();
    if (idActoProcesal !== null) {
      this.obtenerTiposTramite(idActoProcesal);
    }
  }

  private resetearSubtipoProceso() {
    this.form.get('subtipoProceso')!.reset();
    this.subtipoProcesos = [];
  }

  private resetearEtapa() {
    this.form.get('etapa')!.reset();
    this.etapas = [];
  }

  private resetearActoProcesal() {
    this.form.get('actoProcesal')!.reset();
    this.actoProcesales = [];
  }

  private resetearTramite() {
    this.form.get('tramite')!.reset();
    this.tramites = [];
  }

  private obtenerTipoProceso(): void {
    this.spinner.show();
    this.subscriptions.push(
      this.maestrosService.obtenerTipoProceso().subscribe({
        next: resp => {
          this.tipoProcesos = resp.data.map( (item:any) => ({value: item.id, label: item.nombre}));
          this.spinner.hide();
        },
        error: error => {
          console.log(error);
          this.spinner.hide();
        }
      })
    );
  }

  private obtenerSubtipoProceso(proceso: number) {
    this.spinner.show();
    this.subscriptions.push(
      this.maestrosService.obtenerSubtipoProcesos(proceso).subscribe({
        next: resp => {
          this.subtipoProcesos = resp.map( (item:any) => ({value: item.id, label: item.nombre}));
          this.form.patchValue({
            subtipoProceso: this.subtipoProcesos[0].value
          });
          this.eventoCambiarSubtipoProceso(this.subtipoProcesos[0].value);
          this.spinner.hide();
        },
        error: error => {
          console.log(error);
          this.spinner.hide();
        }
      })
    )
  }

  obtenerEtapas(proceso: number, subtipoProceso: string,) {
    this.spinner.show();
    this.subscriptions.push(
      this.maestrosService.obtenerEtapas(proceso, subtipoProceso).subscribe({
        next: resp => {
          this.etapas = resp.map( (item:any) => ({value: item.id, label: item.nombre}));
          if (this.idEtapa) {
            this.form.patchValue({
              etapa: this.idEtapa
            });
            this.obtenerActosProcesales(this.idEtapa);
          }
          this.spinner.hide();
        },
        error: error => {
          console.log(error);
          this.spinner.hide();
        }
      })
    )
  }

  obtenerActosProcesales(etapa: string) {
    this.spinner.show();
    this.subscriptions.push(
      this.maestrosService.obtenerActosProcesales(etapa).subscribe({
        next: resp => {
          this.actoProcesales = resp.map( (item:any) => ({value: item.id, label: item.nombre}));
          this.spinner.hide();
        },
        error: error => {
          console.log(error)
          this.spinner.hide();
        }
      })
    )
  }


}
