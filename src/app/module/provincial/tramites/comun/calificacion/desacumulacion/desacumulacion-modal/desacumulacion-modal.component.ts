import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TramiteProcesal} from "@core/interfaces/comunes/tramiteProcesal";
import {Subscription} from "rxjs";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {TramiteService} from "@services/provincial/tramites/tramite.service";
import {DomSanitizer} from "@angular/platform-browser";
import {NgxSpinnerService} from "ngx-spinner";
import {CmpLibModule} from "ngx-mpfn-dev-cmp-lib";
import {
  Desacumulacion
} from "@interfaces/provincial/tramites/comun/calificacion/desacumulacion/desacumulacion.interface";
import {Router} from "@angular/router";
import {ACTO_TRAMITE_ESTADO, IconUtil} from 'ngx-cfng-core-lib';
import {
  ActoProcesalComponent
} from '@modules/provincial/expediente/expediente-detalle/detalle-tramite/acto-procesal/acto-procesal.component';
import {DesacumulacionService} from "@services/provincial/desacumulacion/desacumulacion.service";
import {NgxCfngCoreModalDialogModule, NgxCfngCoreModalDialogService} from '@ngx-cfng-core-modal/dialog';

@Component({
  selector: 'app-desacumulacion-modal',
  standalone: true,
  imports: [CommonModule, CmpLibModule, ActoProcesalComponent, NgxCfngCoreModalDialogModule],
  templateUrl: './desacumulacion-modal.component.html',
  styleUrls: ['./desacumulacion-modal.component.scss']
})
export class DesacumulacionModalComponent implements OnInit {

  protected coCasoPadre;
  protected coCasoAcumulado;
  private idCasoAcumulado;
  protected tramiteDesacumulacion!: TramiteProcesal;
  public datosExtraFormulario: Desacumulacion = {};
  public suscripciones: Subscription[] = [];
  protected utilIcon: IconUtil = new IconUtil;

  constructor(
    private referenciaModal: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private tramiteService: TramiteService,
    private desacumulacionService: DesacumulacionService,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private router: Router,
    private readonly modalDialogService: NgxCfngCoreModalDialogService
  ) {
    this.coCasoPadre = this.config.data.coCasoPadre;
    this.coCasoAcumulado = this.config.data.coCasoAcumulado;
    this.idCasoAcumulado = this.config.data.idCasoAcumulado;
  }

  ngOnInit(): void {
    this.validaDesacumulacion();
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(suscripcion => suscripcion.unsubscribe())
  }

  private establecerTramiteDesacumulacion() {
    this.datosExtraFormulario.idCasoPadre = this.coCasoPadre;
    this.datosExtraFormulario.idCasoAAcumular = this.idCasoAcumulado;
    this.obtenerTramite(ACTO_TRAMITE_ESTADO.DISPOSICION_DESACUMULACION);
  }

  get tramiteEstablecido(): boolean {
    return this.tramiteDesacumulacion !== undefined;
  }

  private obtenerTramite(idActoTramiteEstado: string) {
    this.spinner.show();
    this.suscripciones.push(
      this.tramiteService.obtenerActoTramiteEstado(idActoTramiteEstado).subscribe({
        next: resp => {
          this.tramiteDesacumulacion = resp;
          this.spinner.hide();
        },
        error: error => {
          this.spinner.hide();
          console.log(error)
        }
      })
    );
  }

  protected formatearCodigoCaso(codigoCaso: string) {
    codigoCaso = `${codigoCaso}-0`
    const partes = codigoCaso.split('-');
    if (partes.length > 3) {
      return this.sanitizer.bypassSecurityTrustHtml(`${partes[0]}-<span style="color:orange" >${partes[1]}-${partes[2]}</span>-${partes[3]}`)
    }
    return codigoCaso;
  }

  private recargarPagina() {
    const url = this.router.url.split('?')[0];
    this.router.navigateByUrl('/app', {skipLocationChange: true}).then(() => {
      this.router.navigate([url]);
    });
  }

  public cerrarModal(): void {
    this.recargarPagina();
    this.referenciaModal.close();
  }

  private validaDesacumulacion() {
    console.log('***A');

    this.suscripciones.push(
      this.desacumulacionService.validar(this.idCasoAcumulado).subscribe({
        next: resp => {
          this.establecerTramiteDesacumulacion();
        },
        error: error => {
          this.spinner.hide();
          this.modalDialogService.error(
            'Desacumulación',
            error.error.message,
            'Aceptar'
          );
        }
      })
    );

  }
}
