import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {MenuModule} from 'primeng/menu';
import {TableModule} from 'primeng/table';
import {CalendarModule} from 'primeng/calendar';
import {DateMaskModule} from '@directives/date-mask.module';
import {InputTextModule} from 'primeng/inputtext';
import {RadioButtonModule} from 'primeng/radiobutton';
import {MessageService} from 'primeng/api';
import {DialogService, DynamicDialogConfig} from 'primeng/dynamicdialog';
import {MensajeNotificacionService} from '@services/shared/mensaje.service';
import {IconUtil } from 'ngx-cfng-core-lib';
import {SujetosProcesales} from '@core/interfaces/comunes/SujetosProcesales';
import {TipoArchivoType} from '@core/types/exportar.type';
import {debounceTime, distinctUntilChanged, Subscription} from 'rxjs';
import {MaestroService} from '@services/shared/maestro.service';
import {ExportarService} from '@services/shared/exportar.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {SujetoProcesalService} from '@services/provincial/sujeto-procesal/sujeto-procesal.service';
import {TIPO_RESULTADO_INSTANCIA} from 'ngx-cfng-core-lib';
import {
  VerTrazabilidadResultadoComponent
} from '@components/modals/ver-trazabilidad-resultado/ver-trazabilidad-resultado.component';
import {GestionCasoService} from "@services/shared/gestion-caso.service";
import {Expediente} from "@utils/expediente";

@Component({
  selector: 'app-sujetos-procesales',
  standalone: true,
  templateUrl: './sujetos-procesales.component.html',
  styleUrls: ['./sujetos-procesales.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CmpLibModule,
    MenuModule,
    TableModule,
    CalendarModule,
    DateMaskModule,
    InputTextModule,
    RadioButtonModule
  ],
  providers: [MessageService, DialogService, MensajeNotificacionService]
})
export class SujetosProcesalesComponent implements OnInit {

  private caso!: Expediente;
  public formSujetoProcesal!: FormGroup;
  public sujetosProcesales!: SujetosProcesales[];
  public sujetosProcesalesFiltrados: SujetosProcesales[] = [];
  public totalSujetosProcesales!: number;
  public suscripciones: Subscription[] = [];
  tiposSujetoProcesal: any[] = [];
  public mostrarFiltros = false;
  public tipoInstaciaInfundado = TIPO_RESULTADO_INSTANCIA.INFUNDADO;

  constructor(
    private formulario: FormBuilder,
    private maestroService: MaestroService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private exportarService: ExportarService,
    private gestionCasoService: GestionCasoService,
    private mensajeService: MensajeNotificacionService,
    private sujetoProcesalService: SujetoProcesalService,
    private sppiner: NgxSpinnerService,
    protected iconUtil: IconUtil
  ) { }

  ngOnInit(): void {
    this.caso = this.gestionCasoService.casoActual;
    this.formInicio();
    this.loadTiposSujetoProcesal();
    this.loadListaSujetosProcesales();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(subscription => subscription.unsubscribe())
  }

  private formInicio(): void {

    this.formSujetoProcesal = this.formulario.group({
      buscar: [''],
      tipoSujetoProcesal: [''],
    });

    this.busquedaDinamica()
  }

  loadTiposSujetoProcesal() {
    this.suscripciones.push(
      this.maestroService.obtenerTipoParteSujeto().subscribe(
        (result: any) => {
          this.tiposSujetoProcesal = result.data;
        }
      )
    )
  };

  loadListaSujetosProcesales() {
    const idCaso = this.caso.idCaso;
    const idTipoSujeto = 0;
    this.suscripciones.push(
      this.sujetoProcesalService.obternerListaSujetosProcesales(idCaso, idTipoSujeto)
        .subscribe((result: any) => {
          this.sujetosProcesales = result;
          this.totalSujetosProcesales = this.sujetosProcesales.length;
          this.sujetosProcesalesFiltrados = [...this.sujetosProcesales];
        })
    )
  }

