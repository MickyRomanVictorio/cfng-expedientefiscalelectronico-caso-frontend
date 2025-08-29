import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  CasoFiscal,
  Delito,
  FormFilter,
} from '@core/interfaces/comunes/casosFiscales';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { ExportarService } from '@services/shared/exportar.service';
import { TipoArchivoType } from '@core/types/exportar.type';
import { obtenerRutaParaEtapa } from '@utils/utils';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TableModule } from 'primeng/table';
import { CarpetaCasoComponent } from '../carpeta-caso/carpeta-caso.component';
import { Router } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { BarraProgresoCasoComponent } from '../carpeta-caso/barra-progreso-caso/barra-progreso-caso.component';
import { DataService } from '../../DataService';
import { ElevacionActuadosSuperiorService } from '@services/reusables/superior/emitir-pronunciamiento/elevacion-actuados-superior-service';

type DataViewType = 'list' | 'grid';
@Component({
  standalone: true,
  selector: 'app-grilla-casos',
  templateUrl: './grilla-casos.component.html',
  styleUrls: ['./grilla-casos.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DataViewModule,
    CarpetaCasoComponent,
    TagModule,
    BarraProgresoCasoComponent,
  ],
})
export class ListaCasosGridComponent {
  @Input()
  filterObj: FormFilter = {};
  @Input()
  textoBuscado!: string;
  @Output()
  loading = new EventEmitter<boolean>();

  isLoading = false;

  protected isGrid = true;
  protected SHOW_ROWS = 9;
  protected FIRST = 0;

  protected casosfiscales: CasoFiscal[] = [];
  protected casosfiscalesInicial: CasoFiscal[] = [];
  constructor(
    @Inject(Casos) private Casos: Casos,
    private sanitizer: DomSanitizer,
    private router: Router,
    private exportarService: ExportarService,
    private dataService: DataService,
    private elevacionActuadosSuperior: ElevacionActuadosSuperiorService
  ) {
    this.casosfiscales = [];
  }
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    const filter = changes['filterObj'];
    console.log(filter);
    if (filter) {
      console.log('current');
      console.log(filter.currentValue ?? {});

      this.isLoading = true;
      const d = filter.currentValue ?? {};
      this.elevacionActuadosSuperior
        .getCasosFiscalesElevacionSuperior(d)
        .subscribe((data) => {
          console.log(data.data[0]);

          this.casosfiscales = data.data;
          this.casosfiscalesInicial = data.data;
          console.log(this.casosfiscales);
          this.isLoading = false;
        });
    }

    const buscado = changes['textoBuscado'];
    console.log(buscado);
    if (buscado) {
      const texto = buscado.currentValue;
      this.buscarTexto(texto);
    }
  }

  changeViewType($event: MouseEvent, type: DataViewType) {
    this.isGrid = type === 'grid';
    this.dataService.actualizarPropiedad(this.isGrid);
    $event.preventDefault();
  }

  changePage($event: { first: number; rows: number }) {
    this.FIRST = $event.first;
  }

  public exportar(exportType: TipoArchivoType): void {
    if (this.casosfiscales.length > 0) {
      const headers = [
        'Número de caso',
        'Etapa',
        'Fiscal',
        'F. Registro',
        'F Último Trámite',
        'Último Acceso Procesal',
      ];
      const data: any[] = [];

      this.casosfiscales.forEach((c: CasoFiscal) => {
        console.log(c);

        const row = {
          'Número de caso': c.numeroCaso,
          Etapa: c.etapa,
          Fiscal: c.fiscal,
          //'Delitos': c.delitos,
          'F. Registro': c.fechaIngreso,
          'F Último Trámite': c.fechaUltimoTramite,
          'Último Acceso Procesal': c.ultimoTramite,
        };
        data.push(row);
      });

      exportType === 'PDF'
        ? this.exportarService.exportarAPdf(data, headers, 'Casos Fiscales')
        : this.exportarService.exportarAExcel(data, headers, 'Casos Fiscales');
      return;
    }
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  colorizeCode(code: string) {
    code = code.concat('-0');
    const parts = code.split('-');
    if (parts.length > 3) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `${parts[0]}-<span style="color:orange" >${parts[1]}-${parts[2]}</span>-${parts[3]}`
      );
    }
    return code;
  }

  flatDelitos(delitos: Delito[]): string {
    return delitos.map((curr) => curr.nombre).join(', ');
  }

  public abrirDetalleCaso(caso: CasoFiscal): void {
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(
      caso.etapa!
    )}/caso/${caso.numeroCaso}`;
    this.router.navigate([`${ruta}`]);
  }

  getTextColor(hexColor: string): string {
    if (!hexColor) {
      return 'black';
    }
    // Convert the hexadecimal color to RGB values
    hexColor = hexColor.replace(/^#/, '');
    const r = parseInt(hexColor.slice(0, 2), 16) / 255;
    const g = parseInt(hexColor.slice(2, 4), 16) / 255;
    const b = parseInt(hexColor.slice(4, 6), 16) / 255;

    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Decide text color based on background luminance
    if (luminance > 0.5) {
      return 'black'; // Use black text for light backgrounds
    } else {
      return 'white'; // Use white text for dark backgrounds
    }
  }

  buscarTexto(buscado: string) {
    if (this.casosfiscales === undefined || this.casosfiscales.length === 0) {
      return;
    }
    if (!buscado) {
      this.casosfiscales = this.casosfiscalesInicial;
    } else {
      this.casosfiscales = this.casosfiscalesInicial.filter((data) =>
        Object.values(data).some(
          (fieldValue: any) =>
            (typeof fieldValue === 'string' ||
              typeof fieldValue === 'number') &&
            fieldValue
              ?.toString()
              ?.toLowerCase()
              .includes(buscado.toLowerCase())
        )
      );
    }
  }
}
