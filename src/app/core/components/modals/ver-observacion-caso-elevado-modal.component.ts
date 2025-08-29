import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EncabezadoModalComponent } from '@components/modals/encabezado-modal/encabezado-modal.component';
import { NumeroCasoComponent } from '@components/numero-caso/numero-caso.component';
import { ElevacionObservado } from '@interfaces/reusables/elevacion-actuados/elevacionObservado';
import { formatoCampoPipe } from '@pipes/formato-campo.pipe';
import { ReusablesCargarDocumentos } from '@services/reusables/reusable-cargar-documentos.service';
import { ElevacionActuadoObservadosService } from '@services/superior/elevacion-actuados/elevacion-actuado-observados.service';
import { obtenerIcono } from '@utils/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { DateMaskModule } from '@directives/date-mask.module';
import { VisorEfeService } from '@services/visor/visor.service';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-ver-observacion-caso-elevado-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    InputTextareaModule,
    formatoCampoPipe,
    ButtonModule,
    EncabezadoModalComponent,
    NumeroCasoComponent,
    NgxExtendedPdfViewerModule,
    CheckboxModule,
    TabsViewComponent,
    TabViewModule,
    CalendarModule,
    InputTextModule,
    AccordionModule,
    CmpLibModule,
    ScrollPanelModule,
    DateMaskModule,
    SelectButtonModule,
    PaginatorModule,
  ],
  templateUrl: './ver-observacion-caso-elevado-modal.component.html',
})
export class VerObservacionCasoElevadoModalComponent {
  public numeroCaso: string = '';
  public idBandejaElevacion: string = '';
  public dataCaso: any = '';
  public idCaso: string = '';

  elevacionObservado!: ElevacionObservado;
  listaDocumentos: any = [];
  public pdfSrcBase64: string = '';

  private subscriptions: Subscription[] = [];
  constructor(
    public referenciaModal: DynamicDialogRef,
    private configuracion: DynamicDialogConfig,
    private fb: FormBuilder,
    private elevacionActuadoObservadosService: ElevacionActuadoObservadosService,
    private reusablesCargarDocumentos: ReusablesCargarDocumentos,
    private dataService: VisorEfeService
  ) {
    this.numeroCaso = this.configuracion.data?.numeroCaso;
    this.idBandejaElevacion = this.configuracion.data?.idBandejaElevacion;
    this.dataCaso = this.configuracion.data?.observacion;
    this.idCaso = this.configuracion.data?.idCaso;
  }

  ngOnInit(): void {
    this.obtenerElevacion(this.idBandejaElevacion);
    this.obtenerDocumentos(this.idCaso);
  }

  private obtenerElevacion(idBandejaElevacion: any): void {
    this.subscriptions.push(
      this.elevacionActuadoObservadosService
        .obtenerElevacionObservado(idBandejaElevacion)
        .subscribe({
          next: (resp) => {
            this.elevacionObservado = resp;
          },
          error: (error) => {
            console.log(error);
          },
        })
    );
  }

  obtenerDocumentos(idCaso: any): void {
    this.subscriptions.push(
      this.elevacionActuadoObservadosService
        .obtenerListadoDocumentosCasoObservados(idCaso)
        .subscribe({
          next: (resp) => {
            console.log('respues', resp);
            if (resp.length > 0) {
              this.listaDocumentos = resp;
            }
          },
        })
    );
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  visulizarPDFBase64(idDocumento: string) {
    this.dataService.getPDF64(idDocumento).subscribe((response) => {
      this.pdfSrcBase64 =
        'data:application/pdf;base64,' + response.data[0].archivo;
    });
  }
}
