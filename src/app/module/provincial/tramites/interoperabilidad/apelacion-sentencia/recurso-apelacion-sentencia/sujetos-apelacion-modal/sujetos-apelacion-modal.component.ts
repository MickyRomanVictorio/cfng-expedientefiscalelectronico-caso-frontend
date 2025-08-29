import { NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatorComponent } from '@components/generales/paginator/paginator.component';
import { CapitalizePipe } from '@pipes/capitalize.pipe';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { obtenerIcono } from '@utils/icon';
import { SujetosProcesales } from '@interfaces/reusables/sujeto-procesal/sujetos-procesales.interface';
import { obtenerCasoHtml } from '@utils/utils';
import { TramiteService } from '@services/provincial/tramites/tramite.service';
import { NombrePropioPipe } from '@pipes/nombre-propio.pipe';
import { RecursoApelacionSentenciaService } from '@core/services/provincial/tramites/interoperabilidad/resolucion-auto/recurso-apelacion-sentencia.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: './sujetos-apelacion-modal.component.html',
  styleUrls: ['./sujetos-apelacion-modal.component.scss'],
  imports: [
    CmpLibModule,
    NgIf,
    ProgressBarModule,
    PaginatorComponent,
    CapitalizePipe,
    SharedModule,
    TableModule,
    DropdownModule,
    FormsModule,
    NombrePropioPipe,
  ],
})
export class SentenciaApelacionModalComponent implements OnInit {
  public tituloModal: SafeHtml | undefined = undefined;
  public query: any = { limit: 10, page: 1, where: {} };
  public itemPaginado: any = {
    isLoading: false,
    data: {
      data: [],
      pages: 0,
      perPage: 0,
      total: 0,
    },
  };
  public sujetosProcesalesModal: any[] = [];
  public sujetosProcesalesBackup: SujetosProcesales[] = [];
  public disableButtonAceptarModalSujetoProcesal: boolean = false;
  protected readonly obtenerIcono = obtenerIcono;

  public sujetosProcesales: SujetosProcesales[] = [];
  public sujetosProcesalesFiltrados: SujetosProcesales[] = [];
  public sujetosProcesalesSeleccionados: SujetosProcesales[] = [];
  public sujetosSeleccionados: SujetosProcesales[] = [];
  protected soloLectura: boolean = false;
  protected mostrarBtnAceptar: Boolean = false;
  protected numeroCaso: string = '';
  protected tituloCaso: SafeHtml = '';
  protected selectAllCheck: Boolean = false;
  protected activaPetitorio: boolean = false;
  protected activarPenaReparacionCivil: boolean = false;
  protected listaRespuesta: { id: number; nombre: string }[] = [
    { id: 1502, nombre: 'Nulidad' },
    { id: 1503, nombre: 'Revoca' },
    { id: 1504, nombre: 'Revoca y Nulidad' },
  ];
    private selectedSujetos: any = [];
    private idCaso: string = '';
  private idActoTramiteCaso: string = '';
  private readonly subscriptions: Subscription[] = [];
  constructor(
    private dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
    protected tramiteService: TramiteService,
    private readonly recursoApelacionSentencia: RecursoApelacionSentenciaService
  ) {}

  ngOnInit(): void {
      this.idCaso = this.config.data?.idCaso;
    this.idActoTramiteCaso = this.config.data?.idActoTramiteCaso;
    this.numeroCaso = this.config.data?.numeroCaso;
    this.soloLectura = this.config.data?.soloLectura || false;
    this.tituloModal =
      (this.soloLectura ? 'Ver' : 'Seleccionar') +
      ' sujetos a registrar apelación';
    this.tituloDelCaso();
    this.obtenerSujetosProcesales();
    this.disableButtonAceptarModalSujetoProcesal = true;
  }

  public cerrarModal(): void {
    this.dialogRef.close({
      button: 'aceptar',
      data: this.sujetosProcesales,
    });
  }

  cancelar() {
    this.dialogRef.close({
      button: 'cancelar',
      data: this.sujetosProcesalesFiltrados,
    });
  }

aceptar() {
    const seleccionados = this.sujetosProcesales.filter(
      (sujeto) => sujeto.sujetoSelected
    );
    this.selectedSujetos = seleccionados;
    console.log('Sujetos seleccionados:', this.selectedSujetos);
    this.eventoRegistrarSujetosProcesales();
  }

