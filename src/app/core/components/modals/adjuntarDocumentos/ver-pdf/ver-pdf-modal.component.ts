import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EncabezadoModalComponent } from '../../encabezado-modal/encabezado-modal.component';
import { DropdownModule } from "primeng/dropdown";
import { CheckboxModule } from "primeng/checkbox";
import { formatoCampoPipe } from '@pipes/formato-campo.pipe';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
import { TabViewModule } from 'primeng/tabview';
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ReusablesCargarDocumentos } from '@services/reusables/reusable-cargar-documentos.service';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MaestroService } from '@services/shared/maestro.service';
import { AlertaModalComponent } from '../../alerta-modal/alerta-modal.component';
import { AlertaData } from '@interfaces/comunes/alert';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  standalone: true,
  selector: 'ver-pdf-modal',
  templateUrl: './ver-pdf-modal.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    EncabezadoModalComponent,
    CheckboxModule,
    formatoCampoPipe,
    CommonModule,
    ButtonModule,
    CalendarModule, RadioButtonModule,
    TabsViewComponent,
    TabViewModule,
    CmpLibModule,
    DialogModule,
    DividerModule,
    DynamicDialogModule,
    InputTextModule,
    MenuModule,
    MessagesModule,
    TableModule,
    ToastModule,
  ]
})
export class verPdfModalComponent implements OnInit, OnDestroy {

  public subscriptions: Subscription[] = []
  public idDocumento;
  pdfUrl: any;

  constructor(
    private dialogRef: DynamicDialogRef,
    private cargarDocumentosService: ReusablesCargarDocumentos,
    public config: DynamicDialogConfig,
    public maestros: MaestroService,
    private dialogService: DialogService,
    public referenciaModal: DynamicDialogRef,
    protected _sanitizer: DomSanitizer
  ) {
    this.idDocumento = this.config.data.idDocumento;
  }


  async ngOnInit() {
    let nroDocumento = this.idDocumento
    await this.cargarDocumentosService.verPdf(nroDocumento).subscribe({
      next: resp => {
        console.log("data");
        console.log(resp)
        if (resp.code === 200) {
          this.pdfUrl = this._sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${String(resp.data[0].archivo)}`);
        } else if (resp.code == 204) {
          this.mensajeError("Aviso", "Documento sin contenido")
        }
      }
    })

  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre)
  }

  exportarDocumentos() {

  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }


  get closeIcon(): string {
    return 'assets/icons/close.svg'
  }

  close() {
    this.dialogRef.close();
  }

  mensajeError(mensaje:any, submensaje:any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      }
    } as DynamicDialogConfig<AlertaData>)
  }

}