  private busquedaDinamica(): void {
    this.formSujetoProcesal.get('buscar')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.filtrarSujetoProcesalPorCampo();
      })
  }

  public filtrarSujetoProcesalPorCampo(): void {
    if (this.formSujetoProcesal.valid) {
      const textoBusqueda = this.formSujetoProcesal.get('buscar')!.value;
      if (!textoBusqueda) {
        this.sujetosProcesalesFiltrados = [...this.sujetosProcesales];
      } else {
        this.sujetosProcesalesFiltrados = this.sujetosProcesales.filter((data) =>
          Object.values(data).some(
            (fieldValue: any) =>
              (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
              fieldValue?.toString()?.toLowerCase().includes(textoBusqueda.toLowerCase())
          )
        );
      }
    }
  }

  public obtenerSujetoProcesalConFiltro(): void {
    const criterioBusqueda = this.obtenerNombrePorId(this.formSujetoProcesal.get('tipoSujetoProcesal')!.value)!;
    console.log(this.formSujetoProcesal.get('tipoSujetoProcesal')!.value);
    console.log(criterioBusqueda);
    this.filtrarSujetosProcesales(criterioBusqueda);
  }

  obtenerNombrePorId(idBuscado: number): string | undefined {
    const elementoEncontrado = this.tiposSujetoProcesal.find(opcion => opcion.id === idBuscado);
    return elementoEncontrado ? elementoEncontrado.nombre : undefined;
  }

  public filtrarSujetosProcesales(value: string): void {
    this.sujetosProcesalesFiltrados = this.sujetosProcesales.filter(item =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue?.toString()?.toLowerCase().includes(value?.toLowerCase())
      )
    );
  }

  protected agregarSujetosProcesales(){
    const dialogAgregarSujetosProcesales = this.dialogService.open(AgregarSujetosProcesalesComponent, {
      width: '900px',
      showHeader: false,
      contentStyle: { padding: 0 },
    } as DynamicDialogConfig<AgregarSujetosProcesalesComponent>);
  }

  protected verTrazabilidad(){
    const dialogVerTrazabilidad = this.dialogService.open(VerTrazabilidadResultadoComponent, {
      width: '900px',
      showHeader: false,
    } as DynamicDialogConfig<VerTrazabilidadResultadoComponent>);
  }

  protected eliminarSujetoProcesal(idSujetoCaso: string, idSujetosSubcarpeta: string ): void {
    //TODO
    /*
    let request: EliminarSujetoProcesalRequest = {
      idSujetoCaso: idSujetoCaso,
      idSujetoProcesalCarpeta: idSujetosSubcarpeta,
      flagAcccion: ""
    }
    const dialoEliminarSujetoProcesal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Confirmar quitar el sujeto procesal`,
        description: `Por favor confirme quitar el sujeto procesal de este cuaderno`,
        confirmButtonText: 'Eliminar',
        confirm: true,
      }
    } as DynamicDialogConfig<AlertaData>);

    dialoEliminarSujetoProcesal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.suscripciones.push(
            this.sujetoProcesalService.eliminarSujetoProcesal(request)
              .subscribe({
                next: (data) => {
                  if (data) {
                    this.loadListaSujetosProcesales();
                    this.mensajeService.verMensajeNotificacion('Sujeto quitado correctamente', 'Se quitó correctamente el sujeto de este cuaderno', 'success');
                  }
                },
                error: () => {
                  this.mensajeService.verMensajeErrorServicio();
                }
              })
          )
        }
      }
    })*/
  }

  public obtenerClaseDeNumeroDocumento(name: string): string {
    return name.replaceAll(' ', '-').toLowerCase()
  }

  public eventoMostrarOcultarFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public limpiarFiltros(): void {
    this.formSujetoProcesal.reset();
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.sujetosProcesales.length > 0) {
      const headers = ['Tipo de Sujeto Procesal', 'Número de Documento', 'Tipo de Documento', 'Nombres y Apellidos / Razón Social', 'Alias', '']
      const data:any[] = [];

      this.sujetosProcesales.forEach((sp: SujetosProcesales) => {
        const row = {
          'Tipo de Sujeto Procesal': sp.tipoSujetoProcesal,
          'Número de Documento': sp.numeroDocumento,
          'Tipo de Documento': sp.documentoIdentidad,
          'Nombres y Apellidos / Razón Social': sp.datosPersonales,
          'Alias': sp.alias,
          '': sp.parteValidada
        }
        data.push(row)
      })
      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'sujetos_procesales', 'landscape')
        : this.exportarService.exportarAExcel(data, headers, 'sujetos_procesales')
      return;
    }
    this.messageService.add({ severity: 'warn', detail: `No se encontraron registros para ser exportados a ${exportType}` })
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public mostrarDelitos(delito:any): string {
    console.log(delito);
    if (delito && Object.keys(delito).length > 0) {
      console.log(delito);
      return Object.values(delito).map( (item:any) => item.toString().toLowerCase()).join(' / ');
    } else {
      return '-';
    }
  }

}
