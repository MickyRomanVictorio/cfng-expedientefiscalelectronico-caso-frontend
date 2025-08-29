import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DatePipe, NgIf, NgOptimizedImage } from "@angular/common";
import { Button, ButtonDirective } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { TooltipModule } from "primeng/tooltip";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { TableModule } from "primeng/table";
import { CheckboxModule } from "primeng/checkbox";
import { VisorPdfFrameComponent } from "@components/generales/visor-pdf-frame/visor-pdf-frame.component";
import {
  AdjuntarArchivoManualComponent
} from "@components/modals/fuente-investigacion/adjuntar-archivo-manual/adjuntar-archivo-manual.component";
import { PaginatorComponent } from "@components/generales/paginator/paginator.component";
import {
  VisorArchivoComponent
} from "@components/modals/visor-efe-modal/visor-archivo/visor-archivo/visor-archivo.component";
import { ArchivoAdjunto } from "@interfaces/reusables/fuentes-investigacion/ArchivoAdjunto";
import { obtenerIcono } from '@utils/icon';
import { formatoPesoArchivo } from '@utils/file';
import { CapitalizePipe } from "@pipes/capitalize.pipe";
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { IconAsset, IconUtil } from 'ngx-cfng-core-lib';
import { ReusableFuentesInvestigacionService } from "@services/reusables/reusable-fuentes-investigacion.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Expediente } from "@utils/expediente";
import { format } from "date-fns";
import { ID_OAID, TIPO_DOCUMENTO } from "@constants/constants";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-cargar-documento',
  standalone: true,
  imports: [
    Button,
    ButtonDirective,
    CalendarModule,
    DropdownModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    TooltipModule,
    VisorPdfFrameComponent,
    CmpLibModule,
    AdjuntarArchivoManualComponent,
    CapitalizePipe,
    DatePipe,
    TableModule,
    NgOptimizedImage,
    CheckboxModule,
    PaginatorComponent
  ],
  templateUrl: './cargar-archivo.component.html',
  styleUrl: './cargar-archivo.component.scss'
})
export class CargarArchivoComponent implements OnInit, OnDestroy {

  constructor(
    public config: DynamicDialogConfig,
    protected dialogRef: DynamicDialogRef,
    protected iconUtil: IconUtil,
    protected iconAsset: IconAsset,
    private reusableFuentesInvestigacionService: ReusableFuentesInvestigacionService,
    private spinner: NgxSpinnerService,
  ) {
  }

  archivoAdjunto: ArchivoAdjunto = {
    isSelect: false, file: null
  };
  
  public suscripciones: Subscription[] = [];


  @ViewChild(AdjuntarArchivoManualComponent) childComponent?: AdjuntarArchivoManualComponent;
  mostrarTamanoError: boolean = false;
  mensajeErrorTamano: string = '';
  emptyFilterMessage = false;
  @ViewChild('visorArchivoContainer', { read: ViewContainerRef })
  protected visorArchivoContainerRef!: ViewContainerRef;
  protected visor: VisorArchivoComponent | null = null;
  protected archivoParaAgregar = true;
  protected form!: FormGroup;
  protected archivosAdjuntos: ArchivoAdjunto[] = [];
  protected obtenerIcono = obtenerIcono;
  protected formatoPesoArchivo = formatoPesoArchivo;
  protected idMovimientoCaso!: string;
  private caso!: Expediente;

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  ngOnInit(): void {
    this.caso = this.config.data;
    this.obtenerIdMovimientoCaso(this.caso.idCaso);
  }

  onSelect(event: ArchivoAdjunto) {
    this.archivoAdjunto = event;
    this.archivoParaAgregar = false;
    console.log('archivo: ', this.archivoAdjunto);
  }

  removeFileAttach() {
    this.childComponent?.selectedFileToUndefined();
    this.archivoParaAgregar = true;
  }

  eliminarArchivoModal(archivo: any) {
    const index = this.archivosAdjuntos.findIndex(
      (archivoAdjunto) => archivoAdjunto.file === archivo.file
    );
    if (index !== -1) this.archivosAdjuntos.splice(index, 1);
  }

  eventoSeleccionarParaGuardar() {
    console.log("archivosAdjuntos : ", this.archivosAdjuntos);
  }

  protected eventoAgregar(): void {
    if (this.validarTamanoArchivo(this.archivoAdjunto.file!.size)) {
      return;
    } else {
      this.archivosAdjuntos.push(<ArchivoAdjunto>{ ...this.archivoAdjunto });
      this.removeFileAttach();
    }

  }

  protected activarBtnAgregar(): boolean {
    return this.archivoParaAgregar;
  }

  protected eventoGuardar(): void {
    this.emptyFilterMessage = false;
    this.spinner.show();
    console.log('idCaso : ', this.caso.idCaso)
    // this.obtenerIdMovimientoCaso(this.caso.idCaso);

    console.log('this.idMovimientoCaso : ', this.idMovimientoCaso)

    if (this.idMovimientoCaso) {
      console.log('Archivos a enviar');
      for (let archivo of this.archivosAdjuntos) {
        if (archivo.isSelect) {
          const formData = new FormData();

          console.log('idCaso')
          console.log(this.caso)

          formData.append('archivo', archivo.file!);
          formData.append('idMovimientoCaso', this.idMovimientoCaso);
          formData.append('idTipoDocumento', TIPO_DOCUMENTO.UNKNOWN);
          formData.append('feCreacion', format(new Date(), 'dd/MM/yyyy'));
          formData.append('idOaid', ID_OAID.UNKNOWN);
          formData.append('nuDocumento', archivo.file!.name);
          formData.append('esDocumento', '1');

          console.log('formData archivo: ', formData.get('archivo'));
          console.log('formData idMovimientoCaso: ', formData.get('idMovimientoCaso'));
          console.log('formData idTipoDocumento: ', formData.get('idTipoDocumento'));
          console.log('formData feCreacion: ', formData.get('feCreacion'));
          console.log('formData idOaid: ', formData.get('idOaid'));
          console.log('formData nuDocumento: ', formData.get('nuDocumento'));
          console.log('formData esDocumento: ', formData.get('esDocumento'));

          this.reusableFuentesInvestigacionService.guardarDocumentoRepositorio(formData)
            .subscribe({
              next: resp => {
                console.log(resp)
              },
              error: (error) => {
                this.emptyFilterMessage = true;
                this.spinner.hide();
                console.log(error);
              }
            });

        }
      }
    }

    this.spinner.hide()
  }

  protected activarBtnGuardar(): boolean {
    return !this.archivosAdjuntos.some(archivo => archivo.isSelect)
  }

  private validarTamanoArchivo(tamano: number): boolean {
    if (tamano > 100 * 1048576) {
      this.mostrarTamanoError = true;
      this.mensajeErrorTamano = 'El archivo no puede exceder los 100 MB';
      setTimeout(() => {
        this.mostrarTamanoError = false;
      }, 5000);

      return true;
    }
    return false;
  }

  private obtenerIdMovimientoCaso(idCaso: string): void {
    console.log('obtenerIdMovimientoCaso')
    this.suscripciones.push(
      this.reusableFuentesInvestigacionService.obtenerIdMovimientoCaso(idCaso).subscribe({
        next: resp => {
          console.log('resp.data : ', resp.data)
          this.idMovimientoCaso = Object.values({ ...resp.data }).join('');
          console.log('this.idMovimientoCaso : ', this.idMovimientoCaso);
        },
        error: (error) => {
          this.emptyFilterMessage = true;
          this.spinner.hide();
          console.log(error);
        }
      })
    )
  }

}


