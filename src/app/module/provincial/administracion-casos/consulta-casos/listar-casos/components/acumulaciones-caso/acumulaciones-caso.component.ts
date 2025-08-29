import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CasoAcumuladoRequest } from '@interfaces/provincial/tramites/acumulacion/CasoAcumuladoRequest';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { CasosAcumuladosService } from '@services/provincial/acumulacion/casos-acumulados.service';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { IconUtil, DateFormatPipe, StringUtil } from 'ngx-cfng-core-lib';
import { Casos } from '@core/services/provincial/consulta-casos/consultacasos.service';
import { Expediente } from '@core/utils/expediente';
import { urlConsultaCasoFiscal } from '@core/utils/utils';

@Component({
  standalone: true,
  selector: 'app-acumulaciones-caso',
  templateUrl: './acumulaciones-caso.component.html',
  styleUrls: ['./acumulaciones-caso.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    TableModule,
    DateFormatPipe
  ],
  providers: [DatePipe]
})
export class AcumulacionesCasoComponent implements OnInit {

  public readonly casoFiscal: CasoFiscal;
  protected casoAcumulado = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public datePipe: DatePipe,
    protected stringUtil: StringUtil,
    private readonly router: Router,
    private readonly casosAcumuladosService: CasosAcumuladosService,
    private readonly casoService: Casos,
    protected iconUtil: IconUtil
  ) {
    this.casoFiscal = config.data.casoFiscal;
  }

  ngOnInit() {
    this.obtenerCasosAcumulados();
  }

  close() {
    this.ref.close();
  }

  /**verCasoV1(idCaso: any) {
    const queryParams = { idCaso: idCaso };
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(this.casoFiscal.idEtapa!)}`;
    this.ref.close();
    this.router.navigate([`${ruta}`], { queryParams: queryParams })
  }**/

  verCaso(idCaso: any) {
    this.obtenerCaso(idCaso);
  }

  obtenerCaso(idCaso: string): void {
    this.casoService.obtenerCasoFiscal(idCaso).subscribe({
      next: (resp: Expediente) => {
        const ruta = urlConsultaCasoFiscal({
          idEtapa: resp.idEtapa,
          idCaso: resp.idCaso,
          flgConcluido: resp.flgConcluido?.toString()
        });
        
        const destino = `${ruta}/acto-procesal`;
        this.ref.close();

        // Navegar a una ruta temporal invisible para forzar recarga
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([destino]);
        });
      },
      error: (error) => {
        console.error('Error al obtener el caso:', error);
      },
    });
}

  private obtenerCasosAcumulados(): void {
    let request: CasoAcumuladoRequest = {
      codigoCasoPadre: this.casoFiscal.idCaso!
    }
    this.casosAcumuladosService.obtenerCasoAcumulado(request).subscribe({
      next: resp => {
        this.casoAcumulado = resp;
      },
      error: (error) => {
      }
    })
  }

}
