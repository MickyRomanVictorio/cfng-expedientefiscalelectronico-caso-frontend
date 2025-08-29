import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BandejaDocumentosVisorService } from '@services/provincial/documentos-ingresados/bandeja-documentos.service';
import { ElevacionActuadosService } from '@services/provincial/consulta-casos/detalle-tramite/elevacion-actuados';
import { ReusablesCargarDocumentos } from '@services/reusables/reusable-cargar-documentos.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-elevacion-actuados',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './elevacion-actuados.component.html',
  styleUrls: ['./elevacion-actuados.component.scss']
})

export class ElevacionActuadosComponent {
  titulo:string = '';
  public pdfUrl: any;
  public idCaso: any;
  public idTipoOrgJuri: any;
  datosDependencias: any[] = [];
  divDisposicionElevacion!: boolean;
  divSolicitudElevacion!: boolean;
  btnElevar!: boolean;
  data: string  = '';

  constructor(
    // public referenciaModal: DynamicDialogRef,
    // private dialogRef: DynamicDialogRef,
    // public config: DynamicDialogConfig,
    // private dialogService: DialogService,
    //private fb: FormBuilder,
    private bandejaDocumentosVisorService: BandejaDocumentosVisorService,
    private cargarDocumentosService: ReusablesCargarDocumentos,
    protected _sanitizer: DomSanitizer,
    protected elevacion: ElevacionActuadosService
  )
  {
    this.data = this.elevacion.getTramite();
    if(this.data === "SOLICITUD DE ELEVACIÓN DE ACTUADOS"){
      this.idCaso = this.elevacion.getIdCaso();
      this.solicitudElevacion(this.idCaso);
    }
    if(this.data === "DISPOSICIÓN DE ELEVACIÓN DE ACTUADOS"){
      this.idCaso = this.elevacion.getIdCaso();
      this.disposicionElevacion(this.idCaso);
    }
  }

  solicitudElevacion(idCaso:any){
    this.elevacion.validarElevacion(idCaso).subscribe({
      next: resp => {
        console.log("resp", resp);
        switch (resp) {
          case 0:
            console.log("Validación correcta");
            this.verDocumentopdf(this.idCaso);
            break;
          default:
            console.log("Validación no procesa");
            break;
        }
      }
    })
  }

  verDocumentopdf(item:any) {
    console.log("ver archivo pdf")
    console.log(item)
    let nroDocumento = '0BC8FDAF562968CAE0650250569D508A';
    this.cargarDocumentosService.verPdf2(nroDocumento).subscribe({
      next: resp => {
        console.log(resp.code)
        if (resp.code === 200) {
          this.divSolicitudElevacion = true;
          console.log(resp.data[0].archivo)
          this.pdfUrl = this._sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${String(resp.data[0].archivo)}`);

        } else if (resp.code == 204) {
          alert("Aviso\nDocumento sin contenido")
        }
      }
    })
  }

  disposicionElevacion(idTipoOrgJuri:any){
    this.elevacion.listarDependencias(idTipoOrgJuri).subscribe({
      next: resp => {
        console.log("resp", resp)
        this.datosDependencias = resp;
        this.divDisposicionElevacion = true;
        this.btnElevar = true;
      }
    })
  }

  registrarElevacion(){
    this.elevacion.registrarElevacion(this.idCaso).subscribe({
      next: resp => {
        console.log("Registro exitoso")
      }
    })
  }


  // mensajeError(mensaje, submensaje) {
  //   this.dialogService.open(AlertaModalComponent, {
  //     width: '600px',
  //     showHeader: false,
  //     data: {
  //       icon: 'error',
  //       title: mensaje,
  //       description: submensaje,
  //       confirmButtonText: 'OK',
  //     }
  //   } as DynamicDialogConfig<AlertaData>)
  // }
}
