import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DetalleFirma } from '@interfaces/reusables/detalle-firma/detalle-firma.interface';
import { ReusableDetalleFirmaService } from '@services/reusables/reusable-detalle-firma.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { NgxSpinnerService } from 'ngx-spinner';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
//import {obtenerCasoHtml} from "@core/utils/utils";

@Component({
  standalone: true,
  selector: 'app-detalle-firma',
  templateUrl: './detalle-firma.component.html',
  imports: [CmpLibModule, TableModule, NgClass],
})
export class DetalleFirmaComponent implements OnInit {
  public titulo;
  public idDocumentoVersiones;

  public tituloModal: SafeHtml | undefined = undefined;
  public obtenerIcono = obtenerIcono;
  public subscriptions: Subscription[] = [];

  public detalles: DetalleFirma[] = [];

  constructor(
    public referenciaModal: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private reusableDetalleFirmaService: ReusableDetalleFirmaService,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService
  ) {
    this.titulo = this.config.data.titulo;
    this.idDocumentoVersiones = this.config.data.idDocumentoVersiones;
  }

  ngOnInit(): void {
    this.obtenerTituloModal();
    this.obtenerDetalleFirma();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private obtenerTituloModal(): void {
    this.tituloModal = this.sanitizer.bypassSecurityTrustHtml(this.titulo);
  }

  private obtenerDetalleFirma(): void {
    this.spinner.show();
    this.subscriptions.push(
      this.reusableDetalleFirmaService
        .verDetalleFirma(this.idDocumentoVersiones)
        .subscribe({
          next: (resp) => {
            this.detalles = resp;
            this.spinner.hide();
          },
          error: (error) => {
            this.spinner.hide();
            console.log(error);
          },
        })
    );
  }

  obtenerDetalleHtml(detalleFirma: DetalleFirma) {
    let detalle;
    if (detalleFirma.tipoAccionFirma === 'VISADO') {
      detalle = `<span class="cfe-semi-bold">Detalles del visado: </span>Fecha y hora del visado <span class="cfe-semi-bold">${detalleFirma.fechaHoraFirma}</span>`;
    } else {
      detalle = `<span class="cfe-semi-bold">Detalles de la firma: </span>Fecha y hora del firmado <span class="cfe-semi-bold">${detalleFirma.fechaHoraFirma}</span>`;
    }
    return this.sanitizer.bypassSecurityTrustHtml(detalle);
  }

  public iconSvg(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public cerrarModal(): void {
    this.referenciaModal.close();
  }
}
