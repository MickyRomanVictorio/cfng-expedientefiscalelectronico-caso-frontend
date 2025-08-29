import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { AcumulacionesCasoComponent } from '../../acumulaciones-caso/acumulaciones-caso.component';
import { DesacumulacionModalComponent } from "@modules/provincial/tramites/comun/calificacion/desacumulacion/desacumulacion-modal/desacumulacion-modal.component";
import { obtenerRutaParaEtapa } from '@utils/utils';
import { Router } from '@angular/router';
import { CasoStorageService } from '@services/shared/caso-storage.service';
import { StringUtil } from 'ngx-cfng-core-lib';

@Component({
  standalone: true,
  selector: 'app-etiqueta-acciones-caso',
  templateUrl: './etiqueta-acciones-caso.component.html',
  styleUrls: ['./etiqueta-acciones-caso.component.scss'],
  imports: [
    CommonModule,
  ],
  providers: [DialogService]
})
export class EtiquetaAccionesCasoComponent {

  @Input() casoFiscal!: any;

  constructor(
    private dialogService: DialogService,
    protected stringUtil: StringUtil,
    private router: Router,
    private casoStorageService: CasoStorageService
  ) { }


  obtenerMetodoCaso() {
    this.mostrarModalVerAcumulacionesCaso();
  }

  private mostrarModalVerAcumulacionesCaso() {
    const ref = this.dialogService.open(AcumulacionesCasoComponent, {
      showHeader: false,
      styleClass: 'p-dialog--lg',
      data: {
        casoFiscal: this.casoFiscal,
      }
    });
  }


  getBotonClase() {
    const classes: any = {};
    if (this.casoFiscal.flgPrincipioOportunidad === '1') {
      classes['boton-etiqueta boton-etiqueta--purple-dark'] = true;
    }
    if (this.casoFiscal.flgAcuerdoReparatorio === '1') {
      classes['boton-etiqueta boton-etiqueta--green-dark'] = true;
    }
    return classes;
  }

  public abrirDesacumulacion() {
    const refModal = this.dialogService.open(DesacumulacionModalComponent, {
      width: '80%',
      showHeader: false,
      data: {
        coCasoPadre: this.casoFiscal.codigoCasoPadreAcumulacion,
        coCasoAcumulado: this.casoFiscal.numeroCaso,
        idCasoAcumulado: this.casoFiscal.idCaso,
      }
    });
  }

  public abrirPlazosYPagos() {
    this.casoStorageService.setearSesionStorageCaso(this.casoFiscal);
    this.casoStorageService.setearTabDetalle('4');
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(this.casoFiscal.idEtapa)}/caso/${this.casoFiscal.idCaso}`
    this.router.navigate([`${ruta}`])
  }

}
