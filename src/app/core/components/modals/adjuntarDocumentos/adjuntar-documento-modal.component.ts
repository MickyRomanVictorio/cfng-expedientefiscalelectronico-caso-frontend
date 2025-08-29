// import { CommonModule } from '@angular/common';
// import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { AlertaData } from '@interfaces/comunes/alert';
// import { Tab } from '@interfaces/comunes/tab';
// import { ReusablesCargarDocumentos } from '@services/reusables/reusable-cargar-documentos.service';
// import { MaestroService } from '@services/shared/maestro.service';
// import { TabsViewComponent } from '@components/tabs-view/tabs-view.component';
// import { obtenerIcono } from '@utils/icon';
// import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
// import { ButtonModule } from 'primeng/button';
// import { CalendarModule } from 'primeng/calendar';
// import { CheckboxModule } from 'primeng/checkbox';
// import { DialogModule } from 'primeng/dialog';
// import { DividerModule } from 'primeng/divider';
// import { DropdownModule } from 'primeng/dropdown';
// import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
// import { InputTextModule } from 'primeng/inputtext';
// import { InputTextareaModule } from 'primeng/inputtextarea';
// import { MenuModule } from 'primeng/menu';
// import { MessagesModule } from 'primeng/messages';
// import { RadioButtonModule } from 'primeng/radiobutton';
// import { TableModule } from 'primeng/table';
// import { TabViewModule } from 'primeng/tabview';
// import { ToastModule } from 'primeng/toast';
// import { Subscription } from 'rxjs';
// import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
// import { verPdfModalComponent } from './ver-pdf/ver-pdf-modal.component';

import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, OnChanges } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TabsViewComponent } from "@core/components/tabs-view/tabs-view.component";
import { AlertaData } from "@core/interfaces/comunes/alert";
import { Tab } from "@core/interfaces/comunes/tab";
import { ReusablesCargarDocumentos } from "@core/services/reusables/reusable-cargar-documentos.service";
import { MaestroService } from "@core/services/shared/maestro.service";
import { obtenerIcono } from "@core/utils/icon";
import { CmpLibModule } from "dist/cmp-lib";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import { DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { DynamicDialogModule, DynamicDialogRef, DynamicDialogConfig, DialogService } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MenuModule } from "primeng/menu";
import { MessagesModule } from "primeng/messages";
import { RadioButtonModule } from "primeng/radiobutton";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { ToastModule } from "primeng/toast";
import { Subscription } from "rxjs";
import { AlertaModalComponent } from "../alerta-modal/alerta-modal.component";
import { verPdfModalComponent } from "./ver-pdf/ver-pdf-modal.component";

@Component({
  standalone: true,
  selector: 'adjuntar-documento-modal',
  templateUrl: './adjuntar-documento-modal.component.html',
  styleUrls: ['./adjuntar-documento-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
    CalendarModule,
    RadioButtonModule,
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
  ],
})
export class AdjuntardocumentoModalComponent implements OnInit, OnDestroy, OnChanges {
  public subscriptions: Subscription[] = [];
  public idCaso;
  listaDocumentos: any = [];
  listaTipoDocumentos: any = [];
  public documentosSeleccionados: any = [];
  ref!: DynamicDialogRef;
  verBuscar: boolean = true;
  tipoDocumentoSeleccionado: string = '';
  constructor(
    private readonly dialogRef: DynamicDialogRef,
    private readonly cargarDocumentosService: ReusablesCargarDocumentos,
    private readonly config: DynamicDialogConfig,
    private readonly maestros: MaestroService,
    private readonly dialogService: DialogService,
    private referenciaModal: DynamicDialogRef
  ) {
    this.idCaso = this.config.data.idCaso;
  }

  public tabs: Tab[] = [
    {
      titulo: 'Principal ',
      ancho: 210,
    },
    {
      titulo: 'Cuadernos incidentales',
      ancho: 210,
    },
    {
      titulo: 'Cuadernos',
      ancho: 255,
    },
    {
      titulo: 'Carpeta de ejecución',
      ancho: 198,
    },
    {
      titulo: 'Carpeta auxiliar',
      ancho: 198,
    },
  ];
  public indexActivo: number = 0;

