import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AcumulacionesCasoComponent } from '../../acumulaciones-caso/acumulaciones-caso.component';
import { DesacumulacionModalComponent } from "@modules/provincial/tramites/comun/calificacion/desacumulacion/desacumulacion-modal/desacumulacion-modal.component";
import { obtenerRutaParaEtapa } from '@utils/utils';
import { Router } from '@angular/router';
import { CasoStorageService } from '@services/shared/caso-storage.service';
import { StringUtil } from 'ngx-cfng-core-lib';
import { PerfilJerarquia } from '@core/models/usuario-auth.model';
import { ConsultaCasosGestionService } from '@core/components/consulta-casos/services/consulta-casos-gestion.service';
import { CasoFiscal } from '@core/components/consulta-casos/models/listar-casos.model';
import { ObservacionProvincialComponent } from '../observacion-provincial/observacion-provincial.component';

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

  @Input() casoFiscal!: CasoFiscal;

  public perfilJerarquia = input<PerfilJerarquia>(PerfilJerarquia.Provincial);
  protected PerfilJerarquia = PerfilJerarquia;
  protected referenciaModal!: DynamicDialogRef;

  constructor(
    private readonly dialogService: DialogService,
    protected readonly stringUtil: StringUtil,
    private readonly router: Router,
    private readonly casoStorageService: CasoStorageService,
    protected readonly consultaCasosGestionService:ConsultaCasosGestionService
  ) { }

  protected obtenerMetodoCaso() {
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
  protected getBotonClase() {
    const classes: any = {};
    if (this.casoFiscal.flgPrincipioOportunidad === '1') {
      classes['boton-etiqueta boton-etiqueta--purple-dark'] = true;
    } else if (this.casoFiscal.flgAcuerdoReparatorio === '1') {
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
    const ruta = `app/administracion-casos/consultar-casos-fiscales/${obtenerRutaParaEtapa(this.casoFiscal.idEtapa!)}/caso/${this.casoFiscal.idCaso}`
    this.router.navigate([`${ruta}`])
  }

  protected eventoVerObservacionesProv(event: Event, caso:CasoFiscal):void{
    event.stopPropagation();
    this.referenciaModal = this.dialogService.open(ObservacionProvincialComponent, {
      width: '40rem',
      showHeader: false,
      contentStyle: { "padding": 0 },
      data: {
        caso:caso
       }
    });

  }
}
