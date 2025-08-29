import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CasoAcumuladoRequest } from '@interfaces/provincial/tramites/acumulacion/CasoAcumuladoRequest';
import { CasoFiscal } from '@core/interfaces/comunes/casosFiscales';
import { CasosAcumuladosService } from '@services/provincial/acumulacion/casos-acumulados.service';
import { obtenerRutaParaEtapa } from '@utils/utils';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { IconUtil, DateFormatPipe } from 'ngx-cfng-core-lib';

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

  private casoFiscal: CasoFiscal;
  protected casoAcumulado = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public datePipe: DatePipe,
    private router: Router,
    private casosAcumuladosService: CasosAcumuladosService,
    protected iconUtil: IconUtil
  ) {
    this.casoFiscal = config.data.casoFiscal;
  }

  ngOnInit() {
    this.obtenerCasosAcumulados();
    console.log(this.casoFiscal.idCaso);
  }

  close() {
    this.ref.close();
  }

  verCaso(idCaso: any) {
    const queryParams = { idCaso: idCaso };
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(this.casoFiscal.idEtapa!)}`;
    this.ref.close();
    this.router.navigate([`${ruta}`], { queryParams: queryParams })
  }

  private obtenerCasosAcumulados(): void {
    let request: CasoAcumuladoRequest = {
      codigoCasoPadre: this.casoFiscal.idCaso!
    }
    this.casosAcumuladosService.obtenerCasoAcumulado(request).subscribe({
      next: resp => {
        this.casoAcumulado = resp;
        console.log(resp);
      },
      error: (error) => {
      }
    })
  }

}