  async ngOnInit() {
    this.obtenerListaDocumentos();
    this.obtenerListaTipoDocumentos();
  }

  private timeout?: number;
  textoBuscar: any;

  onInput(value: string): void {
    window.clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => {
      this.actualizarListaDocumentos(value);
    }, 700);
  }

  ngOnChanges(changes: any) {
    this.tipoDocumentoSeleccionado = changes.originalEvent.srcElement.innerText
      .toString()
      .trim();
  }

  buscarPorTipoDoc() {
    if (typeof this.tipoDocumentoSeleccionado == 'undefined') {
      this.mensajeError('Aviso:', 'Debe seleccionar un tipo documento');
      return;
    }

    if (this.tipoDocumentoSeleccionado.length > 0) {
      let documentoSel: any[] = [];

      this.listaDocumentos.forEach((documento: any) => {
        if (documento.actoProcesal >= this.tipoDocumentoSeleccionado) {
          documentoSel.push(documento);
        }
      });
      this.listaDocumentos = documentoSel;
    }
  }

  actualizarListaDocumentos(textoBuscar: any) {
    this.listaDocumentos = this.listaDocumentos.filter((item: any) =>
      Object.values(item).some(
        (fieldValue: any) =>
          (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
          fieldValue
            ?.toString()
            ?.toLowerCase()
            .includes(textoBuscar?.toLowerCase())
      )
    );
  }

  eventoMostrarOcultarFiltros() {
    if (this.verBuscar) {
      this.verBuscar = false;
    } else {
      this.verBuscar = true;
    }
  }

  public icono(nombre: string): any {
    return obtenerIcono(nombre);
  }

  private obtenerListaDocumentos(): void {
    this.subscriptions.push(
      this.cargarDocumentosService
        .obtenerListadoDocumentos(this.idCaso)
        .subscribe({
          next: (resp) => {
            if (resp.code === 1) {
              this.listaDocumentos = resp.data;
            }
          },
        })
    );
  }

  verDocumentoPdf(documento: any) {
    this.ref = this.referenciaModal = this.dialogService.open(
      verPdfModalComponent,
      {
        showHeader: false,
        data: { idDocumento: documento.idDocumento },
      }
    );
    this.ref.onClose.subscribe((respuesta) => { });
  }

  private obtenerListaTipoDocumentos(): void {
    this.subscriptions.push(
      this.maestros.getTipoDocumentoPerfil(1).subscribe({
        next: (resp) => {
          if (resp.code === 200) {
            this.listaTipoDocumentos = resp.data;
          }
        },
      })
    );
  }

  exportarDocumentos() {
    if (this.documentosSeleccionados.length == 0) {
      this.mensajeError('Aviso:', 'Debe seleccionar un item');
      return;
    }
    let listaDocumentosEnviar: any[] = [];

    this.referenciaModal = this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: `Confirmar adjuntar los documentos seleccionados`,
        description: ``,
        confirmButtonText: 'Confirmar',
        confirm: true,
      },
    } as DynamicDialogConfig<AlertaData>);

    this.referenciaModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.documentosSeleccionados.forEach((x: any) => {
            let objDocumento = { idDocumento: x.idDocumento };
            listaDocumentosEnviar.push(objDocumento);
          });
          this.dialogRef.close(JSON.stringify(listaDocumentosEnviar));
        }
      },
    });
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  get closeIcon(): string {
    return 'assets/icons/close.svg';
  }

  close() {
    this.dialogRef.close();
  }

  mensajeError(mensaje: any, submensaje: any) {
    this.dialogService.open(AlertaModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'error',
        title: mensaje,
        description: submensaje,
        confirmButtonText: 'OK',
      },
    } as DynamicDialogConfig<AlertaData>);
  }
}