  onPaginate(evento: any) {
    this.query.page = evento.page;
    this.query.limit = evento.limit;
    this.updatePagedItems();
  }

  updatePagedItems() {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = this.sujetosProcesales.slice(
      start,
      end
    );
  }

  actualizarPaginaRegistros(data: any) {
    const start = (this.query.page - 1) * this.query.limit;
    const end = start + this.query.limit;
    this.sujetosProcesalesFiltrados = data.slice(start, end);
  }

  private tituloDelCaso(): void {
    const subTituloHtml = `${
      this.numeroCaso.endsWith('0') ? 'Número Caso: ' : 'Incidente: '
    } ${obtenerCasoHtml(this.numeroCaso)}`;
    this.tituloCaso = this.sanitizador.bypassSecurityTrustHtml(subTituloHtml);
  }



  verificarElementos() {
    console.log('Verificando elementos...', this.sujetosProcesalesFiltrados);
    const ccc = this.sujetosProcesalesFiltrados.filter(
      (sujeto) => sujeto.sujetoSelected 
    );
    console.log('Sujetos seleccionados:', ccc);
    if (ccc.length > 0) {
      this.mostrarBtnAceptar = ccc.every(
        (sujeto) => (sujeto.flApelacion === '1' && sujeto.idPetitorio && sujeto.idPetitorio !== 0) || (sujeto.flApelacion === '0' && sujeto.sujetoSelected )
      );
      this.sujetosProcesalesFiltrados
        .filter((sujeto) => sujeto.flApelacion === '1')
        .every((sujeto) => sujeto.idPetitorio && sujeto.idPetitorio !== 0);
    } else {
      this.mostrarBtnAceptar = false;
    }
    if (this.soloLectura) {
      this.mostrarBtnAceptar = false;
    }
  }
  private actualizarValoresSelection(): void {
    if (
      !this.config.data?.listSujetosProcesales ||
      this.config.data.listSujetosProcesales.length === 0
    ) {
      console.error('La lista listSujetosProcesales está vacía o no es válida');
      return;
    }

    const tempMap = new Map<string, string>();
    const tempMapResultado = new Map<string, string>();
    this.config.data.listSujetosProcesales.forEach((sujeto: any) => {
      tempMap.set(sujeto.idSujetoCaso, sujeto.flApelacion);
      if (sujeto.idActoTramiteResultadoSujeto && sujeto.idActoTramiteResultadoSujeto !="") {
        tempMapResultado.set(
          sujeto.idActoTramiteResultadoSujeto,
          sujeto.flApelacion
        );
      }
    });

    const sujetosActualizados = this.sujetosProcesalesFiltrados.map(
      (sujeto) => {
        if (
          tempMapResultado.size > 0 &&
          tempMapResultado.has(sujeto.idActoTramiteResultadoSujeto)
        ) {
          const flApelacion = tempMapResultado.get(
            sujeto.idActoTramiteResultadoSujeto
          );
          sujeto.flApelacion =
            flApelacion !== undefined ? flApelacion : sujeto.flApelacion;
        } else {
          if (tempMap.has(sujeto.idSujetoCaso)) {
            const flApelacion = tempMap.get(sujeto.idSujetoCaso);
            sujeto.flApelacion =
              flApelacion !== undefined ? flApelacion : sujeto.flApelacion;
          }
        }

        return sujeto;
      }
    );

    this.sujetosProcesalesFiltrados = sujetosActualizados;
    this.sujetosProcesalesBackup = this.config.data.listSujetosProcesales;
  }

