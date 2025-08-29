import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { IconAsset } from 'ngx-cfng-core-lib';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';

import { CommonModule } from '@angular/common';
import { HistorialTramite } from '@components/modals/historial-tramite-modal/HistorialTramite';
import { BandejaTramite } from '@interfaces/provincial/bandeja-tramites/BandejaTramite';
import {
  CfeDialogRespuesta,
  NgxCfngCoreModalDialogService,
} from '@ngx-cfng-core-modal/dialog';
import { ReusableHistorialTramiteService } from '@services/reusables/reusable-historial-tramite.service';
import { IconUtil, StringUtil } from 'ngx-cfng-core-lib';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorComponent } from '@core/components/generales/paginator/paginator.component';
import { ReusableDetalleFirmaService } from '@core/services/reusables/reusable-detalle-firma.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-visor-ver-detalle-modal',
  templateUrl: './modal-ver-detalle-firmas.component.html',
  imports: [
    EncabezadoModalComponent,
    CmpLibModule,
    SharedModule,
    TableModule,
    CommonModule,
    ButtonModule,
    PaginatorComponent,
  ],
  providers: [NgxCfngCoreModalDialogService],
})
export class ModalVerDetalleFirmasComponent {
  tituloModal: SafeHtml | undefined = 'Detalle de firmas';
  subTituloModal: SafeHtml | undefined = undefined;
  cargandoTabla: boolean = false;
  public subscriptions: Subscription[] = [];
  public idDocumento: string;
  detalleFirmas: any[] = []; 

  constructor(
    protected iconAsset: IconAsset,
    private referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private sanitizador: DomSanitizer,
    private reusableHistorialTramiteService: ReusableHistorialTramiteService,
    private reusableDetalleFirmaService: ReusableDetalleFirmaService,
    private dialogService: DialogService,
    protected stringUtil: StringUtil,
    protected iconUtil: IconUtil,
    private modalDialogService: NgxCfngCoreModalDialogService,
    public config: DynamicDialogConfig,
  ) {
    this.idDocumento = this.config.data.idDocumento;
    // this.numeroCaso = this.configuracion.data?.numeroCaso;
  }


  ngOnInit(): void {
   
    this.obtenerDetalleFirma();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  private obtenerDetalleFirma(): void {
    console.log("el id docum", this.idDocumento)
    this.cargandoTabla = true;
   // this.spinner.show();
    this.subscriptions.push(
      this.reusableDetalleFirmaService
        .verDetalleFirma(this.idDocumento)
        .subscribe({
          next: (resp) => {
            console.log(resp);
            
            this.detalleFirmas = resp.map((item: any) => ({
              ...item,
              expandido: false,
            }));

            this.cargandoTabla = false;
         //   this.detalles = resp;
      //      this.spinner.hide();
          },
          error: (error) => {
            console.error('Error al obtener el detalle de firmas', error);
            this.cargandoTabla = false;
        //    this.spinner.hide();            
          },
        })
    );
  }
  toggleDetalle(index: number): void {
    this.detalleFirmas[index].expandido = !this.detalleFirmas[index].expandido;
  }
  public cerrarModal(): void {
    this.referenciaModal.close();
  }
}
