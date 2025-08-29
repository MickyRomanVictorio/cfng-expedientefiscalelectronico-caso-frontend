import { CasoFiscal, Delito } from '@core/interfaces/comunes/casosFiscales';
import { Component, Input, OnInit } from '@angular/core';

import { BarraProgresoCasoComponent } from './barra-progreso-caso/barra-progreso-caso.component';
import { ButtonModule } from 'primeng/button';
import { Casos } from '@services/provincial/consulta-casos/consultacasos.service';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NotaAdhesivaComponent } from './notas-adhesivas/nota-adhesiva/nota-adhesiva.component';
import { PendientesCasoComponent } from './pendientes-caso/pendientes-caso.component';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { obtenerRutaParaEtapa } from '@utils/utils';
//import { StorageService } from '@core/services/shared/storage.service';
import { LOCALSTORAGE } from '@environments/environment';
import { EtiquetaAccionesCasoComponent } from './etiqueta-acciones-caso/etiqueta-acciones-caso.component';
import { DateFormatPipe } from '@pipes/format-date.pipe';
import { CasoStorageService } from '@services/shared/caso-storage.service';

@Component({
  selector: 'app-carpeta-caso',
  standalone: true,
  imports: [
    CommonModule,
    NotaAdhesivaComponent,
    BarraProgresoCasoComponent,
    PendientesCasoComponent,
    EtiquetaAccionesCasoComponent,
    ButtonModule,
    DialogModule,
    TableModule,
  ],
  providers: [DatePipe],
  templateUrl: './carpeta-caso.component.html',
  styleUrls: ['./carpeta-caso.component.scss'],
})
export class CarpetaCasoComponent implements OnInit {
  @Input()
  public casofiscal: CasoFiscal;
  protected visible: boolean = false;
  protected estadoCaso: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    public datePipe: DatePipe,
    private router: Router,
    private Casos: Casos,
    private casoStorageService: CasoStorageService
  ) {
    this.casofiscal = {};
  }

  ngOnInit(): void {
    let estadoCaso = this.casofiscal.plazos!.filter(
      (x) => x.flgNivel == 'C' && x.indSemaforo == 3
    );
    this.estadoCaso = estadoCaso.length > 0 ? true : false;
  }

  showCasos() {
    this.actualizarEstadoLeido(this.casofiscal.idCaso!);
    this.visible = true;
  }

  colorizeCode(code: any) {
    code = code.concat('-0');
    const parts = code.split('-');
    if (parts.length > 3) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `${parts[0]}-<span style="color:orange" >${parts[1]}-${parts[2]}</span>-${parts[3]}`
      );
    }
    return code;
  }

  flatDelitos(delitos: any) {
    const result = delitos
      .slice(0, 2)
      .map((curr: any) =>
        curr.nombre
          .toLowerCase()
          .replace(/^\w/, (match: any) => match.toUpperCase())
      )
      .join(', ');
    return result.length > 20 ? result.substring(0, 20) + '...' : result;
  }

  actualizarEstadoLeido(idCaso: string) {
    if (this.casofiscal.flgCasoLeido === '0') {
      this.Casos.updateEstadoLeido(idCaso || this.casofiscal.idCaso!).subscribe(
        (data: any) => {
          this.casofiscal.flgCasoLeido = '1';
        }
      );
    }
  }

  public abrirDetalleCaso(caso: CasoFiscal): void {
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(
      caso.idEtapa!
    )}/caso/${caso.idCaso}`;
    this.router.navigate([`${ruta}`]);
    this.casoStorageService.setearSesionStorageCaso(caso);
    this.casoStorageService.setearTabDetalle('0');
  }
}
