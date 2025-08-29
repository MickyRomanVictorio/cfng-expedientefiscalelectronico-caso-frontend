import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { DesagregarCasoService } from '@core/services/provincial/desagregar/desagregar-caso.service';
import { GrupoPartesDelitos } from '@core/interfaces/provincial/administracion-casos/desagregar/GrupoPartesDelitosDesagregados';

@Component({
  standalone: true,
  selector: 'app-desagregacion-caso',
  templateUrl: './desagregacion-caso.component.html',
  styleUrls: ['./desagregacion-caso.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
  ],
  providers: [DatePipe]
})
export class DesagregacionCasoComponent implements OnInit {

  /**public readonly casoFiscal: CasoFiscal;**/
  public idCaso: string;
  public fechaDesagregacion: Date | null = null;
  public casoDesagregado: GrupoPartesDelitos[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public datePipe: DatePipe,
    protected stringUtil: StringUtil,
    private readonly desagregarCasoService: DesagregarCasoService,
    /**private readonly casoService: Casos,**/
    protected iconUtil: IconUtil
  ) {
    /**this.casoFiscal = config.data.casoFiscal;**/
    this.idCaso = config.data.idCaso;
  }

  ngOnInit() {
    this.obtenerCasoDesagregado();
  }

  close() {
    this.ref.close();
  }

  private obtenerCasoDesagregado(): void {
    const idCaso = this.idCaso;
    this.desagregarCasoService.obtenerGruposDesagregados(idCaso).subscribe({
      next: (resp) => {
        if (resp && resp.length > 0) {
          const fecha = resp[0].fechaCreacion;
          this.fechaDesagregacion = this.convertirAFecha(fecha);
        }
        this.casoDesagregado = this.agruparDelitosYPartes(resp);
      },
      error: (err) => {
        console.error('Error al obtener casos desagregados:', err);
      }
    });
  }

  private convertirAFecha(fechaStr: string): Date {
    // Reemplaza el espacio con 'T' para que sea compatible con el constructor de Date
    const isoString = fechaStr.replace(' ', 'T');
    return new Date(isoString);
  }

  public agruparDelitosYPartes(data: any[]): GrupoPartesDelitos[] {
    const map: { [key: string]: GrupoPartesDelitos } = {};
    let index = 1;

    data.forEach((item) => {
      const key = item.grupo;

      if (!map[key]) {
        map[key] = {
          orden: index++,
          grupo: item.grupo,
          idCaso: item.idCaso,
          coCaso: item.coCaso,
          partesSujetos: [],
          delitos: []
        };
      }

      const grupo = map[key];

      // Agregar sujeto si no existe aún
      const sujetoExiste = grupo.partesSujetos.some(s =>
        s.idSujetoCaso === item.idSujetoCaso
      );
      if (!sujetoExiste) {
        grupo.partesSujetos.push({
          idSujetoCaso: item.idSujetoCaso,
          partes: item.partes,
          numeroDocumento: item.numeroDocumento
        });
      }

      // Agregar delito si no existe aún
      const delitoExiste = grupo.delitos.some(d =>
        d.idDelitoGenerico === item.idDelito &&
        d.idDelitoSubgenerico === item.idDelitoSubGenerico &&
        d.idDelitoEspecifico === item.idDelitoEspecifico
      );
      if (!delitoExiste) {
        grupo.delitos.push({
          idDelitoGenerico: item.idDelito,
          noDelitoGenerico: item.delitoGenerico,
          idDelitoSubgenerico: item.idDelitoSubGenerico,
          noDelitoSubgenerico: item.delitoSubGenerico,
          idDelitoEspecifico: item.idDelitoEspecifico,
          noDelitoEspecifico: item.delitoEspecifico,
          labelDelito:
            item.delitoGenerico +
            '/' +
            item.delitoSubGenerico +
            '/' +
            item.delitoEspecifico,
        });
      }
    });

    return Object.values(map).sort((a, b) => a.orden - b.orden);
  }

}
