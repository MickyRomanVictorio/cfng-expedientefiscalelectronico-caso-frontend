import { Component, OnInit, signal } from '@angular/core';
import { BandejaFiscaliaSuperiorService } from '@core/services/superior/bandeja/bandeja-fiscalia-superior';
import { Subscription } from 'rxjs';
import { IndicadorComponent } from './indicador/indicador.component';
import { Router } from '@angular/router';
import { EncabezadoTooltipComponent } from '../../../../core/components/modals/encabezado-tooltip/encabezado-tooltip.component';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconAsset, IconUtil } from 'ngx-cfng-core-lib';
import { CmpLibModule } from 'dist/cmp-lib';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resumen-superior',
  standalone: true,
  imports: [IndicadorComponent, EncabezadoTooltipComponent, CmpLibModule, CommonModule],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.scss',
})
export class ResumenComponent implements OnInit {
  public subscriptions: Subscription[] = [];
  protected tituloTootip: string = 'Estas tarjetas muestran el resumen de casos elevados a tu despacho.';
  public referenciaModal!: DynamicDialogRef;
public tooltipVisible: boolean = false;
  protected listaIndicadores = signal<any[]>([]);
  private tipoPestanaApelacion = [
    {
      idTipoElevacion: 726,
      titulo: 'Apelación de auto',
      cantidadCasos: 0,
    },
    {
      idTipoElevacion: 727,
      titulo: 'Apelación de sentencia',
      cantidadCasos: 0,
    },
  ];
  private actosElevacionConsulta = [
    {
      idActoProcesal: '000023',
      titulo: 'Sobreseimiento',
      cantidadCasos: 0,
    },
    {
      idActoProcesal: '000024',
      titulo: 'Requerimiento mixto',
      cantidadCasos: 0,
    },
    {
      idActoProcesal: '000002',
      titulo: 'Con acumulación',
      cantidadCasos: 0,
    },
  ];
  private actosElevacionActuados = [
    {
      idActoProcesal: '000001',
      titulo: 'Acuerdo reparatorio',
      cantidadCasos: 0,
    },
    {
      idActoProcesal: '000004',
      titulo: 'Archivar caso',
      cantidadCasos: 0,
    },
    {
      idActoProcesal: '000011',
      titulo: 'Principio de oportunidad',
      cantidadCasos: 0,
    },
    {
      idActoProcesal: '000108',
      titulo: 'Reapertura de investigación',
      cantidadCasos: 0,
    },
    {
      idActoProcesal: '000013',
      titulo: 'Reserva provisional',
      cantidadCasos: 0,
    },
  ];
  private ordenActosPorIdTipoElevacion = [
    724, // Actuados
    726,
    725, //Contienda
    728, // Consulta
    729, // Exclusion fiscal
    1028, // retiro de acusación
  ];
  protected tituloMasDetallesActos = 'Detalles de actos procesales';
  constructor(
    private readonly router: Router,
    private readonly bandejaFiscaliaSuperiorService: BandejaFiscaliaSuperiorService,
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset
  ) {}

  ngOnInit(): void {
    this.solocitarDatos();
  }
  toggleTooltip: () => void = () => {
    this.tooltipVisible = !this.tooltipVisible;
  };
  showTooltip(): void {
    if (!this.tooltipVisible) {
      this.tooltipVisible = true;
    }
  }
  private solocitarDatos() {
    this.subscriptions.push(
      this.bandejaFiscaliaSuperiorService
        .obtenerIndicadoresFiscaliaSuperior()
        .subscribe({
          next: (resp) => {
            console.log('Indicadores obtenidos:', resp);
            // Agrupar apelaciones
            const data = resp.data || [];
            let apelacionesCantidad = 0;
            let casosPorAsignar = 0;
            let casosAsignados = 0;
            let pendientesPronunciamiento = 0;

            const otrosIndicadores = [];

            data.forEach((item: any) => {
              if (
                item.idTipoElevacion === 726 ||
                item.idTipoElevacion === 727
              ) {
                item.idTipoElevacion === 726
                  ? (this.tipoPestanaApelacion[0].cantidadCasos += Number(
                      item.cantidadCasos
                    ))
                  : (this.tipoPestanaApelacion[0].cantidadCasos +=
                      Number(item.cantidadCasos) || 0);

                apelacionesCantidad += Number(item.cantidadCasos) || 0;
                casosPorAsignar += Number(item.casosPorAsignar) || 0;
                casosAsignados += Number(item.casosAsignados) || 0;
                pendientesPronunciamiento +=
                  Number(item.pendientesPronunciamiento) || 0;
                item.masDetallesActos = this.tipoPestanaApelacion;
                item.idTipoElevacion = 726; // Para evitar duplicados
              } else if (
                item.idTipoElevacion === 724 &&
                item.masDetallesActos
              ) {
                this.actosElevacionActuados.forEach((acto) => {
                  const detalle = item.masDetallesActos.find(
                    (d: any) => d.idActoProcesal === acto.idActoProcesal
                  );
                  if (detalle) {
                    acto.cantidadCasos = detalle.ntotalPorActo || 0;
                  }
                });
                item.masDetallesActos = this.actosElevacionActuados;
                item.tituloMasDetallesActos = 'Actos registrados al apelar';
                otrosIndicadores.push(item);
              } else if (item.idTipoElevacion === 728) {
                if (item.masDetallesActos && item.masDetallesActos.length > 0) {
                  this.actosElevacionConsulta.forEach((acto) => {
                    const detalle = item.masDetallesActos.find(
                      (d: any) => d.idActoProcesal === acto.idActoProcesal
                    );
                    if (detalle) {
                      acto.cantidadCasos = detalle.ntotalPorActo || 0;
                    }
                  });
                }
                item.masDetallesActos = this.actosElevacionConsulta;
                item.tituloMasDetallesActos = 'Actos registrados al apelar';
                otrosIndicadores.push(item);
              } else {
                otrosIndicadores.push(item);
              }
            });
            // if (apelacionesCantidad > 0) {
            otrosIndicadores.unshift({
              idTipoElevacion: 726, // Para mantener el orden
              titulo: 'APELACIONES',
              cantidadCasos: apelacionesCantidad,
              fondo: 'fondoVerde',
              casosPorAsignar: casosPorAsignar,
              casosAsignados: casosAsignados,
              pendientesPronunciamiento: pendientesPronunciamiento,
              masDetallesActos: this.tipoPestanaApelacion,
              tituloMasDetallesActos: 'Tipos de pestanas de apelación',
              // Puedes agregar aquí otras propiedades necesarias por tu UI
            });
            //  }
            otrosIndicadores.sort((a: any, b: any) => {
              const idxA = this.ordenActosPorIdTipoElevacion.indexOf(
                a.idTipoElevacion
              );
              const idxB = this.ordenActosPorIdTipoElevacion.indexOf(
                b.idTipoElevacion
              );
              return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
            });
            this.listaIndicadores.set(otrosIndicadores);
          },
        })
    );
  }

  protected navigate(route: string) {
    this.router.navigate([
      './app/administracion-casossuperior/bandejas/' + route,
    ]);
  }
}
