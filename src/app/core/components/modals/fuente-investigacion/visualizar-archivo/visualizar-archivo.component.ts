import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Button} from "primeng/button";
import {
  TipoArchivo,
  VisorArchivoComponent
} from "@components/modals/visor-efe-modal/visor-archivo/visor-archivo/visor-archivo.component";
import {obtenerIcono} from "@utils/icon";
import {IconUtil} from 'ngx-cfng-core-lib';
import {CmpLibModule} from 'ngx-mpfn-dev-cmp-lib';
import {Archivo} from "@interfaces/comunes/detalle-fuente-investigacion";
import {Subscription} from "rxjs";
import {ReusableFuentesInvestigacionService} from "@services/reusables/reusable-fuentes-investigacion.service";

@Component({
  selector: 'app-visualizar-documento',
  standalone: true,
  imports: [
    Button,
    VisorArchivoComponent,
    CommonModule,
    CmpLibModule
  ],
  templateUrl: './visualizar-archivo.component.html',
  styleUrl: './visualizar-archivo.component.scss'
})
export class VisualizarArchivoComponent implements OnInit, OnDestroy {

  public suscripciones: Subscription[] = [];
  protected archivo: Archivo | undefined;
  protected urlArchivoVisualizar: string | undefined;
  protected readonly obtenerIcono = obtenerIcono;

  constructor(
    public config: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    protected iconUtil: IconUtil,
    private reusableFuentesInvestigacionService: ReusableFuentesInvestigacionService,
  ) {
  }

  ngOnInit(): void {
    this.archivo = this.config.data;
    console.log("Archivo : ", this.archivo);
    this.setUrlArchivoVisualizar(this.archivo);
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach((s) => s.unsubscribe());
  }

  public cerrarModal(): void {
    this.dialogRef.close();
  }

  public setUrlArchivoVisualizar(archivo: Archivo | undefined): void {
    this.urlArchivoVisualizar = this.reusableFuentesInvestigacionService.getUrlVisualizar(archivo!.idArchivo, archivo!.nombreArchivo);
    // this.urlArchivoVisualizar = 'http://cfms-generales-almacenamiento-objetos-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/generales/objetos/v2/t/almacenamiento/privado/visualizar?archivoId=9286386c-4f7f-4715-92f1-1a1c0a427acd&nombreArchivo=OFICIO%20PRUEBA%20NIKOL%2013052024.pdf';
    console.log('idArchivo : ', archivo!.idArchivo);
    console.log('nombreArchivo : ', archivo!.nombreArchivo);
    console.log('this.urlArchivoVisualizar : ', this.urlArchivoVisualizar);
  }

  public getTipoArchivo(tipo: string | undefined): TipoArchivo {
    switch (tipo) {
      case 'documento':
        return TipoArchivo.Documento;
      case 'audio':
        return TipoArchivo.Audio;
      case 'video':
        return TipoArchivo.Video;
      case 'imagen':
        return TipoArchivo.Imagen;
      default:
        return TipoArchivo.Ninguno;
    }
  }

  public getUrlArchivoVisualizar(): string {
    return <string>this.urlArchivoVisualizar;
  }

}