  onSelectionChange(item: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    item.flApelacion = checkbox.checked ? '1' : '0';
    item.sujetoSelected = true;
    item.selection = true;
    this.activaPetitorio = checkbox.checked;
    if (!checkbox.checked) {
      item.idPetitorio = null;
      item.flApelacionPena = '0';
      item.flApelacionReparacionCivil = '0';
      item.desactivoPenaReparacionCivil = true;
    }
    this.selectAllCheck = this.sujetosProcesalesFiltrados.every(
      (i) => i.flApelacion === '1'
    );

    this.verificarElementos();
  }
  onSelectionChangePena(item: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    item.sujetoSelected = true;
    item.selection = true;
    item.flApelacionPena = checkbox.checked ? '1' : '0';
    this.verificarElementos();
  }
    onSelectionChangeRCivil(item: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    item.sujetoSelected = true;
    item.selection = true;
    item.flApelacionReparacionCivil = checkbox.checked ? '1' : '0';
    this.verificarElementos();
  }
  seleccionarTodos(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectAllCheck = checkbox.checked;

    this.sujetosProcesalesFiltrados
      .forEach((item) => {
        item.flApelacion = this.selectAllCheck ? '1' : '0';
        item.sujetoSelected = true;
        if (!checkbox.checked) {
          item.idPetitorio = 0;
          item.flApelacionPena = '0';
          item.flApelacionReparacionCivil = '0';
        }
      });

    this.verificarElementos();
  }
  onSelectionPetitorio(item: any, event: any): void {
    console.log("ek event", event.value);
   item.sujetoSelected =true;
    item.selection = true;
   item.idPetitorio = event.value;
   if (event.value === 1502) {
      item.desactivoPenaReparacionCivil = true;
      item.flApelacionPena = '0';
      item.flApelacionReparacionCivil = '0';
    } else if (event.value === 1503 || event.value === 1504) {
      item.desactivoPenaReparacionCivil = false;
    } else if(event.value === null) {
      item.desactivoPenaReparacionCivil = true;
      item.flApelacionPena = '0';
      item.flApelacionReparacionCivil = '0';
    }
    this.verificarElementos();
  }
   protected eventoRegistrarSujetosProcesales() {
    if(this.selectedSujetos.length === 0) {
      console.log('No hay sujetos seleccionados para registrar.');
      this.cerrarModal();
      return;
    }
    const data: any = {
      idCaso: this.idCaso,
      idActoTramiteCaso: this.idActoTramiteCaso,
      listSujetos: this.selectedSujetos,
    };
    console.log('Datos a enviar:', data);
    this.subscriptions.push(
      this.recursoApelacionSentencia
        .registrarTramite(data)
        .subscribe({
          next: (resp) => {
            console.log('Respuesta de registrarTramite:', resp);
            if (resp.codigo === 0) {
            this.cerrarModal();
            }
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

    private obtenerSujetosProcesales(): void {
    this.sujetosProcesales = [];
    this.subscriptions.push(
      this.recursoApelacionSentencia
        .obtenerResultadosSentencia(this.idActoTramiteCaso)
        .subscribe({
          next: (resp) => {
            console.log('Respuesta de obtenerResultadosSentencia:', resp);
            this.sujetosProcesales = resp
              .map((sujeto: any) => ({
                ...sujeto,
                sujetoSelected: false,
                selection: false,
                desactivoPenaReparacionCivil: (sujeto.idPetitorio === 1502 || sujeto.idPetitorio === 0) ? true : false,
              //  flApelacionPena: (sujeto.idPetitorio === 1502 || sujeto.idPetitorio === 0) ? '0' : '1',
              }))
              .sort((a: any, b: any) => {
                // Mostrar primero los elementos con estadoQueja igual a null o 0

                // Ordenar por idTipoRespuestaInstancia1: 1048 primero, luego 1492, y luego el resto
                //  const order = [1024 , 1062];
                // Priorizar por idTipoRespuestaInstancia1 = 1048
                const getPriority = (item: any) => {
                  if (item.idTipoSentencia === 1334 ) return 1;
                  if (item.idTipoSentencia === 1381 ) return 2;
                  if (item.idTipoSentencia !== 1334 && item.idTipoSentencia !== 1381) return 3;
                 return 4;
                };

                const priorityA = getPriority(a);
                const priorityB = getPriority(b);

                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }
                // Si tienen la misma prioridad, mantener el orden original
               

                return 0;
              });
          
            this.sujetosProcesalesFiltrados = this.sujetosProcesales;
            this.verificarElementos();
console.log('Sujetos procesales filtrados:', this.sujetosProcesalesFiltrados);
            this.sujetosProcesalesSeleccionados = [];
            this.itemPaginado.data.data = this.sujetosProcesalesFiltrados;
            this.itemPaginado.data.total = this.sujetosProcesales.length;
            this.actualizarPaginaRegistros(this.sujetosProcesales);
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }
}
